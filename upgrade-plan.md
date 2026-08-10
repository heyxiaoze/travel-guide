# Travel Guide 重大升级 · 可执行方案（定稿 v2）

> 目标：把"构建时写死的个人攻略站"升级为 **内容 Git 分管（公开仓库 JSON 为唯一真相源）+ 单管理员 CF Secret 登录 + schema 驱动区块编辑器 + 历史版本查看** 的产品级旅行日志平台。
> 本方案已吸收全部决策（见第一节），可直接作为实现蓝图。

---

## 一、决策确认（已采纳）

| # | 决策点 | 结论 |
|---|---|---|
| 1 | 读取方式 | **v1 构建期快照**：编辑/提交后约 1 分钟随重新部署生效，最简单稳健 |
| 2 | 内容仓库可见性 | **公开**（读取免鉴权，构建期用 `raw.githubusercontent.com` 拉取，无速率限制） |
| 3 | 图片资源 | **暂不支持图片**：区块去图片依赖，纯文本/结构化数据；`gallery` 仅保留文本/说明 |
| 4 | 管理员模型 | **单账号单密码**，密码存 Cloudflare Secret（即"admin 文本变量"，用 Secret 而非明文变量） |
| 5 | 草稿态 | **草稿 / 发布 两态**：游客只见"已发布"；管理员可见全部并可切换 |
| 6 | 回退 | **保留** 现有 `src/data/*.ts` 作为离线兜底 |
| 7 | 新增：历史版本 | **支持历史版本查看**：内容托管在 git，GitHub 提交历史即版本库（见第五节） |

---

## 二、总体架构

```
                        内容仓库 (GitHub, 公开)
                        guides/<id>.json  = 唯一真相源
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │ 读（游客）                                          │ 读/写（管理员）
        ▼                                                    ▼
构建期 sync-content 拉取"已发布"攻略             Pages Functions (鉴权后)
   → public/content/guides.json 快照                → 拉取任意状态(含草稿)
   → 站点零运行时依赖读取                            → 写回 JSON (GitHub PAT, Secret)
                                                       → 触发 Deploy Hook 重建
                                                       → 历史：commits API 列版本 / 恢复
```

**核心原则**：内容(JSON) 与渲染(`BlockRenderer`) 已天然分离 → 新增区块只需"联合类型 + 渲染 + 编辑器"三处联动。

### 读取分层（v1，兼顾决策 5 草稿隐私）
- **游客**：读构建快照 `public/content/guides.json`（**只含已发布**攻略）。游客理论上可 inspect 该 JSON，但草稿字节绝不进入快照 → 草稿对游客不可见。
- **管理员**：编辑时经 Pages Functions（校验会话 Cookie 后）从内容仓库拉取**任意状态**（含草稿），保存写回。
- **回退（决策 6）**：`registry.ts` 优先用生成快照；若快照缺失（离线/构建失败）回落到 `src/data/*.ts` 静态兜底。

### 写入链路（管理员 / skill 上传）
```
编辑器保存 → /api/guide/save (校验 Cookie)
        → GitHub Contents API PUT guides/<id>.json (base64 + 当前 sha, PAT=Secret GITHUB_TOKEN)
        → 调用 Deploy Hook (Secret DEPLOY_HOOK) → CF Pages 重新构建 → 快照刷新
```
skill 生成笔记两条路径：A) 站点上传（管理员在编辑页贴 JSON / 走 `/api/guide/upload`）；B) 直接提交内容仓库（skill 用 PAT 或你手动 PR）。

---

## 三、管理员鉴权（解决"密码不能在前端"）

- `Header.tsx` 右上角并排现有主题切换，新增 **登录按钮 + 弹窗**（填密码）。
- `wrangler.toml` 启用 Pages Functions；新增 **Secrets**（非明文变量，避免进构建产物）：
  - `ADMIN_PASSWORD` —— 你口中的 admin 文本变量
  - `ADMIN_SESSION_SECRET` —— 给会话 Cookie 做 HMAC 签名
  - `GITHUB_TOKEN` —— 写回内容仓库（public repo 仅需 `repo` 作用域）
  - `CONTENT_REPO` —— `owner/repo`（内容仓库）
  - `DEPLOY_HOOK` —— CF Pages Deploy Hook URL
- 端点：
  - `functions/api/login.ts`：比对 `ADMIN_PASSWORD` → 下发 HMAC 签名 **httpOnly Cookie**
  - `functions/api/logout.ts`
  - `functions/api/guide/save.ts`、`delete.ts`、`upload.ts`、`restore.ts`：均校验 Cookie，游客 401
- 防护级别：单密码共享 = **deterrent 级**（个人站足够），非多用户账号体系；可加简单限流防爆破。**不要在此放敏感数据**。

---

## 四、区块编辑器（功能①）

- 新增 `EditorProvider`（`zustand` + `immer` 管草稿 `Guide` 状态）、`BlockEditorShell`、以及**每种 Block 一个表单编辑器**（`TextEditor` / `DayEditor` / `PlaceEditor` / `PointsEditor` / `ChecklistEditor` / `TableEditor` / `FoodEditor` / `BudgetEditor` / `CalloutEditor` / `SummaryEditor` / `GalleryEditor`(纯文本)）。
- **拖拽排序** 用 `@dnd-kit/sortable`；**实时预览** 直接复用现有 `BlockRenderer`（编辑态/展示态共用渲染逻辑）。
- "自定义时间/地点/控件"：
  - `DayBlock` 已有 `time`/`place` → 浮现可编辑字段；地点 = 文本 + 可选坐标。
  - 控件 = 日期选择器、标签输入、颜色选择器（`guide.color`）、emoji 选择器（`guide.emoji`）、数字输入（预算/里程）。
- 保存前选择 **草稿 / 发布**（决策 5）：发布即写入内容仓库并触发重建；草稿仅写回内容仓库（不进游客快照）。

---

## 五、历史版本查看（功能⑦，新增）

内容在公开 git 仓库 → **GitHub 提交历史即版本库**，零额外存储。

- **列版本（读，公开免鉴权）**：`GET https://api.github.com/repos/{CONTENT_REPO}/commits?path=guides/<id>.json&per_page=20` → 返回 commits（sha / message / author.date / author.name）。浏览器直连即可（可选经 Function + PAT 提速率）。
- **预览某版本**：`GET .../contents/guides/<id>.json?ref={sha}` → base64 解码 → 复用 `BlockRenderer` 只读预览。
- **恢复某版本（管理员，写）**：`POST /api/guide/restore {id, sha}` → Function 取该 sha 内容 → `PUT` 回内容仓库（commit message：`restore <id> to <short_sha>`）→ 触发 Deploy Hook 重建。
- **UI**：
  - 攻略页「版本历史」按钮 → 抽屉/弹窗列出版本（时间、提交信息、作者）。
  - **游客**：只读变更时间线（仅元数据）。
  - **管理员**：额外显示「预览」与「恢复此版本」。
- 该能力天然复用 git 的 diff/blame，未来可加"对比两个版本"视图。

---

## 六、文件清单 / 改动点

### 新增
```
scripts/sync-content.ts              # 构建期拉内容仓库"已发布"JSON → public/content/guides.json
scripts/migrate.ts                   # 一次性：src/data/*.ts → guides/<id>.json (内容仓库初始化)
functions/api/login.ts               # 鉴权
functions/api/logout.ts
functions/api/guide/save.ts          # 写回 Git + 触发重建
functions/api/guide/delete.ts
functions/api/guide/upload.ts        # skill 上传入口
functions/api/guide/restore.ts       # 历史恢复
src/components/editor/*              # 编辑器套件(EditorProvider / 各 BlockEditor / 拖拽)
src/components/layout/LoginModal.tsx
src/components/guide/HistoryDrawer.tsx
src/lib/auth.ts                      # 会话上下文(Cookie)
src/lib/content.ts                   # 读取快照 / 调 Function
依赖新增: @dnd-kit/core @dnd-kit/sortable zustand immer nanoid
```

### 修改
```
wrangler.toml                       # 启用 Functions + Secrets 说明
src/data/registry.ts                # 改从 public/content 读取 + 静态兜底；按 status 过滤
src/components/layout/Header.tsx    # 加登录按钮 + 登录态
src/components/guide/GuidePage.tsx  # 加编辑开关 / 删除 / 版本历史(管理员)
src/components/home/HomePage.tsx    # 加新增 / 删除 / 草稿徽标(管理员)
src/types/guide.ts                  # Guide 增 status 字段；gallery 限定纯文本
.workbuddy/skills/travel-guide-addnote/SKILL.md  # 产出改 JSON schema + 上传/同步说明
```

---

## 七、实施分期（可执行顺序）

- **Phase 0 地基（只读外置）**
  1. 新建公开内容仓库 `travel-guide-content`。
  2. `scripts/migrate.ts` 把现有 3 篇 `src/data/*.ts` 转 `guides/*.json` 并提交到内容仓库（保留原 `.ts` 兜底）。
  3. `scripts/sync-content.ts` + `registry.ts` 改读快照；`npm run dev` 验证站点内容正常（游客视角）。
- **Phase 1 鉴权 + Functions（本地先行）**
  4. `wrangler.toml` 启用 Functions；Secrets 就位。
  5. `LoginModal` + `auth.ts` + `login/logout` 端点；`wrangler dev` 跑通登录态。
- **Phase 2 编辑器（核心体验）**
  6. `EditorProvider` + 各 `BlockEditor` + `@dnd-kit` 拖拽 + 实时预览。
  7. `save/delete` 端点（校验 Cookie → 写 Git → 触发重建）；草稿/发布切换。
- **Phase 3 历史版本 + skill 上传**
  8. `HistoryDrawer` + `restore` 端点 + commits API 对接。
  9. `addnote` 技能产出 JSON，接 `upload`；文档写清"站点上传 / 提交内容仓库"两条路径。
- **Phase 4 收尾**
  10. 撤销/重做、空态、响应式编辑器、权限 UX、限流。

---

## 八、风险与权衡

- **草稿隐私**：构建快照只含已发布；草稿仅经鉴权 API 返回（决策 5 落地方式）。
- **公开仓库 + 构建快照**：游客可 inspect 已发布 JSON（正常，个人站可接受）。
- **重建延迟 ~1min**：v1 固有；若需即时可后续升级 v2 运行时拉取。
- **令牌安全**：`GITHUB_TOKEN`/`ADMIN_PASSWORD` 仅存 CF Secret，永不进前端 JS 或构建产物。
- **同步工具坑**：本机 `C:\Documents` 后台同步工具曾误删 `.git`/`.workbuddy`，执行 Phase 0 前先核对磁盘，重要改动及时 push。

---

## 九、验收标准

1. 游客：首页/发现/攻略页正常浏览，看不到任何草稿、无编辑/删除入口。
2. 管理员：右上角登录；攻略页可增删改区块、改时间/地点/控件、拖拽排序、实时预览；可发布/转草稿/删除。
3. 内容变更经 GitHub 提交，约 1 分钟内站点刷新；原 `src/data/*.ts` 在快照缺失时仍可兜底渲染。
4. 任一攻略可打开「版本历史」：游客看变更时间线，管理员可预览并恢复历史版本。
5. skill 生成的笔记可通过站点上传或提交内容仓库两种方式入库。
