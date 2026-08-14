<div align="center">

<img src="https://raw.githubusercontent.com/zhuquan7237/zhuquan7237.github.io/main/assets/deepseek-whale.png" width="96" alt="DeepSeek" />

# DeepSeek Harness Desktop

**基于官方 DeepSeek Harness 打造的 Electron 桌面端**

Windows · Linux · macOS 开箱即用。引擎从 npm 安装官方 [`@deepseek-ai/dsh`](https://github.com/deepseek-ai/deepseek-harness)，不整仓拷贝官方源码。

[![Release](https://img.shields.io/github/v/release/zhuquan7237/zhuquan7237.github.io?include_prereleases&label=release)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/zhuquan7237/zhuquan7237.github.io/total)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)
[![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-4d6bfe)](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-2EA44F)](LICENSE)

[主页 / 下载](https://dsh.zhuquan.xyz) ·
[和其他桌面版](https://dsh.zhuquan.xyz/compare.html) ·
[最新安装包](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest) ·
[Windows](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-win.exe) ·
[Linux](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-linux-x64.tar.gz) ·
[macOS](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-mac-arm64.dmg) ·
[源码](https://github.com/zhuquan7237/zhuquan7237.github.io/tree/main/desktop)

<img src="https://dsh.zhuquan.xyz/assets/desktop-preview.png" alt="DeepSeek Harness 桌面版 0.1.12：默认皮肤「深海女仆工坊」" width="920" />

</div>

## 主要功能

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Desktop</h3>
      <p>把官方 DeepSeek Harness 的本地 Web UI 带到原生窗口。自动准备 Node、启动 dsh、记住工作区。Windows / Linux / macOS（含 Intel Mac）都有安装包。</p>
    </td>
    <td width="50%" valign="top">
      <h3>官方引擎，不整仓拷贝</h3>
      <p>工具、插件、Plan/Agent、Web UI 都来自 npm 上的 <code>@deepseek-ai/dsh</code>。官方发新版时，菜单「检查 Harness 更新」即可，不必等别人再同步一份 fork。</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>皮肤中心</h3>
      <p>默认「深海女仆工坊」已打进安装包，离线也能用，不用再从 GitHub 拉。右上角鲸鱼按钮可换皮，也可从文件夹或 GitHub 地址导入。</p>
    </td>
    <td width="50%" valign="top">
      <h3>国内网络与旧配置</h3>
      <p>中文系统或中国时区默认走国内 npm 镜像。从旧桌面版升级时，会尽量把 API 密钥和设置接过来。</p>
    </td>
  </tr>
</table>

## Download

安装包发在 Pages 仓库的 GitHub Releases。这个仓库是给 GitHub 搜索用的名字：**DeepSeek Harness Desktop**。请认准作者 **zhuquan7237**。产品主页：https://dsh.zhuquan.xyz

| OS | File |
| --- | --- |
| Windows | [DeepSeek-0.1.12-win.exe](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-win.exe) |
| Linux x64 | [tar.gz](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-linux-x64.tar.gz) · [deb](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-linux-amd64.deb) |
| macOS | [Apple Silicon dmg](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-mac-arm64.dmg) · [Intel dmg](https://github.com/zhuquan7237/zhuquan7237.github.io/releases/download/desktop-v0.1.12/DeepSeek-0.1.12-mac-x64.dmg) |

Latest: https://github.com/zhuquan7237/zhuquan7237.github.io/releases/latest  
Homepage: https://dsh.zhuquan.xyz

请用 **0.1.12**。不要用 0.1.0–0.1.11。

Linux:

```sh
tar -xzf DeepSeek-0.1.12-linux-x64.tar.gz
./DeepSeek-0.1.12-linux-x64/DeepSeek
```

macOS 提示「已损坏」不是安装包坏了：把 App 拖到「应用程序」后，终端运行 `xattr -cr /Applications/DeepSeek.app`。说明：https://dsh.zhuquan.xyz/mac.html

首次启动需要联网大约 1–3 分钟（下载 Node 和官方 dsh）。默认皮肤已打进安装包，不用再从 GitHub 拉。API Key 在官方界面里填写，或打开 [platform.deepseek.com](https://platform.deepseek.com)。从旧桌面版升级时，会尽量把 `%AppData%\DeepSeek`（以及更早的 `深度求索` / `~/.dsh`）里的密钥和配置接过来。中文系统或中国时区会默认走国内 npm 镜像。

## 和其他社区桌面版怎么选

搜「DeepSeek Harness Desktop」会看到好几个同名仓库。有的把官方源码整仓拷进自己的 GitHub，星标涨得快，但引擎更新要等他们再同步。这个项目只做薄壳。对照：https://dsh.zhuquan.xyz/compare.html

| | 这个桌面版 | 整仓拷贝官方源码的桌面版 |
| --- | --- | --- |
| 引擎 | 每次从 npm 装官方 `@deepseek-ai/dsh` | 仓库里那份拷贝 |
| 系统 | Windows、Linux、macOS（Apple Silicon + Intel） | 常见只有 macOS Apple Silicon 和 Windows |
| 默认皮肤 | 打进安装包 | 看各项目 |
| 旧版 API Key | 0.1.12 尽量从旧目录接过来 | 看各项目 |

## Skins

打开软件后的宫殿大厅和双女仆，就是默认皮肤「深海女仆工坊」。**这套画面不是我画的。** 谢谢三位作者把这样完整的世界交出来。

0.1.12 把默认皮肤打进安装包，并尽量继承旧版 API 密钥。对话窗口右上角鲸鱼按钮可快速换皮，也可从文件夹或 GitHub 地址导入。

**默认皮肤**是 [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale) 的「深海女仆工坊」，CC BY-NC-SA 4.0，**禁止商用**。署名链：一创 [上善](https://www.pixiv.net/users/62155430) → 二创 [ZipZipPipe](https://www.pixiv.net/users/18604994) → 三创 Small-tailqwq。完整致谢：https://dsh.zhuquan.xyz/#skin

## What this is

A thin **Electron desktop shell** around official DeepSeek Harness (`dsh` / `@deepseek-ai/dsh`):

1. Double-click installers for Windows, Linux, and macOS (x64 and arm64)
2. On launch it prepares Node and installs official `@deepseek-ai/dsh` from npm
3. The official UI runs in a native window, with shortcuts, icons, workspace, and Chinese menus

This is **not** a fork of [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness). Tools, plugins, Plan/Agent, and settings all come from the official engine. **Harness → 检查 Harness 更新** updates the engine without reinstalling the desktop app.

Author: [Zhu Quan / 朱泉](https://dsh.zhuquan.xyz/me.html), Guangdong Ocean University (Materials Science).

## Source and issues

| What | Where |
| --- | --- |
| Product site | https://dsh.zhuquan.xyz |
| Compare | https://dsh.zhuquan.xyz/compare.html |
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

DeepSeek Harness Desktop, DeepSeek Harness 桌面版, DeepSeek Harness 桌面端, dsh desktop, dsh Windows, DeepSeek Harness download, DeepSeek Harness Linux, DeepSeek Harness macOS, `@deepseek-ai/dsh`, Electron DeepSeek.
