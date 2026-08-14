<div align="center">

<img src="https://raw.githubusercontent.com/zhuquan7237/zhuquan7237.github.io/main/assets/deepseek-whale.png" width="96" alt="DeepSeek" />

# DeepSeek Harness Desktop

**DeepSeek Harness 桌面版 / dsh desktop** — Windows · Linux · macOS

下载就能用的 Codex 式编程助手。引擎是官方 [`@deepseek-ai/dsh`](https://github.com/deepseek-ai/deepseek-harness)，不用 `git clone`。

[![Release](https://img.shields.io/github/v/release/zhuquan7237/zhuquan7237.github.io?include_prereleases&label=release)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/zhuquan7237/zhuquan7237.github.io/total)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)
[![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-4d6bfe)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)

[主页 / 下载](https://zhuquan7237.github.io) ·
[最新安装包](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest) ·
[Windows](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-win.exe) ·
[Linux tar.gz](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-linux-x64.tar.gz) ·
[macOS Apple Silicon](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-mac-arm64.dmg) ·
[源码](https://github.com/zhuquan7237/zhuquan7237.github.io/tree/main/desktop)

<img src="https://zhuquan7237.github.io/assets/desktop-preview.png" alt="DeepSeek Harness Desktop screenshot" width="920" />

</div>

## Download

安装包发在 Pages 仓库的 GitHub Releases。这个仓库是给 GitHub 搜索用的名字：**DeepSeek Harness Desktop**。

| OS | File |
| --- | --- |
| Windows | [DeepSeek-0.1.10-win.exe](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-win.exe) |
| Linux x64 | [tar.gz](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-linux-x64.tar.gz) · [deb](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-linux-amd64.deb) |
| macOS | [Apple Silicon dmg](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-mac-arm64.dmg) · [Intel dmg](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.10/DeepSeek-0.1.10-mac-x64.dmg) |

Latest: https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest  
Homepage: https://zhuquan7237.github.io

请用 **0.1.10**。不要用 0.1.0–0.1.9。

Linux:

```sh
tar -xzf DeepSeek-0.1.10-linux-x64.tar.gz
./DeepSeek-0.1.10-linux-x64/DeepSeek
```

首次启动需要联网大约 1–3 分钟（下载 Node、官方 dsh，以及默认皮肤）。API Key 在官方界面里填写，或打开 [platform.deepseek.com](https://platform.deepseek.com)。中文系统或中国时区会默认走国内 npm 镜像。

## Skins

0.1.10 加了皮肤中心：对话窗口右上角鱼鲸按钮可快速换皮，也可从文件夹或 GitHub 地址导入。

**默认皮肤**是 [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 的「深海女仆工坊」，CC BY-NC-SA 4.0，**禁止商用**。署名链：上善 → ZipZipPipe → Small-tailqwq。

## What this is

A thin **Electron desktop shell** around official DeepSeek Harness (`dsh` / `@deepseek-ai/dsh`):

1. Double-click installers for Windows, Linux, and macOS (x64 and arm64)
2. On launch it prepares Node and installs official `@deepseek-ai/dsh` from npm
3. The official UI runs in a native window, with shortcuts, icons, workspace, and Chinese menus

This is **not** a fork of [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness). Tools, plugins, Plan/Agent, and settings all come from the official engine. **Harness → 检查 Harness 更新** updates the engine without reinstalling the desktop app.

Author: [Zhu Quan / 朱泉](https://zhuquan7237.github.io/me.html), Guangdong Ocean University (Materials Science).

## Source and issues

| What | Where |
| --- | --- |
| Product site | https://zhuquan7237.github.io |
| Installers / Releases | https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest |
| Desktop source | https://github.com/zhuquan7237/zhuquan7237.github.io/tree/main/desktop |
| Issues | https://github.com/zhuquan7237/zhuquan7237.github.io/issues |

```sh
git clone https://github.com/zhuquan7237/zhuquan7237.github.io.git
cd zhuquan7237.github.io/desktop
npm install
npm start
```

## Keywords

DeepSeek Harness Desktop, DeepSeek Harness 桌面版, dsh desktop, dsh Windows, DeepSeek Harness download, DeepSeek Harness Linux, DeepSeek Harness macOS, `@deepseek-ai/dsh`, Codex DeepSeek, Electron DeepSeek.
