import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dshBin, ensureHarness } from "./harness";
import { runCapture } from "./node-runtime";
import { DEFAULT_SETTINGS, DSH_PACKAGE } from "./util";

vi.mock("./node-runtime", () => ({ runCapture: vi.fn() }));

const runtime = { node: "node", npm: "npm", npmCli: null, version: "v22.23.2" };
const settings = { ...DEFAULT_SETTINGS, lastHarnessVersion: "0.1.0" };
const registryError = new TypeError("fetch failed");
const fetchMock = vi.fn<typeof fetch>();
const npm = vi.mocked(runCapture);
const log = vi.fn();
let harnessRoot: string;

async function cacheEngine(version: string, withBin = true) {
  const prefix = path.join(harnessRoot, version);
  const bin = dshBin(prefix);
  await mkdir(path.dirname(bin), { recursive: true });
  await writeFile(path.join(prefix, "node_modules", DSH_PACKAGE, "package.json"), JSON.stringify({ version }));
  if (withBin) await writeFile(bin, "");
  return { version, prefix, bin };
}

beforeEach(async () => {
  harnessRoot = await mkdtemp(path.join(tmpdir(), "dsh-cache-"));
  vi.resetAllMocks();
  vi.stubGlobal("fetch", fetchMock.mockRejectedValue(registryError));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await rm(harnessRoot, { recursive: true, force: true });
});

describe("ensureHarness", () => {
  it.each(["latest", "next"])("uses the last cached engine when the %s lookup fails", async (channel) => {
    const cached = await cacheEngine("0.1.0");
    await cacheEngine("0.2.0");

    await expect(ensureHarness({ ...settings, channel }, runtime, harnessRoot, log)).resolves.toEqual(cached);
    expect(npm).not.toHaveBeenCalled();
  });

  it("uses the newest valid cache entry when the last used engine is incomplete", async () => {
    await cacheEngine("0.1.0", false);
    await cacheEngine("0.2.0-rc.2");
    const cached = await cacheEngine("0.2.0-rc.10");
    await cacheEngine("0.2.0", false);

    await expect(ensureHarness(settings, runtime, harnessRoot, log)).resolves.toEqual(cached);
  });

  it("preserves the registry error when there is no usable cache", async () => {
    await cacheEngine("0.1.0", false);

    await expect(ensureHarness(settings, runtime, harnessRoot, log)).rejects.toBe(registryError);
  });

  it("still uses the published version when the registry is reachable", async () => {
    await cacheEngine("0.1.0");
    const published = await cacheEngine("0.2.0");
    fetchMock.mockResolvedValue(Response.json({ version: published.version }));

    await expect(ensureHarness(settings, runtime, harnessRoot, log)).resolves.toEqual(published);
    expect(npm).not.toHaveBeenCalled();
  });

  it("retains the old engine if npm cannot finish installing a published update", async () => {
    const cached = await cacheEngine("0.1.0");
    const withoutHistory = { ...settings, lastHarnessVersion: "" };
    fetchMock.mockResolvedValue(Response.json({ version: "0.2.0" }));
    npm.mockImplementation(async () => {
      await cacheEngine("0.2.0");
      throw registryError;
    });

    await expect(ensureHarness(withoutHistory, runtime, harnessRoot, log)).resolves.toEqual(cached);
  });

  it("does not substitute another cached version for a pinned version", async () => {
    await cacheEngine("0.1.0");
    npm.mockRejectedValue(registryError);

    await expect(ensureHarness({ ...settings, channel: "0.2.0" }, runtime, harnessRoot, log)).rejects.toBe(registryError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports the registry error rather than silently falling back during an explicit update", async () => {
    await cacheEngine("0.1.0");

    await expect(ensureHarness(settings, runtime, harnessRoot, log, { allowCachedFallback: false }))
      .rejects.toBe(registryError);
  });
});
