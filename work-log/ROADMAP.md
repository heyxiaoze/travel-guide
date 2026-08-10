# 路线图（ROADMAP）

Phase 1（鉴权 + 写回）已完成并修复可部署；**Phase 2（站内区块编辑器）已完成（提交 `ff29efa`，已推送）**。下面是两个尚未开始的阶段。

---

## Phase 2 —— 站内区块编辑器（已完成 ✅，提交 `ff29efa`，已推送）

> 状态：已完成。用户原话「先不着急开始阶段2」—— 后于 Phase 1 在 Cloudflare 验证通过后开工并完成。

### 已交付
- 前端编辑器 `src/components/guide/GuideEditor.tsx`：攻略元信息编辑（含发布状态 draft|published）、分区 CRUD + 排序、12 种区块的增/删/改 + 字段内联编辑 + 排序、编辑/预览切换（预览复用 `BlockRenderer`）。
- `GuidePage` 接入 `isAdmin`「编辑攻略」入口，保存经 `POST /api/guide/save` 写回并触发重建（后端 save/delete 在 Phase 1 已就绪），`sonner` toast 反馈。
- 本地 `tsc --noEmit` 通过（0 错误）。

### 遗留 / 可选（后置）
1. **拖拽排序**：当前用「上移/下移」按钮，未引入拖拽库（如 `@dnd-kit/core`）。如需更顺手的交互可后置迭代。
2. **草稿可编辑**：纯 draft 攻略不在游客构建快照内（`sync-content` 只收 published）且暂无管理员专用拉取接口，站点上暂无法打开/编辑纯草稿。需新增 `GET /api/guide/:id`（管理员鉴权）从内容仓库取任意状态攻略 —— 见 Phase 3（3c）。

---

## Phase 3 —— 历史版本查看 + 技能上传端点 + 草稿拉取

### 3a. 历史版本查看（复用内容仓库 git 历史）
- 内容仓库的每个攻略都是一次 commit，**GitHub commits = 版本库**（锁定决策第 7 条）。
- 新增 `functions/api/guide/history.ts`：`GET /api/guide/history?id=xxx` → 调用 GitHub API 列 `guides/<id>.json` 的 commits（`GET /repos/{repo}/commits?path=guides/<id>.json`）。
- 前端：管理员可见「历史版本」面板，列出提交时间/消息，点击可查看该版本 JSON 或 diff。
- 可选：新增 `functions/api/guide/restore.ts` 支持回滚到某版本（写回该次 blob 内容）。

### 3b. 技能上传端点
- 新增 `functions/api/guide/upload.ts`：接收 `travel-guide-addnote` skill 生成的攻略 JSON，管理员鉴权后写入内容仓库（与 save 类似，但入口面向「技能产出物」）。
- 让「技能生成的笔记能直接上传/同步到站点」这一原始需求闭环。

### 3c. 草稿可编辑（建议并入 Phase 3）
- 新增 `GET /api/guide/:id`（管理员鉴权）：从内容仓库读取任意状态（含 draft）的攻略 JSON，供管理员在站点内打开/编辑纯草稿（当前只有已发布攻略能进游客快照被编辑）。
- 这是打通「草稿 → 站内编辑 → 发布」闭环的最小缺口，成本低，可随 3a 一并做。

### 明确下一步（接手后第一条）
- 先做 3a 的 `history.ts` 只读列表（最简单、价值高），`GET /api/guide/:id`（3c）可与 3a 一并做；再考虑 restore 与 upload。

---

## 暂不计划（已锁定排除）
- 图片/媒体资源支持（决策第 3 条）。
- 多管理员 / 账号体系（决策第 4 条）。
- 运行时 fetch 内容（坚持构建期快照，决策第 1 条）。
