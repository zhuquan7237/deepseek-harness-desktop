import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ensureDefaultWorkspace, switchWorkspace } from "./dsh-workspace";

describe("Open Workspace registry switch", () => {
  let root: string;
  let dshHome: string;
  const registryFile = () => path.join(dshHome, "storages", "workspace.json");
  const readRegistry = async () => JSON.parse(await readFile(registryFile(), "utf8"));

  beforeEach(async () => {
    root = await realpath(await mkdtemp(path.join(tmpdir(), "dsh-workspace-")));
    dshHome = path.join(root, "dsh-home");
    await mkdir(path.join(root, "DeepSeek"));
    await mkdir(path.join(root, "picked"));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("makes the picked folder the workspace the UI opens after first-run seeding", async () => {
    expect(await ensureDefaultWorkspace(dshHome, path.join(root, "DeepSeek"))).toBe(true);
    // A second seed never rewrites a used registry, so before the fix the picked folder never appeared.
    expect(await ensureDefaultWorkspace(dshHome, path.join(root, "picked"))).toBe(false);

    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ sessionId: null });
    const registry = await readRegistry();
    const [first, second] = registry.global.workspaceIds;
    expect(registry.tables.workspaces[first]).toMatchObject({ path: path.join(root, "picked"), title: "picked" });
    expect(registry.tables.workspaces[second]).toMatchObject({ path: path.join(root, "DeepSeek") });
  });

  it("reopens the newest session when switching back to a used folder", async () => {
    await mkdir(path.dirname(registryFile()), { recursive: true });
    await writeFile(
      registryFile(),
      JSON.stringify({
        unit: { name: "workspace", version: 2 },
        global: { initialized: true, workspaceIds: ["a", "b"], archivedSessionIds: [] },
        tables: {
          workspaces: {
            a: { path: path.join(root, "DeepSeek"), title: "DeepSeek", sessionIds: ["s1"], createdAt: "x", updatedAt: "x" },
            b: { path: path.join(root, "picked"), title: "picked", sessionIds: ["s3", "s2"], createdAt: "x", updatedAt: "x" },
          },
        },
      }),
    );
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ sessionId: "s3" });
    expect((await readRegistry()).global.workspaceIds).toEqual(["b", "a"]);
  });

  it("leaves an unreadable registry alone", async () => {
    await mkdir(path.dirname(registryFile()), { recursive: true });
    await writeFile(registryFile(), "{not json");
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toBeNull();
    expect(await readFile(registryFile(), "utf8")).toBe("{not json");
  });
});
