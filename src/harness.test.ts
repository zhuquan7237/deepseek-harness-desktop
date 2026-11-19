import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";
import { stopHarness } from "./harness";

describe("stopHarness", () => {
  it("waits for dsh to exit before resolving", async () => {
    const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"]);
    await new Promise((resolve) => child.once("spawn", resolve));
    await stopHarness({ process: child, url: "http://127.0.0.1:1", version: "test" });
    expect(child.exitCode !== null || child.signalCode !== null).toBe(true);
  });

  it("ignores a missing or already stopped engine", async () => {
    await expect(stopHarness(null)).resolves.toBeUndefined();
  });
});
