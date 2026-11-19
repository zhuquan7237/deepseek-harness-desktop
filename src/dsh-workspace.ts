import { mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { seedWorkspaceRegistry, switchWorkspaceRegistry } from "./util";

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
 * authoritative and would overwrite the file. Returns the session the UI should
 * reopen, or null when the registry could not be updated.
 */
export async function switchWorkspace(
  dshHome: string,
  workspaceDir: string,
): Promise<{ sessionId: string | null } | null> {
  const registry = await readRegistry(dshHome);
  if (registry === undefined) return null;
  const next = switchWorkspaceRegistry(registry.existing, await registryEntry(workspaceDir));
  if (!next) return null;
  await writeRegistry(registry.file, next.registry);
  return { sessionId: next.sessionId };
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
