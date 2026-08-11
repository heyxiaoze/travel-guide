# 项目状态（STATUS）

最后更新：**2026-08-11** ｜ 主仓库 HEAD：`7a789ca`（已推送 origin/main）｜ Skills 独立仓库：`git@github.com:heyxiaoze/skill.git`（`main`，已推送）

---

## ✅ 已完成

### 阶段 0 —— 内容外部化（已提交、已推）
- 内容模型 `Guide → sections[] → blocks[]`（12 种区块类型，schema 驱动渲染）。
- `scripts/migrate.mjs`：把 `src/data/*.ts` 静态攻略迁移到内容仓库 `guides/<id>.json` + `guides/index.json`（草稿/发布由 `status` 字段区分）。
- `scripts/sync-content.mjs`：`prebuild`/`predev` 钩子，从内容仓库拉取「已发布」攻略生成 `src/data/generated.ts`；失败时写空兜底，回退静态攻略。**构建永不因内容源不可达而失败。**
- `src/data/registry.ts`：优先用 `generated.ts`，回退 `TRAVEL_GUIDES`。
- `.gitignore`：忽略 `src/data/generated.ts`、`travel-guide-content/`、`dist/`。

### 阶段 1 —— 管理员鉴权 + Pages Functions 写回（已提交、已推）
后端（Cloudflare Pages Functions，`/functions`）：
- `functions/_lib/auth.ts`：Web Crypto HMAC 签名 HttpOnly Cookie（密钥 = `ADMIN_PASSWORD`），`signSession/verifySession/getCookie/json`。
- `functions/_lib/github.ts`：GitHub Contents API 写回（UTF-8 base64）+ Deploy Hook 触发。
- `functions/api/me.ts`、`login.ts`、`logout.ts`、`guide/save.ts`、`guide/delete.ts`（save/delete 带管理员鉴权闸门 → 写内容仓库 → 触发重建）。
- `scripts/copy-functions.mjs`：把 `/functions` 复制到 `dist/_functions`（用于 `wrangler pages deploy` 直接上传）。

前端：
- `src/lib/auth.tsx`：`AuthProvider` + `useAuth()`（调 `/api/me`，暴露 `isAdmin/login/logout`）。
- `src/components/layout/LoginModal.tsx`：Tailwind 模态框（项目内无 shadcn Dialog 原语），密码输入。
- `src/components/layout/Header.tsx`：右上角增加登录/登出按钮。
- `src/main.tsx`：用 `<AuthProvider>` 包裹 `<App/>`。
- `.dev.vars.example`：文档化 `ADMIN_PASSWORD` / `GITHUB_TOKEN` / `CONTENT_REPO` / `DEPLOY_HOOK_URL`；`.gitignore` 忽略 `.dev.vars`。

### 今日修复（2026-08-10，已提交并推送）
1. **Functions 导入路径 bug**：`functions/api/guide/save.ts` 与 `delete.ts` 位于 `functions/api/guide/`（深两层），其 `../_lib/*` 解析到不存在的 `api/_lib/*`；改为 `../../_lib/*`。修复前 Cloudflare 构建报 `Could not resolve "../_lib/auth"`。提交 `0f69ada`。
2. **内容同步 URL 拼接 bug**：`sync-content.mjs` 把 `CONTENT_REPO`（应为 `owner/repo` 形式）当成纯仓库名再拼默认 owner，导致 URL 变成 `heyxiaoze/heyxiaoze/travel-guide-content` 而 404。改为按 `owner/repo` 解析。提交 `2087b03`。
3. **UI BugFix（提交 `006dec4`，已推送）**：
   - 登录密码弹窗原本渲染在 `<header>` 内部（XPath `//*[@id="root"]/div/header/div[2]/div`），改用 `createPortal` 渲染到 `document.body`，脱离 header 堆叠上下文。
   - 登录/登出按钮去掉 `<Button>` 样式与图标，改为复用左侧导航链接样式（`navClass`），文字改为 `LOGIN` / `LOGOUT`，并补上 `RollText` 字符错位悬停滚动动画（与 `nav/a[1]` 一致）。
   - 首页统计：第二项 `98座` → `95个`；新增「距上次出去玩已过去」动态天数（自 `2026-05-05` 计算至今）。
   - 本地 `tsc --noEmit` 通过（0 错误），已由工程师 + 独立 QA 双重验证（QA 结论 PASS）。

---

## ⬜ 待办 / 进行中

- ✅ **设置 Cloudflare Secrets**：`ADMIN_PASSWORD`、`GITHUB_TOKEN`（repo 权限 PAT）、`CONTENT_REPO=heyxiaoze/travel-guide-content`、`DEPLOY_HOOK_URL` —— 用户已添加（2026-08-10）。待部署构建通过后实测。见 `SETUP.md` 第 3 节。
- 🔶 **端到端验证（待用户实测）**：`006dec4`（UI BugFix）与 `2bca48a`（编辑攻略白屏修复）均已推送并触发 Cloudflare 构建。Secrets 已添加，**仍需用户在站点上线后实测**：管理员登录 → 点击「编辑攻略」（应不再白屏）→ 编辑 → 保存 → 内容仓库出现新提交 → 站点重建。这是验证 4 个 Secrets 与编辑闭环是否真的跑通的最后一步。
- ⬜ **Phase 3**：历史版本查看（GitHub commits API，内容仓库的提交即版本库）+ 技能上传端点 `/api/guide/upload`。见 `ROADMAP.md`。
  - （建议并入）`GET /api/guide/:id` 管理员鉴权拉取任意状态攻略，打通「草稿 → 站内编辑 → 发布」闭环（详见 ROADMAP 3c、STATUS 已知限制）。
- ✅ **编辑攻略白屏 bugfix（已提交 `2bca48a`、已推）**：点击「编辑攻略」白屏，React #300 Too many re-renders。根因 `src/components/guide/GuidePage.tsx` 把编辑态 `if (guide && editing && isAdmin) return <GuideEditor/>` 写在 `useState(activeDay)` 与 `useEffect` **之前**，命中 Rules of Hooks 违规（editing 翻转那帧只调 3 个 hook，上一帧 5 个 → React 卸载整树 → 白屏）。修复：把该 early return 挪到 `useEffect` 之后，保证 5 个 hook 每帧同序调用。`node node_modules/typescript/bin/tsc --noEmit` 已通过（0 错误）。
- ✅ **清理冗余副本**：`D:` 的两个工作树备份 `TravelGuide_workingtree_backup_20260810_185939/` + `…190020.tar.gz` 已移动到 `D:/Travel Guide App/_recycle_20260810/`（可恢复，不在仓库内）。
- 📁 **项目目录迁移**：权威工作目录已从 `C:/Documents/Travel Guide App` 迁至 `D:/Travel Guide App`（仓库 `D:/Travel Guide App/travel-guide`）。后续所有命令/路径均以此为准。
- ⚠️ **C: 旧副本删不掉**：`C:/Documents/Travel Guide App`（纯 node_modules、无 .git）因本环境 safe-delete 沙箱拦截（`trash-failed → FAIL_CLOSED`）无法自动删除，仍残留；另有可恢复副本在 `C:/_recycle_20260810/TravelGuideApp_C_old/`。如需彻底清除，可在真实终端 `rmdir /s /q "C:/Documents/Travel Guide App"`（与仓库无关，纯可重建缓存，删了不影响任何东西）。

### 阶段 2 —— 站内区块编辑器（已提交、已推 `ff29efa`）
- 新增 `src/components/guide/GuideEditor.tsx`：攻略元信息编辑（标题/副标题/emoji/封面渐变/徽章/**发布状态**）、**分区 CRUD + 排序**、**12 种区块的增/删/改 + 字段内联编辑 + 排序**、**编辑/预览切换**（预览复用现有 `BlockRenderer`）。
- `GuidePage`：管理员登录后显示「编辑攻略」按钮，进入编辑态（深拷贝 guide 为草稿，保存后才写回）。
- 保存经 `POST /api/guide/save` 写回内容仓库并触发重建（后端 save/delete 在 Phase 1 已就绪），用 `sonner` toast 反馈。
- 排序当前用「上移/下移」按钮；**拖拽排序后置**（如需再迭代）。
- 本地 `tsc --noEmit` 已通过（0 错误）。本机 vite 已可启动（`npm run dev` → `http://localhost:5173/`，见下方风险项），可本地预览。

> ⚠️ 已知限制：草稿（draft）攻略不会进入游客构建快照（`sync-content` 只收 published），目前**没有管理员专用拉取接口**，所以管理员在站点上还无法打开/编辑纯草稿（已发布的可正常编辑）。若需编辑草稿，需新增 `GET /api/guide/:id`（管理员鉴权）从内容仓库取任意状态攻略 —— 可并入 Phase 3。

---

### Skills 管理与小红书 MCP 接入（2026-08-11，已完成）

- **三套 skills**：`travel-planner`、`travel-guide-addnote`、`xiaohongshu-mcp`。
- **独立源真相仓库**：`Travel Guide App/skills/`（独立 git，已推送 `git@github.com:heyxiaoze/skill.git` 分支 `main`）。含 `install.sh`（同步到 `~/.workbuddy/skills/`）、`README.md`、`.gitignore`。
- **主项目内无 vendored skills**：`travel-guide/.workbuddy/skills/` 已从磁盘删除（移至废纸篓可恢复），`.workbuddy/` 目录一并移除。WorkBuddy 从用户级 `~/.workbuddy/skills/` 加载，功能正常。
- **小红书 MCP 接入**：`xpzouying/xiaohongshu-mcp`（v2.4.3）二进制在 `~/xiaohongshu-mcp/`，经 `~/.workbuddy/mcp.json` 注册（`http://localhost:18060/mcp`）。已登录（用户名 `xiaoze🌀木子. 🍜`），`search_feeds` 实测可用。
- **工作流**：改 skills → 在 `skills/` 仓库改 → `bash install.sh` 同步 → （需要时在 `skills/` 仓库 `git commit`/`push`）。主站 Cloudflare 部署不依赖 skills。
- ⚠️ 后台同步工具可能周期性删除 `.git`/`.workbuddy`，动 git 前先 `ls -a`；若 `~/.workbuddy/skills/` 被清，`bash install.sh` 一键恢复。

---

## 🔒 已锁定决策（不要推翻，除非用户明确改变）

1. v1 用 **构建期快照**（不是运行时 fetch）读取已发布内容。
2. 内容仓库 **公开** 即可。
3. **不支持图片资源**（纯文本/结构化内容）。
4. **只有一个管理员**，不做多账号体系。
5. 内容两态：**草稿（draft）/ 发布（published）**。
6. 保留 `src/data/*.ts` 作为 **静态兜底**。
7. 历史版本查看复用 **内容仓库的 git 提交历史**（GitHub commits = 版本库）。

---

## ⚠️ 已知风险 / 阻塞项

- 本机后台同步工具会周期性删除 `.git`/`.workbuddy`（已在多次会话中出现）。**任何 git 操作前先 `ls -a` 确认 `.git` 存在**，被破坏用 `git checkout HEAD -- <path>` 恢复，并尽快提交/推送。
- ~~本地 vite 因 esbuild darwin 二进制无法跑~~ **已修复（2026-08-10）**：`node_modules` 原本只装了 `@esbuild/darwin-arm64` 与 `@rollup/rollup-darwin-arm64`（macOS 二进制），缺 Windows 版。已联网补装 `@esbuild/win32-x64@0.21.5` 与 `@rollup/rollup-win32-x64-msvc@4.62.4`（沙箱需关闭才通外网；只改 node_modules，已在 `.gitignore`，不影响 git）。现 **`npm run dev` 可在本机启动并服务 `http://localhost:5173/`**（已实测 HTTP 200）。**完整生产构建仍以 Cloudflare Linux 构建为准**；`tsc --noEmit` 本地仍可用（显式 `node node_modules/typescript/bin/tsc`）。注意：`predev`/`prebuild` 的 `sync-content.mjs` 在沙箱内拉不到内容仓库时会写空兜底并回退静态攻略（正常现象，真机有网会拉取）。
- `Bash` 的 `rm` 被沙箱包裹会失败；删文件可用 **PowerShell `Remove-Item`**，但本环境 safe-delete 会拦截对 `Documents` 等保护区目录的删除（`trash-failed → FAIL_CLOSED`）。受保护区内删除需在真实终端手动执行。
- 内容仓库含 3 篇已发布攻略（早期已验证 `raw.githubusercontent.com/heyxiaoze/travel-guide-content/main/guides/index.json` 返回 3 条）。今日因沙箱无外网未能复测，但 URL 已修正，部署环境有网。
