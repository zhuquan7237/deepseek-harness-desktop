import { spawn } from "node:child_process";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import { createHarnessSession, stopHarness } from "./harness";

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

describe("createHarnessSession", () => {
  async function fakeDsh(reply: (request: { rpcId: string; method: string; payload: unknown }) => unknown) {
    const calls: { cookie?: string; body: { rpcId: string; method: string; payload: unknown } }[] = [];
    const server = createServer((req, res) => {
      if (req.method === "GET" && req.url === "/?token=t0k") {
        res.writeHead(303, { location: "./", "set-cookie": "dsh-auth-x=signed; Path=/; HttpOnly" }).end();
        return;
      }
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => {
        if (req.method !== "POST" || req.url !== "/api/session/create" || req.headers.cookie !== "dsh-auth-x=signed") {
          res.writeHead(401).end();
          return;
        }
        const body = JSON.parse(raw);
        calls.push({ cookie: req.headers.cookie, body });
        res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(reply(body)));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/?token=t0k`;
    return { url, calls, close: () => new Promise((resolve) => server.close(resolve)) };
  }

  it("signs in with the launch token and creates a session in the workspace", async () => {
    const dsh = await fakeDsh((req) => ({
      type: "server-response",
      rpcId: req.rpcId,
      result: { ok: true, value: { sessionId: "session-new" } },
    }));
    try {
      expect(await createHarnessSession(dsh.url, "ws-archived-only")).toBe("session-new");
      expect(dsh.calls[0].body).toMatchObject({
        type: "client-request",
        method: "session/create",
        payload: { args: { request: { workspaceId: "ws-archived-only" } } },
      });
    } finally {
      await dsh.close();
    }
  });

  it("rejects an RPC failure or a bad sign-in", async () => {
    const dsh = await fakeDsh((req) => ({
      type: "server-response",
      rpcId: req.rpcId,
      result: { ok: false, error: { code: "x", message: "no such workspace", details: {} } },
    }));
    try {
      await expect(createHarnessSession(dsh.url, "missing")).rejects.toThrow("no such workspace");
      await expect(createHarnessSession(dsh.url.replace("t0k", "bad"), "ws")).rejects.toThrow("without a cookie");
    } finally {
      await dsh.close();
    }
  });
});
