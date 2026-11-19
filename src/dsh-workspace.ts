import { mkdir, readdir, readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { seedWorkspaceRegistry, sessionUpdatedAt, switchWorkspaceRegistry, workspaceSessionIds } from "./util";

/**
 * Give first-time users a ready workspace instead of an empty picker. Only
 * touches a registry that is still empty, so a returning user's list is never
 * rewritten.
 */
export async function ensureDefaultWorkspace(dshHome: string, workspaceDir: string): Promise<boolean> {
  const registry = await readRegistry(dshHome);
  if (registry === undefined) return false;
  const next = seedWorkspaceRegistry(registry.existing, await registryEntry(workspaceDir));
  if (!next) return false;
  await writeRegistry(registry.file, next);
  return true;
}

/**
 * Register the folder the user just opened and make it the one the Harness UI
 * lands on. Must run while dsh is stopped: its in-memory registry is
 * authoritative and would overwrite the file. Returns the workspace and its
 * most recently active live session (null when it has none, so the caller
 * creates one), or null when the registry could not be updated.
 */
export async function switchWorkspace(
  dshHome: string,
  workspaceDir: string,
): Promise<{ workspaceId: string; sessionId: string | null } | null> {
  const registry = await readRegistry(dshHome);
  if (registry === undefined) return null;
  const entry = await registryEntry(workspaceDir);
  const recency = await sessionRecency(dshHome, workspaceSessionIds(registry.existing, entry.path));
  const next = switchWorkspaceRegistry(registry.existing, entry, recency);
  if (!next) return null;
  await writeRegistry(registry.file, next.registry);
  return { workspaceId: next.workspaceId, sessionId: next.sessionId };
}

/** Last-activity times dsh lists sessions by: its projection cache, else the event log's mtime. */
async function sessionRecency(dshHome: string, sessionIds: string[]): Promise<Record<string, number>> {
  const recency: Record<string, number> = {};
  if (sessionIds.length === 0) return recency;
  const logRoot = path.join(dshHome, "sessions");
  const cwdDirs = await readdir(logRoot).catch(() => [] as string[]);
  await Promise.all(
    sessionIds.map(async (id) => {
      const cached = path.join(dshHome, "storages", "session_projcache", "sessions", `${id}.json`);
      const fromCache = sessionUpdatedAt(await readFile(cached, "utf8").then(parseJson, () => null));
      if (fromCache !== undefined) {
        recency[id] = fromCache;
        return;
      }
      for (const dir of cwdDirs) {
        const sessionDir = path.join(logRoot, dir, id);
        const log = (await readdir(sessionDir).catch(() => [] as string[])).find((name) => /^session\.v\d+\.jsonl/.test(name));
        if (!log) continue;
        const info = await stat(path.join(sessionDir, log)).catch(() => null);
        if (info) recency[id] = info.mtimeMs;
        return;
      }
    }),
  );
  return recency;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function readRegistry(dshHome: string): Promise<{ file: string; existing: unknown } | undefined> {
  const file = path.join(dshHome, "storages", "workspace.json");
  try {
    return { file, existing: JSON.parse(await readFile(file, "utf8")) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { file, existing: null };
    return undefined;
  }
}

async function registryEntry(workspaceDir: string): Promise<{ id: string; path: string; title: string; now: string }> {
  const canonical = await realpath(workspaceDir).catch(() => workspaceDir);
  return {
    id: randomUUID(),
    path: canonical,
    title: path.basename(canonical) || "DeepSeek",
    now: new Date().toISOString(),
  };
}

async function writeRegistry(file: string, registry: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  await rename(temp, file);
}
