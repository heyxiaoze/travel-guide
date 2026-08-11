# 旅行手账 · Travel Guide

一个**个人旅行攻略站**：把每次出行的路线、花费、避坑、美食沉淀成一篇篇可检索、可分享的攻略页。技术上是 **React + Vite + TypeScript** 单页应用（SPA），数据驱动——每篇攻略就是一个数据对象（存于 `travel-guide-content` 内容仓库的 `guides/<id>.json`），由统一的区块渲染器呈现。可一键部署到 **Cloudflare Pages**（免费）。

> 项目内已内置两个 WorkBuddy 技能（位于 `.workbuddy/skills/`）：
> - **`travel-guide-addnote`** —— 给本站新增一篇攻略（融合「小红书 + web 调研 → 路线规划 → 落成 `travel-guide-content` 仓的 `guides/<id>.json`」工作流）。
> - **`travel-planner`** —— 通用旅行攻略生成器（产出独立 HTML，不依赖本站）。
> Fork 本项目后，用 WorkBuddy 打开即可直接使用这两个技能。

## 主要功能

- **数据驱动的攻略体系**：每篇攻略 = `travel-guide-content/guides/<id>.json`（含 `status`）里的对象，由构建期 `scripts/sync-content.mjs` 拉取「已发布」攻略生成 `src/data/generated.ts` 快照，`registry.ts` 只消费这份快照。新增攻略只是往内容仓库加一个 JSON + 一条索引。
- **统一的区块渲染**：`text / callout / place / places / points / checklist / table / day / food / budget / summary / gallery` 共 12 种区块类型，由 `BlockRenderer` 统一渲染。写攻略就是组合这些区块。
- **按天时间轴（核心）**：`day` 区块把每天的行程做成时间轴，支持时间点、地点（一键复制导航串）、标签自动配色（免费/预约/拍照/换电/洗澡/可选/补给）、过夜点、吃饭点。
- **首页概览 + 发现页**：首页动态标题、模糊光斑背景、数字滚动统计、攻略卡片网格；`/discover` 可做筛选。
- **暗色模式 + 响应式**：跟随系统，localStorage 持久化；移动端友好。
- **小红书 / web 调研工作流**（通过 `travel-guide-addnote` 技能）：新增攻略时先自动研究目的地（真实花费、踩坑、机位、预约），再规划路线，最后落成内容仓库的 `guides/<id>.json`（并登记 `index.json`）。

## 技术栈 / 所需依赖

- **运行环境**：Node.js **>= 20**
- **框架**：React 18 + Vite 5 + TypeScript 5
- **样式**：Tailwind CSS 3 + `tailwindcss-animate` + `class-variance-authority` + `clsx` + `tailwind-merge`
- **UI 组件**：shadcn/ui 风格（基于 `@radix-ui/react-*`）
- **路由**：`react-router-dom` 6（HashRouter，`#/guide/<id>` 免服务端配置）
- **图标**：`lucide-react`（通过 `src/lib/icons.tsx` 的 `ICON_MAP` 用 `{{icon:name}}` 令牌引用）
- **提示**：`sonner`
- **部署**：`wrangler`（Cloudflare Pages）

安装依赖：

```bash
npm install
```

## 项目启动（本地开发）

```bash
npm run dev        # 启动 Vite 开发服务器，默认 http://localhost:5173
```

常用脚本（`package.json`）：

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发服务器 |
| `npm run build` | `tsc --noEmit` 类型检查 + `vite build` 产物到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run typecheck` | 仅类型检查 |
| `npm run deploy` | `npm run build` 后执行 `wrangler pages deploy dist` |

## 部署到 Cloudflare Pages

项目已包含 `wrangler.toml`（`name = "travel-guide"`，`pages_build_output_dir = "dist"`）和 `public/_redirects`（`/* /index.html 200`，保证 SPA 路由回退）。

### 方式一：Cloudflare Dashboard（推荐）

1. 把本仓库推到 GitHub。
2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → 连接你的 GitHub 仓库。
3. 构建设置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. 点击 **Save and Deploy**。之后每次 `git push` 自动重新部署，得到 `*.pages.dev` 免费域名（也可绑定自定义域名）。

### 方式二：Wrangler CLI

```bash
npm install -g wrangler      # 或 npx wrangler
wrangler login               # 首次需登录/授权
npm run deploy               # = npm run build && wrangler pages deploy dist
```

> 若用 CI/环境变量部署，可设置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 后直接 `wrangler pages deploy dist`。

## 管理员功能与内容写入（Cloudflare Pages Functions）

站点设计为**游客只读、管理员可写**。管理员鉴权与内容写回通过 Cloudflare Pages Functions 实现（源码在仓库根 `/functions`，构建时自动复制到 `dist/_functions`）：

- `GET  /api/me` —— 返回当前是否管理员（`{ isAdmin }`）。
- `POST /api/login` —— 校验密码（对比 `ADMIN_PASSWORD`），成功下发**签名 HttpOnly Cookie**（密码本身不进 Cookie，也不进前端包）。
- `POST /api/logout` —— 清除会话 Cookie。
- `POST /api/guide/save` —— 管理员门禁；把攻略 JSON 写入内容仓库 `guides/<id>.json` 并更新 `guides/index.json`，随后触发 Deploy Hook 重建站点。
- `POST /api/guide/delete` —— 管理员门禁；删除攻略并从索引移除。

> 顶栏右上角已有「登录 / 退出」按钮与登录弹窗。区块编辑 UI（Phase 2）与历史版本查看（基于内容仓库的 Git 提交历史，Phase 3）将在后续接入——届时管理员可在网页上直接增删改区块、查看/恢复历史版本。

### 需要的 Cloudflare 变量（建议设为 Secret）

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 管理员密码（即你提到的 CF “admin” 文本变量）。登录弹窗填写此值。 |
| `GITHUB_TOKEN` | 具有 `repo` 权限的 GitHub PAT，用于把攻略写回内容仓库。 |
| `CONTENT_REPO` | 内容仓库，格式 `owner/repo`（公开，站点读取用）。 |
| `DEPLOY_HOOK_URL` | Cloudflare Pages Deploy Hook URL，保存/删除后触发站点重建。 |

- **生产**：Cloudflare Dashboard → Pages → 你的项目 → **Settings → Environment variables**，以 **Secret** 类型添加上表变量（Secret 不会进入构建产物）。
- **本地开发**：复制 `.dev.vars.example` 为 `.dev.vars` 填入同样的值，然后 `npm run dev:cf`（`wrangler pages dev` 会加载 `.dev.vars` 并提供 `/api/*` 路由）。

## 如何新增一篇攻略

> 攻略内容的【唯一真相源】是独立的内容仓库 `travel-guide-content`（`guides/<id>.json` + `guides/index.json`，每篇含 `status: "draft" | "published"`）。
> 站点在构建期（`predev`/`prebuild`）通过 `scripts/sync-content.mjs` 拉取**已发布**攻略生成 `src/data/generated.ts` 快照；管理员通过上面的 `/api/guide/save` 写回内容仓库并触发重建。`src/data/` **不再存放攻略内容**，只保留 `registry.ts` 与构建期生成的 `generated.ts` 快照。



### 方式一：用内置技能 `travel-guide-addnote`（推荐）

项目已把该技能打包进 `.workbuddy/skills/`。**Fork 或克隆本项目后，用 WorkBuddy 打开项目即可直接使用**（WorkBuddy 会自动加载仓库内的项目级技能）：

1. 在 WorkBuddy 里对本项目说「**加一篇攻略**」「**新增旅行笔记**」或「**再来一个目的地**」。
2. 技能会先和你确认需求（目的地 / 日期天数 / 出行方式 / 同行 / 偏好 / 预算），随后**自动**用小红书 + web 把目的地调研透、规划路线，最后落成 `travel-guide-content/guides/<id>.json` 并登记进 `guides/index.json`（`status: "published"`）。
3. `npm run build` 校验通过后即可（构建期会自动从内容仓库拉取该攻略生成快照）。

> 该技能的完整区块字段参考见 `.workbuddy/skills/travel-guide-addnote/references/block-types.md`。

### 方式二：手动新增（在内容仓库 `travel-guide-content/` 操作）

1. 新建 `guides/<你的id>.json`，字段结构同主仓库 `src/types/guide.ts` 的 `Guide`（顶层含 `id` / `title` / `subtitle` / `emoji` / `facts` / `meta` / `sections`，并加 `"status": "published"`）。**无需** TS 导出，直接是 JSON 对象。
2. 图标用 `{{icon:name}}` 令牌（如 `"emoji": "{{icon:mountains}}"`），可用名见主仓库 `src/lib/icons.tsx` 的 `ICON_MAP`。
3. 登记：在 `guides/index.json` 数组里加一条 `{ "id": "<你的id>", "status": "published", "title": "...", "emoji": "...", "color": "...", "updatedAt": "YYYY-MM-DD", "badge": "...", "modes": [...], "cities": N }`。
4. 校验：`npm run build`（必须零错误，构建期会从内容仓库拉取该攻略生成 `src/data/generated.ts`），本地用 `npm run dev` 打开 `http://localhost:5173/#/guide/<你的id>` 预览。

## 目录结构（节选）

```
src/
  data/
    registry.ts        # 攻略注册表：仅消费 generated.ts 快照（TRAVEL_GUIDES + GUIDE_ORDER）
    generated.ts       # ⚠️ 构建期自动生成（gitignore），从 travel-guide-content 仓拉取已发布攻略，勿手改
  types/guide.ts       # Guide / Block 类型定义（数据结构的唯一事实来源）
  components/          # BlockRenderer 与各区块组件、首页/发现页/详情页
  lib/icons.tsx        # ICON_MAP（{{icon:name}} → Lucide）
.workbuddy/skills/     # 内置 WorkBuddy 技能（travel-guide-addnote / travel-planner）
wrangler.toml          # Cloudflare Pages 部署配置
public/_redirects      # SPA 路由回退
# 攻略内容在同级内容仓库 travel-guide-content/guides/*.json（唯一真相源）
```

## 许可

个人旅行记录，转载请注明出处。
