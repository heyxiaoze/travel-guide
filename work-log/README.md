# work-log · Travel Guide App 开发规范 & 工作流 SOP（本地镜像）

> 本文件是 Notion「🔧 开发规范 & 工作流 SOP」的**本地镜像**。规范同源：**改一处必须同步另一处**。
> Notion 主：🌋 Travel Guide App → 🚀 开发工作区 → 🔧 开发规范 & 工作流 SOP
> 任何人或 AI 接手本项目，先读本文件 + Notion SOP，即懂全部规范与流程。

## 1. 项目定位
把「真实出行规划」与「App 重建开发」统一管理：内容（指南 / 行程）进站点，开发（任务 / 变更 / 规范）进本工作区。

## 2. 技术栈
- React 18 + Vite + TypeScript
- shadcn/ui 组件库（Radix + Tailwind）
- 数据层：游客读取走**运行时** `functions/guides/[[id]].ts`（Cloudflare Function）——每次请求时从 `travel-guide-content` 仓拉取「已发布」攻略（边缘缓存约 1 分钟，`GUIDE_CACHE_SMAXAGE` 可调）；`src/data/registry.ts` 仅消费构建期生成的 `generated.ts` 快照作「内容仓不可达」时的离线兜底
- 内容源：`travel-guide-content/*.json`（运行时读取的唯一真相源；只改它、不提交/部署主仓库，线上约 1 分钟生效）

## 3. 约定
- 新增攻略 / 笔记走 `travel-guide-addnote` skill，落成 `travel-guide-content/guides/<id>.json` 并登记 `guides/index.json`（`status: "published"`）；`src/data/` 不再存攻略内容，游客经 `/guides` Function **运行时读取**，构建期生成的 `generated.ts` 仅作离线兜底
- 样式遵循 shadcn 主题 token，支持明暗切换；提交前确保 `npm run build` 通过
- 目录：`src/data/`（`registry.ts` + 构建期生成、被 gitignore 的 `generated.ts` 快照，**不含攻略内容**）、`src/components/`（UI）、`functions/guides/[[id]].ts`（游客运行时读取 Function）、`travel-guide-content/`（攻略唯一真相源：`guides/*.json` + `index.json`）

## 4. 设计规范
- 组件：shadcn/ui（Radix + Tailwind）；主题 light / dark 跟随系统、可手动切换
- 色彩 / 字体集中在 Tailwind config / CSS 变量，禁止裸值；行程状态、任务优先级用统一色板
- 页面：首页目的地导航；攻略详情分 路线 / 美食 / 住宿 / 贴士；移动端优先响应式

## 5. 工作流（双 SOP：Notion 主 + 本地 README 镜像）
> 把「跨设备交接 + 记录」变成必须走的清单（Mac ↔ Win 互不丢失）。

### 🟢 会话开始（每次开工先走）
1. `git pull --ff-only`（`travel-guide` 与 `travel-guide-content` 两仓库）
2. 读 Notion 开发工作区：Dev Tasks / Changelog / Sync
3. 看对方机器最近是否动过（Sync 的「最后动手时间 / 当前 HEAD」）；若对方 HEAD 更新 → 提示先 pull
4. 更新 Sync 本机「最后动手时间」为现在

### 🔵 会话结束（收工前必走）
1. 更新相关 Dev Tasks 的状态 / 优先级 / 备注
2. 写一条 Changelog：日期 / 类型 / 提交号 / 已推送
3. `git commit` + `git push`
4. 在 Sync 标记本机 HEAD + 已推送 GitHub = ✓
5. 同步双 SOP：本文件与 Notion SOP 保持一致

### 📌 原则
- 双 SOP 同源：Notion 为主，本地 README 为镜像；**改一处同步另一处**
- 锁定决策（Decisions）除非用户明确改变，否则不推翻
- 关联攻略（Guides）与开发任务双向打通，草稿 / 发布状态一眼可见

## 6. Dev Tasks 模板（每条开发任务必填）
- **标题**：动作 + 对象（如「新增指南搜索筛选」）
- **状态**：规划（Notion 中显示名为「未开始」）/ 进行中 / 已完成
- **优先级**：高 / 中 / 低
- **模块**：shadcn/ui / 数据层 / 页面 / 构建部署 / 调研
- **阶段**：P0内容外化 / P1鉴权写回 / P2编辑器 / P3版本与草稿 / 跨设备互通 / 部署 / Skills / 维护
- **类型**：功能 / 修复 / 调研 / 文档 / 部署 / 迁移 / 技能
- **机器**：Mac / Win / 双端
- **关联**：关联提交 / 关联攻略 / 依赖 / 变更记录
- **备注**：验收标准 + 关键决策链接

## 7. Changelog 模板（每次提交必写）
- 日期 · 类型 · 提交号（短 hash）· 已推送（✓ / ✗）· 一句话说明
- 关联 Dev Tasks（反向在任务里挂变更记录）

## 8. 双机同步 Sync 字段
- 机器（Mac / Win）· 最后动手时间 · 当前 HEAD · 已推送 GitHub · 待办提醒

## 9. 治理
- 🔒 锁定决策 Decisions：架构 / 产品锁定项，勿推翻
- ⚠️ 已知风险 Risks：活跃风险雷达，含机器维度
- 本规范与 Notion SOP 构成「双 SOP」，任何 AI 接手即按此执行，无需重新摸索。

---
*最后同步：本文件与 Notion「🔧 开发规范 & 工作流 SOP」保持一致。改一处请同步另一处。*

## 10. 变更记录（Changelog）

> 按 §7 每次提交必写。格式：日期 · 类型 · 提交号（短 hash）· 已推送（✓ / ✗）· 一句话说明。

- **2026-08-11 · 功能 · `fab20d0`(travel-guide) · ✓ · 指南详情页增加「导出 PDF」按钮（window.print + @media print 浅色化，no-print 隐藏外壳，保留封面底色）**
  - 决策：攻略详情页提供「导出 PDF」按钮，复用浏览器打印管线（`window.print`），用户在打印对话框选「存储为 PDF」；`@media print` 强制浅色主题（覆盖 `.dark` 变量）、Header/Footer/操作区/日期子导航加 `no-print` 隐藏、封面底色 `print-color-adjust:exact` 保留、避免区块分页截断。
  - 动机：用户要求指南可离线/打印留存。纯客户端实现，无需内容仓或 Function 改动。
  - 副作用：需 CF 重新构建静态产物上线（已随 push 自动触发）；暗色主题下打印自动转浅色，不影响屏幕显示。
  - 关联：Notion Dev Tasks / Changelog 同步；SOP §10 双源同步。

- **2026-08-11 · 功能/迁移 · `0a34fff`(travel-guide) · ✓ · 游客读取改为运行时经 `/guides` Function 拉取内容仓，彻底免重建**
  - 决策：游客只读路径不再依赖构建期 `generated.ts` 快照，改为 Cloudflare Function `functions/guides/[[id]].ts` 在**请求时**从 `travel-guide-content` 仓拉取已发布攻略（边缘缓存 `s-maxage=60` + `stale-while-revalidate`），`generated.ts` 降级为「内容仓不可达」时的离线兜底；`src/lib/content.ts` 先渲染快照再升级为运行时数据（无闪烁）。
  - 动机：用户要求「只更新内容仓库就上线、不提交/部署主仓库」。原构建期快照模型下线上是静态产物，必须触发 `travel-guide` 重建才生效；改为运行时读取后，内容仓 `main` 分支更新约 1 分钟内自动上线。
  - 副作用：移除 `save`/`delete` 的 `triggerDeploy`（不再需要重建）；游客每次请求依赖 GitHub raw 可达（已有边缘缓存兜底）；管理员写回仍走 GitHub Contents API 提交到内容仓。
  - 关联：`README.md`、`work-log` SOP §2/§3 同步为运行时读取模型；Notion SOP / Changelog / Dev Tasks / Sync 同步。

- **2026-08-11 · 迁移 · `49044b5`(travel-guide) / `630cf54`(content) / `56eba17`(skills) · ✓ · 攻略内容收归 `travel-guide-content` 单一真相源**
  - 决策：所有攻略的创建 / 更新 / 读取统一在内容仓库 `guides/<id>.json` + `guides/index.json`；主仓库 `src/data/` 删除全部静态 `.ts` 攻略模块（qinggan / chuanyu / dalian-qiqihaer / dalian-yingkou），`registry.ts` 简化为仅消费构建期生成的 `generated.ts`（来自内容仓远程），不再保留静态兜底。
  - 动机：内容仓读取逻辑（`sync-content.mjs`）已验证跑通，主仓库不再需要冗余副本；单一真相源避免双份漂移。
  - 副作用：`generated.ts` 被 gitignore，站点构建 / 运行依赖内容仓可达（线上经 `raw.githubusercontent.com` 拉取；本地 `predev` / `prebuild` 同）；内容仓不可达时站点回退为无攻略（空兜底）。
  - 关联：`travel-guide-addnote` skill 的「落成 `src/data/<id>.ts`」步骤已改为「落成 `guides/<id>.json` + 登记 `index.json`」；两仓库 README 同步更新。
