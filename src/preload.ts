import { contextBridge, ipcRenderer } from "electron";
import type { DesktopSettings } from "./util";

// Runs before the Harness UI's scripts, so its persisted selection already
// points at the workspace the user just opened when it restores.
try {
  const selection = ipcRenderer.sendSync("harness:take-selection");
  if (selection) localStorage.setItem("dsh.sessions.current", JSON.stringify(selection));
} catch {
  // Not the Harness UI, or storage unavailable: the UI keeps its own restore.
}

contextBridge.exposeInMainWorld("desktop", {
  onStatus: (handler: (payload: { phase: string; text: string }) => void) => {
    ipcRenderer.on("status", (_event, payload) => handler(payload));
  },
  onLog: (handler: (line: string) => void) => {
    ipcRenderer.on("log", (_event, line) => handler(String(line)));
  },
  getSettings: (): Promise<DesktopSettings> => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings: DesktopSettings): Promise<DesktopSettings> => ipcRenderer.invoke("settings:save", settings),
  pickDir: (): Promise<string> => ipcRenderer.invoke("settings:pick-dir"),
  apply: () => ipcRenderer.send("settings:apply"),
  quit: () => ipcRenderer.send("splash:quit"),
});
