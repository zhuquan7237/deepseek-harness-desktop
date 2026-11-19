import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NodeRuntime } from "./node-runtime";
import { runCapture } from "./node-runtime";
import {
  DSH_PACKAGE,
  NPM_REGISTRY,
  compareVersions,
  npmInvocation,
  npmSpec,
  parseDshWebUrl,
  type DesktopSettings,
} from "./util";

export interface HarnessInstall {
  version: string;
  bin: string;
  prefix: string;
}

export interface RunningHarness {
  process: ChildProcess;
  url: string;
  version: string;
}

export async function fetchPublishedVersion(registry: string, channel: string): Promise<string> {
  const url = `${registry.replace(/\/$/, "")}/${DSH_PACKAGE}/${channel}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`npm registry ${response.status} for ${url}`);
  const data = (await response.json()) as { version?: string };
  if (!data.version) throw new Error(`No version in registry response for ${channel}`);
  return data.version;
}

export async function readInstalledVersion(prefix: string): Promise<string | null> {
  try {
    const pkg = JSON.parse(
      await readFile(path.join(prefix, "node_modules", DSH_PACKAGE, "package.json"), "utf8"),
    ) as { version?: string };
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

export function dshBin(prefix: string): string {
  return path.join(prefix, "node_modules", DSH_PACKAGE, "lib", "bin.js");
}

async function readCachedHarness(prefix: string): Promise<HarnessInstall | null> {
  const version = await readInstalledVersion(prefix);
  if (!version) return null;
  const bin = dshBin(prefix);
  const entry = await stat(bin).catch(() => null);
  return entry?.isFile() ? { version, bin, prefix } : null;
}

async function findCachedHarness(
  harnessRoot: string,
  lastVersion: string,
  failedVersion?: string,
): Promise<HarnessInstall | null> {
  const entries = await readdir(harnessRoot, { withFileTypes: true }).catch(() => []);
  const versions = entries.filter((entry) => entry.isDirectory() && entry.name !== failedVersion)
    .map((entry) => entry.name)
    .sort((a, b) => compareVersions(b, a));
  const preferred = versions.indexOf(lastVersion);
  if (preferred > 0) versions.unshift(...versions.splice(preferred, 1));

  for (const version of versions) {
    const cached = await readCachedHarness(path.join(harnessRoot, version));
    if (cached?.version === version) return cached;
  }
  return null;
}

export async function ensureHarness(
  settings: DesktopSettings,
  runtime: NodeRuntime,
  harnessRoot: string,
  onLog: (line: string) => void,
  { allowCachedFallback = true }: { allowCachedFallback?: boolean } = {},
): Promise<HarnessInstall> {
  if (settings.localHarnessDir) {
    const localBin = path.join(settings.localHarnessDir, "apps", "cli", "lib", "bin.js");
    const pkgPath = path.join(settings.localHarnessDir, "apps", "cli", "package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf8")) as { version?: string };
    onLog(`使用本地 Harness：${settings.localHarnessDir}（${pkg.version ?? "unknown"}）`);
    return { version: pkg.version ?? "local", bin: localBin, prefix: settings.localHarnessDir };
  }

  const { channel } = settings;
  const registry = settings.registry || NPM_REGISTRY;
  const floating = channel === "latest" || channel === "next";
  async function useCacheOrThrow(error: unknown, failedVersion?: string): Promise<HarnessInstall> {
    if (floating && allowCachedFallback) {
      const cached = await findCachedHarness(harnessRoot, settings.lastHarnessVersion, failedVersion);
      if (cached) {
        onLog(`无法从 npm 更新引擎，正在使用缓存版本 ${cached.version}`);
        return cached;
      }
    }
    throw error;
  }

  let wanted = channel.replace(/^@?deepseek-ai\/dsh@?/, "") || channel;
  if (floating) {
    try {
      wanted = await fetchPublishedVersion(registry, channel);
    } catch (error) {
      return useCacheOrThrow(error);
    }
  }
  const prefix = path.join(harnessRoot, wanted);
  const installed = await readCachedHarness(prefix);
  if (installed?.version === wanted) {
    onLog(`引擎 ${wanted} 已安装，跳过下载`);
    return installed;
  }
  if (installed && !settings.autoUpdateHarness && compareVersions(installed.version, wanted) >= 0) {
    onLog(`保留已安装的引擎 ${installed.version}（已关闭自动更新）`);
    return installed;
  }

  onLog(`正在从 npm 安装 ${DSH_PACKAGE}@${wanted}`);
  await rm(prefix, { recursive: true, force: true });
  await mkdir(prefix, { recursive: true });
  await writeFile(
    path.join(prefix, "package.json"),
    JSON.stringify({ name: "dsh-engine", private: true, version: "0.0.0" }, null, 2),
  );
  const npm = npmInvocation(runtime, [
    "install",
    npmSpec(wanted),
    "--omit=dev",
    "--no-fund",
    "--no-audit",
    "--registry",
    registry,
  ]);
  try {
    await runCapture(
      npm.command,
      npm.args,
      prefix,
      {
        PATH: `${path.dirname(runtime.node)}${path.delimiter}${process.env.PATH ?? ""}`,
        npm_config_update_notifier: "false",
        npm_config_registry: registry,
      },
      onLog,
    );
  } catch (error) {
    await rm(prefix, { recursive: true, force: true }).catch(() => undefined);
    return useCacheOrThrow(error, wanted);
  }
  const version = (await readInstalledVersion(prefix)) ?? wanted;
  onLog(`引擎 ${version} 已就绪`);
  return { version, bin: dshBin(prefix), prefix };
}

export async function startHarnessWeb(options: {
  runtime: NodeRuntime;
  install: HarnessInstall;
  workspaceDir: string;
  dshHome: string;
  onLog: (line: string) => void;
}): Promise<RunningHarness> {
  await mkdir(options.dshHome, { recursive: true });
  await mkdir(options.workspaceDir, { recursive: true });
  options.onLog(`正在启动 dsh web（${options.install.version}）`);
  const { ELECTRON_RUN_AS_NODE: _electronNode, ...baseEnv } = process.env;
  const child = spawn(options.runtime.node, [options.install.bin, "web", "--host", "127.0.0.1", "--port", "0"], {
    cwd: options.workspaceDir,
    env: {
      ...baseEnv,
      DSH_HOME: options.dshHome,
      PATH: `${path.dirname(options.runtime.node)}${path.delimiter}${process.env.PATH ?? ""}`,
    },
    windowsHide: true,
  });

  let buffer = "";
  const url = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("等待 Harness 界面超时。请检查网络后重试，或查看下方日志。"));
    }, 120_000);
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      buffer += text;
      for (const line of text.split(/\r?\n/)) {
        if (line.trim()) options.onLog(line.trim());
      }
      const found = parseDshWebUrl(buffer);
      if (found) {
        clearTimeout(timer);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve(found);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timer);
        reject(new Error(`dsh exited ${code}\n${buffer.slice(-2000)}`));
      }
    });
  });

  return { process: child, url, version: options.install.version };
}

export function stopHarness(running: RunningHarness | null): void {
  if (!running?.process.pid) return;
  running.process.kill("SIGTERM");
}
