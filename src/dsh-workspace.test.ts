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

  const writeRegistryFile = async (sessions: { b: string[] }, archivedSessionIds: string[] = []) => {
    await mkdir(path.dirname(registryFile()), { recursive: true });
    await writeFile(
      registryFile(),
      JSON.stringify({
        unit: { name: "workspace", version: 2 },
        global: { initialized: true, workspaceIds: ["a", "b"], archivedSessionIds },
        tables: {
          workspaces: {
            a: { path: path.join(root, "DeepSeek"), title: "DeepSeek", sessionIds: ["s1"], createdAt: "x", updatedAt: "x" },
            b: { path: path.join(root, "picked"), title: "picked", sessionIds: sessions.b, createdAt: "x", updatedAt: "x" },
          },
        },
      }),
    );
  };

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("makes the picked folder the workspace the UI opens after first-run seeding", async () => {
    expect(await ensureDefaultWorkspace(dshHome, path.join(root, "DeepSeek"))).toBe(true);
    // A second seed never rewrites a used registry, so before the fix the picked folder never appeared.
    expect(await ensureDefaultWorkspace(dshHome, path.join(root, "picked"))).toBe(false);

    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toMatchObject({ sessionId: null });
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
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ workspaceId: "b", sessionId: "s3" });
    expect((await readRegistry()).global.workspaceIds).toEqual(["b", "a"]);
  });

  it("reopens the most recently active session after the user reordered them", async () => {
    await writeRegistryFile({ b: ["s-old", "s-new", "s-log"] });
    const cache = path.join(dshHome, "storages", "session_projcache", "sessions");
    await mkdir(cache, { recursive: true });
    const projection = (createdAt: number, lastPromptAt: number | null) =>
      JSON.stringify({ record: { identity: { createdAt }, rows: { sessionListMetadata: { val: { lastPromptAt } } } } });
    await writeFile(path.join(cache, "s-old.json"), projection(1_000, 2_000));
    await writeFile(path.join(cache, "s-new.json"), projection(1_500, 9_000));
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ workspaceId: "b", sessionId: "s-new" });

    // Without a cache entry the event log's mtime stands in.
    const logDir = path.join(dshHome, "sessions", "--picked--", "s-log");
    await mkdir(logDir, { recursive: true });
    await writeFile(path.join(logDir, "session.v4.jsonl.zstd"), "");
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ workspaceId: "b", sessionId: "s-log" });
  });

  it("reports no session for a folder whose sessions are all archived", async () => {
    await writeRegistryFile({ b: ["s-archived"] }, ["s-archived"]);
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toEqual({ workspaceId: "b", sessionId: null });
    const registry = await readRegistry();
    expect(registry.tables.workspaces.b.sessionIds).toEqual(["s-archived"]);
    expect(registry.global.archivedSessionIds).toEqual(["s-archived"]);
  });

  it("leaves an unreadable registry alone", async () => {
    await mkdir(path.dirname(registryFile()), { recursive: true });
    await writeFile(registryFile(), "{not json");
    expect(await switchWorkspace(dshHome, path.join(root, "picked"))).toBeNull();
    expect(await readFile(registryFile(), "utf8")).toBe("{not json");
  });
});
