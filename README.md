# 🧭 旅行手账 · Travel Guide

> 个人旅行指南站 —— 把每次出行的路线、花费、避坑、美食，沉淀成一篇篇可检索、可分享的指南页。

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](https://creativecommons.org/licenses/by-nc/4.0/)

**数据驱动的旅行攻略 SPA**：每篇指南就是一个 JSON 数据对象（存于独立的内容仓库 [`travel-guide-content`](https://github.com/heyxiaoze/travel-guide-content)），由统一的区块渲染器呈现。一键部署到 **Cloudflare Pages**（免费），游客只读、管理员可在线编辑写回。

---

## ✨ 特性

- **运行时读取 · 免重建** —— 游客读取走 Cloudflare Function，每次请求从内容仓库拉取（边缘缓存约 1 分钟）。**只改内容仓库、不部署主仓库**，线上自动生效。构建期快照 `generated.ts` 仅作离线兜底。
- **12 种内容区块** —— `text / callout / place / places / points / checklist / table / day / food / budget / summary / gallery`，自由组合成一篇指南。
- **按天时间轴（核心）** —— 每天行程做成时间轴，支持时间点、地点一键复制导航串、标签自动配色（免费 / 预约 / 拍照 / 换电 / 洗澡 / 可选 / 补给）、过夜点与吃饭点。
- **首页概览 + 发现页** —— 动态标题、模糊光斑背景、数字滚动统计、指南卡片网格；`/discover` 可按出行方式筛选。
- **暗色模式 + 响应式** —— 跟随系统，localStorage 持久化；移动端友好。
- **小红书 / web 调研工作流** —— 内置 WorkBuddy 技能自动研究目的地、规划路线、落成内容仓库的 JSON。

## 🧱 区块类型

| 区块 | 用途 |
|------|------|
| `text` | 富文本段落 |
| `callout` | 提示 / 警告 / 贴士框 |
| `place` | 单个地点（名称、坐标、导航串、标签） |
| `places` | 地点列表（美食 / 景点合集） |
| `points` | 要点列表 |
| `checklist` | 行前清单（可勾选） |
| `table` | 结构化表格（花费 / 城市对比等） |
| `day` | **按天时间轴**（核心区块） |
| `food` | 美食卡片（店名、必点、人均） |
| `budget` | 预算汇总 |
| `summary` | 行程总结 |
| `gallery` | 图片画廊 |

## 🛠 技术栈

- **运行环境**：Node.js **>= 20**
- **框架**：React 18 + Vite 5 + TypeScript 5
- **样式**：Tailwind CSS 3 + `shadcn/ui` 风格 + `lucide-react` + `motion`
- **路由**：`react-router-dom` 6（HashRouter，`#/guide/<id>` 免服务端配置）
- **提示**：`sonner`
- **部署**：Cloudflare Pages（`wrangler`）

```bash
npm install      # 安装依赖
```

## 🚀 本地开发

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

## 📦 部署到 Cloudflare Pages

项目已包含 `wrangler.toml`（`name = "travel-guide"`，`pages_build_output_dir = "dist"`）与 `public/_redirects`（`/* /index.html 200`，保证 SPA 路由回退）。

### 方式一：Cloudflare Dashboard（推荐）

1. 把本仓库推到 GitHub。
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → 连接 GitHub 仓库。
3. 构建设置：Framework preset `Vite`，Build command `npm run build`，输出目录 `dist`。
4. 点击 **Save and Deploy**，之后每次 `git push` 自动重新部署。

### 方式二：Wrangler CLI

```bash
npm install -g wrangler      # 或 npx wrangler
wrangler login               # 首次需登录/授权
npm run deploy               # = npm run build && wrangler pages deploy dist
```

> CI 部署可设置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 后直接 `wrangler pages deploy dist`。

## 🔐 管理员功能与内容写入（Cloudflare Pages Functions）

站点设计为**游客只读、管理员可写**。鉴权与写回通过 Cloudflare Pages Functions 实现（源码在仓库根 `/functions`，构建时自动复制到 `dist/_functions`）：

| 路由 | 说明 |
|------|------|
| `GET  /api/me` | 返回当前是否管理员 `{ isAdmin }` |
| `POST /api/login` | 校验密码（对比 `ADMIN_PASSWORD`），下发签名 HttpOnly Cookie |
| `POST /api/logout` | 清除会话 Cookie |
| `POST /api/guide/save` | 管理员门禁；把指南 JSON 写入内容仓库并更新 `index.json` |
| `POST /api/guide/delete` | 管理员门禁；删除指南并从索引移除 |

游客侧经 `/guides` Function 运行时读取，变更无需重建站点。区块编辑 UI（Phase 2）与历史版本查看（基于内容仓库 Git 提交历史，Phase 3）将在后续接入。

**需要的 Cloudflare 变量（建议设为 Secret）**：

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 管理员密码，登录弹窗填写此值 |
| `GITHUB_TOKEN` | 具有 `repo` 权限的 GitHub PAT，用于写回内容仓库 |
| `CONTENT_REPO` | 内容仓库，格式 `owner/repo`（默认 `heyxiaoze/travel-guide-content`） |
| `CONTENT_REF` | 内容仓库分支，默认 `main` |
| `GUIDE_CACHE_SMAXAGE` | 可选；`/guides` 边缘缓存秒数，默认 `60` |

- **生产**：Cloudflare Dashboard → Pages → 项目 → **Settings → Environment variables**，以 **Secret** 类型添加。
- **本地开发**：复制 `.dev.vars.example` 为 `.dev.vars` 填入同样的值，然后 `npm run dev:cf`（`wrangler pages dev` 加载 `.dev.vars` 并提供 `/api/*`）。

## 🧩 WorkBuddy Skills

本项目的指南生成依赖一组 **WorkBuddy AI Agent Skills**，以独立仓库 [`heyxiaoze/skill`](https://github.com/heyxiaoze/skill)（源真相）管理，通过 `install.sh` 安装到用户级 `~/.workbuddy/skills` 后由 WorkBuddy 加载：

| Skill | 作用 |
|-------|------|
| `travel-planner` | 通用旅行路线规划与精美指南生成（产出独立 HTML，不依赖本站） |
| `travel-guide-addnote` | 给本站新增一篇指南：调研 → 落成 `travel-guide-content/guides/<id>.json` 并登记 `index.json` |
| `xiaohongshu-mcp` | 小红书数据接入（搜索 / 登录），被上两个 skill 依赖 |
| `notion-travel-collector` | 解析社媒链接，写入 Notion「灵感收集箱」与「资源库」 |

```bash
# 在 skills 仓库根目录执行，安装到 ~/.workbuddy/skills
bash install.sh
```

> ⚠️ 主仓库**不再内置** skills（原 `.workbuddy/skills/` 已移除）。修改技能请到 `heyxiaoze/skill` 仓库改，再 `bash install.sh` 同步；不要直接改 `~/.workbuddy/skills/` 里的副本（会被覆盖）。

## 📝 如何新增一篇指南

指南内容的【唯一真相源】是独立的内容仓库 [`travel-guide-content`](https://github.com/heyxiaoze/travel-guide-content)（`guides/<id>.json` + `guides/index.json`，每篇含 `status: "draft" | "published"`）。游客经 `/guides` Function 运行时读取，约 1 分钟生效。

### 方式一：用 WorkBuddy 技能（推荐）

在 WorkBuddy 中打开本项目（skills 已安装到用户级），说「**加一篇指南**」「**新增旅行笔记**」或「**再来一个目的地**」。技能会确认需求 → 自动用小红书 + web 调研 → 落成内容仓库的 JSON 并登记 `index.json`（`status: "published"`）。

> 区块字段参考见 [`heyxiaoze/skill` › `travel-guide-addnote/references/block-types.md`](https://github.com/heyxiaoze/skill/blob/main/travel-guide-addnote/references/block-types.md)。

### 方式二：手动新增（在内容仓库 `travel-guide-content/` 操作）

1. 新建 `guides/<你的id>.json`，结构同主仓库 `src/types/guide.ts` 的 `Guide`（顶层含 `id` / `title` / `subtitle` / `emoji` / `facts` / `meta` / `sections`，并加 `"status": "published"`）。
2. 图标用 `{{icon:name}}` 令牌（如 `"emoji": "{{icon:mountains}}"`），可用名见主仓库 `src/lib/icons.tsx` 的 `ICON_MAP`。
3. 在 `guides/index.json` 数组加一条 `{ "id", "status", "title", "emoji", "color", "updatedAt", "badge", "modes", "cities" }`。
4. 本地 `npm run build` 会对内容仓库 JSON 做类型 / 结构校验；线上无需重建主仓库，推完内容仓库约 1 分钟自动生效。

## 📂 目录结构（节选）

```
src/
  data/
    registry.ts        # 指南注册表：仅消费 generated.ts 快照
    generated.ts       # ⚠️ 构建期自动生成（gitignore），勿手改
  types/guide.ts       # Guide / Block 类型定义（数据结构唯一事实来源）
  components/          # BlockRenderer 与各区块组件、首页/发现页/详情页
  animata/             # 站内外观组件（fluid-tabs / shift-tabs 等）
  lib/icons.tsx        # ICON_MAP（{{icon:name}} → Lucide）
functions/             # Cloudflare Pages Functions（管理员写回 / 运行时读取）
  guides/[[id]].ts     # GET /guides 列表 / GET /guides/<id> 单篇
wrangler.toml          # Cloudflare Pages 部署配置
public/_redirects      # SPA 路由回退
sop.md                 # 项目开发规范 & 工作流 SOP（仅流程变更时更新）
# 指南内容在同级内容仓库 travel-guide-content/guides/*.json（唯一真相源）
```

## 📄 许可

个人旅行记录，转载请注明出处。
