# 工作记录（CHANGELOG）

按时间倒序。每条写明：做了什么、为什么、提交号、是否推送。

---

## 2026-08-10（本日）

### 阶段 2：站内区块编辑器（提交 `ff29efa`，已推送）
- **目标**：管理员在站点内直接编辑攻略（无需改代码/重部署），访客只读。Phase 1 后端 save/delete 已就绪，本阶段补齐前端编辑器。
- **新增 `src/components/guide/GuideEditor.tsx`**（约 1000 行，自包含）：
  - 攻略元信息编辑：标题 / 副标题 / emoji / 封面渐变 / 徽章 / **发布状态（draft|published）**。
  - 分区（section）层级：增 / 删 / 改 / 上移下移排序；区块（blocks）增 / 删 / 改 / 排序。
  - 12 种区块类型全覆盖（text / callout / place / places / points / checklist / table / day / food / budget / summary / gallery），每种有对应字段编辑器，由 `createDefaultBlock(t)` 工厂生成默认结构。
  - 编辑 / 预览切换：预览**复用现有 `BlockRenderer`**，所见即所得。
  - 保存：深拷贝 guide 为草稿 → `POST /api/guide/save` 传完整 guide → `sonner` toast 反馈。
- **`GuidePage.tsx`**：`isAdmin` 时显示「编辑攻略」按钮，进入编辑态渲染 `<GuideEditor>`。
- **验证**：`tsc --noEmit` 通过（0 错误）。本地 vite 不可跑（darwin 二进制），以 Cloudflare 构建为最终验证。
- **已知限制**：草稿（draft）不在游客构建快照内（`sync-content` 只收 published）且无管理员专用拉取接口，纯草稿暂不可在站内打开/编辑（已发布可正常编辑）。建议新增 `GET /api/guide/:id`（管理员鉴权）并入 Phase 3。

### 修复 2：内容同步 URL 拼接错误 —— 提交 `2087b03`（已推送）
- **问题**：`scripts/sync-content.mjs` 把环境变量 `CONTENT_REPO`（语义为 `owner/repo`，如 `heyxiaoze/travel-guide-content`）当作「纯仓库名」使用，又拼上默认 owner `heyxiaoze`，生成了 `raw.githubusercontent.com/heyxiaoze/heyxiaoze/travel-guide-content/...` 这样的错误 URL → 404。
  该 404 在 Cloudflare 构建日志中出现（叠加在「Functions 导入失败」那次部署里）。
- **修复**：`CONTENT_REPO` 按 `owner/repo` 解析；仅当它是裸仓库名时才用独立的 `CONTENT_OWNER` 兜底。这样无论是否设置 `CONTENT_REPO`，URL 都正确。
- **影响**：一旦用户在 Cloudflare 设置了 `CONTENT_REPO`（文档要求如此），内容快照不再 404，构建期能正确拉取已发布攻略。

### 修复 1：Pages Functions 导入路径错误 —— 提交 `0f69ada`（已推送）
- **问题**：Cloudflare 构建在「生成 Pages Functions」阶段失败，报 `Could not resolve "../_lib/auth"` / `"../_lib/github"`（仅 `api/guide/save.ts`、`api/guide/delete.ts` 报）。
  原因：这两个文件位于 `functions/api/guide/`（深两层），其 `../_lib/*` 解析到不存在的 `functions/api/_lib/*`；而同级 `api/me.ts` 等只用一层 `../_lib/*` 是对的。
- **修复**：两文件改为 `../../_lib/auth`、`../../_lib/github`。
- **验证**：用纯 Node 脚本遍历 `functions/**/*.ts` 校验所有相对导入均可解析 → 全部 OK；`tsc --noEmit` 无类型错误。Cloudflare 的 Linux 构建是最终验证手段（本地 vite/esbuild 因 darwin 二进制无法跑）。

### 部署验证上下文
- 用户贴出的失败构建日志对应提交 `6d1c827`（Phase 1 功能提交），Cloudflare 拉取该提交后：Vite 构建成功（`✓ built in 3.63s`），但 Functions 构建失败（导入解析）。已通过上述两次修复解决，推送后触发器重新构建。

### 目录迁移与收尾（2026-08-10 晚间）
- **工作目录迁移**：权威路径从 `C:/Documents/Travel Guide App` 迁至 `D:/Travel Guide App`（仓库 `D:/Travel Guide App/travel-guide`）。后续所有命令/路径以此为准（已同步更新 `SETUP.md`、`README.md` 本文件相关路径）。
- **编辑攻略白屏修复（提交 `2bca48a`，已推送）**：见上方 STATUS / STATUS「今日修复」。根因 `GuidePage.tsx` Rules-of-Hooks 违规。
- **清理**：`D:` 下两个工作树备份已移至 `D:/Travel Guide App/_recycle_20260810/`（可恢复，不在仓库内）。`C:/Documents/Travel Guide App` 旧副本（纯 node_modules、无 .git）因本环境 safe-delete 沙箱拦截无法自动删除，残留无害。
- **远程一致性核验**：`git ls-remote origin` 确认 `origin/main = 2bca48af…` 与本地 HEAD 完全一致，推送已落地（本地 `origin/main` 远程跟踪引用在本沙箱内不持久化，以 ls-remote 为准）。
- **仓库整洁**：删除 vite 临时文件 `vite.config.ts.timestamp-*.mjs` 并加入 `.gitignore`；`tsc --noEmit` 通过（0 错误）。

---

## 2026-08-10（早些时候，本会话前期）

### 目录重建与整理
- 新建根目录 `C:/Documents/Travel Guide App/`。
- 原 `Travel Guide` 主项目更名为 `travel-guide` 并移入；原 `travel-guide-content` 移入。
- 创建两份工作树备份（`TravelGuide_workingtree_backup_20260810_185939/`、`..._190020.tar.gz`，因环境限制暂未删除）。

### 阶段 1 实现（提交 `6d1c827`，已推送）
- 管理员鉴权（HMAC 签名 Cookie）+ Cloudflare Pages Functions 写回内容仓库 + 前端登录模态框/Header 按钮/`AuthProvider`。
- 详见 `STATUS.md`「阶段 1」与 `upgrade-plan.md`、`README.md`。

---

## 更早（本会话，摘要）

### 阶段 0 —— 内容外部化（提交 `6ab1e26`，已推送）
- `migrate.mjs` / `sync-content.mjs` / `registry.ts` 改造，`Guide.status` 字段，`generated.ts` 兜底，`.gitignore` 调整，package 脚本改用显式 `tsc` 路径。

### 项目初始化类
- 探索 `Travel Guide` 项目；把 `travel-planner` skill  vendoring 进项目 `.workbuddy/skills/` 并提交；将 `travel-planner` 的「研究（小红书+web）→ 规划」方法论融合进 `travel-guide-addnote` skill（面向 React 架构重写）；更新陈旧 README。

### 环境恢复（多次）
- 后台同步工具删除 `.git`/`.workbuddy` 后，用 `git init` + fetch 全量历史 + `reset --mixed origin/main` 恢复；用 `git checkout HEAD -- <path>` 恢复被删的工作树文件。
