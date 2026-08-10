# Travel Guide —— 项目交接 & 续作手册

> 本目录是项目的「交接日志」。无论你是后来的同事、另一个 AI 工具，还是在其他设备上运行的 WorkBuddy，
> 读完本文件 + `STATUS.md` + `SETUP.md`，应当能清楚知道：**项目是什么、已经做到哪、下一步该干什么、有哪些坑。**
> 所有路径均为 Windows 绝对路径；命令在 `Git Bash` 或 `PowerShell` 中执行。

---

## 1. 这是什么

一个 **旅行攻略网站**（React + Vite + TypeScript + Tailwind + shadcn/ui 的 SPA），部署在 **Cloudflare Pages** 上。
核心特性：

- 游客：**只读**浏览攻略（构建期快照 + 静态兜底）。
- 管理员：**登录后**可在站内二次编辑、保存、删除攻略，内容写回独立的「内容仓库」，并触发站点重建。
- 攻略内容 **外部化**：存放在一个独立的公开 git 仓库，通过 Cloudflare Pages Functions（管理员写入）与构建期快照（游客读取）双向打通。

## 2. 目录结构（三个关键位置）

| 路径 | 作用 | Git 远程 |
| --- | --- | --- |
| `D:/Travel Guide App/travel-guide` | **主项目**（网站源码 + Pages Functions） | `git@github.com:heyxiaoze/travel-guide.git` （分支 `main`） |
| `D:/Travel Guide App/travel-guide-content` | **内容仓库**（公开）：`guides/<id>.json` + `guides/index.json` | `git@github.com:heyxiaoze/travel-guide-content.git` （分支 `main`） |
| `D:/Travel Guide App/work-log` | **本交接日志**（本文档所在目录） | 暂无（见第 6 节同步建议） |

> ⚠️ 目录已迁移：原 `C:/Documents/Travel Guide App` 已不再使用（权威路径为 `D:/Travel Guide App`）。旧的工作树备份已移至 `D:/Travel Guide App/_recycle_20260810/`（可恢复，不在仓库内）。`C:/Documents/Travel Guide App` 残留一份纯 `node_modules` 旧副本，因本环境 safe-delete 沙箱拦截删不掉，可无视（与仓库无关，纯可重建缓存）。

## 3. 当前状态速览（2026-08-10 末次更新）

- ✅ **Phase 0**：内容外部化（构建期快照 + 静态兜底）已完成。
- ✅ **Phase 1**：管理员鉴权 + Pages Functions 写回 已完成；并修复了两个会导致部署失败的 bug（见 `CHANGELOG.md`）。
- ✅ **Phase 2**：站内区块编辑器已完成（提交 `ff29efa`，已推送）。
- ✅ **UI BugFix（提交 `006dec4`，已推送）**：登录弹窗移出 header（createPortal）、LOGIN/LOGOUT 导航样式 + RollText 动画、首页动态统计。
- ✅ **编辑攻略白屏 BugFix（提交 `2bca48a`，已推送）**：`GuidePage.tsx` Rules-of-Hooks 违规导致点击「编辑攻略」白屏（React #300），已修复（early return 移到 useEffect 之后）。
- ✅ **本地环境已修复**：补装 win32 esbuild/rollup，`npm run dev` 可在本机跑（见 `SETUP.md` 雷区 #2）。
- 🔶 **Cloudflare Secrets 用户已添加（2026-08-10）**：4 个 Secret 已设置；**仍待用户在站点上线后实测**管理员登录 → 编辑 → 保存 → 内容仓库出现提交 → 站点重建（验证端到端闭环）。
- ⬜ **Phase 3**：历史版本（`/api/guide/history`）+ 技能上传（`/api/guide/upload`）+ 草稿拉取（`GET /api/guide/:id`）尚未开始（见 `ROADMAP.md`）。

## 4. 如何接手（接手者 / AI 的逐条清单）

1. 先读 `STATUS.md`（已完成 / 待办 / 锁定决策 / 风险）。
2. 再读 `SETUP.md`（仓库、Secrets、本地限制、部署、验证）。
3. **动 git 前必看 `SETUP.md` 的「环境雷区」**：本机有个后台同步工具会周期性删除 `.git`/`.workbuddy`，先确认工作树存在再操作。
4. 若要继续开发，从 `ROADMAP.md` 的「下一步」开始；不要推翻 `STATUS.md` 里「已锁定决策」。
5. 每完成一段，更新 `CHANGELOG.md` 与本文件的状态速览。

## 5. 文档导航

- `STATUS.md` —— 已完成 / 进行中 / 待办 / 锁定决策 / 风险（**最重要**）。
- `CHANGELOG.md` —— 按日期的工作记录（改了什么、为什么）。
- `SETUP.md` —— 环境搭建、Cloudflare Secrets、部署、验证、环境雷区。
- `ROADMAP.md` —— Phase 2 / Phase 3 详细计划与明确下一步。

## 6. 版本控制说明

本 `work-log` 目录**已并入主仓库 `travel-guide`**（即 `travel-guide/work-log/`，随主仓库一起 `git` 版本控制并推送到 `origin/main`）。
无需单独 `git init` 或建独立远程。其他设备 / AI 拉取 `travel-guide` 仓库即可获得最新交接文档。
> 注意：本目录路径已从独立的 `D:/Travel Guide App/work-log` 迁移为 `D:/Travel Guide App/travel-guide/work-log`（2026-08-10 末，应"并入现有 travel-guide 仓库"的决定）。
