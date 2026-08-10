---
name: travel-guide-addnote
description: 给本仓库（Travel Guide React+Vite+TS 站点）新增一篇旅行攻略/旅行笔记。融合 travel-planner 的「研究（小红书+web）→ 路线规划」方法论，并把调研结果落成 src/data/<id>.ts 数据模块、注册进 src/data/registry.ts。触发词："加一篇攻略"、"新增旅行笔记"、"再来一个目的地"、"增加新的旅行计划"。不要用于改写已有攻略内容（那是普通 Edit 任务），也不要用于从零搭建新网站。
agent_created: true
---

# Travel Guide Addnote — 本项目攻略新增（含调研工作流）

## Overview

本项目是 **React + Vite + TypeScript SPA**（shadcn/ui + Tailwind，HashRouter）。
**每篇攻略 = 一个 `src/data/<id>.ts` 数据模块**，在 `src/data/registry.ts` 里注册（`GUIDE_ORDER` + `TRAVEL_GUIDES`）。

本技能把 `travel-planner` 的「研究 → 规划」方法论接到本项目的「数据模块」产出上：

> 先用**小红书 + web** 把目的地调研透 → 做**路线规划** → 最后把结果**落成 `src/data/<id>.ts`** 并注册进 `registry.ts`。

> ⚠️ **旧 vanilla 静态架构已废弃**：`data/*.js` + `index.html <script>` + `window.registerGuide` + `helpers.js` 都已不存在。本仓库里 `scripts/scaffold_guide.py` 与 `assets/guide-template.js` 仍指向旧架构，**对现站无效，不要运行**。一律用下面的 React 流程。

## 何时使用

- 用户想给这个站点新增一个目的地 / 行程计划。
- 用户说 "加一篇攻略"、"新增旅行笔记"、"再来一个目的地" 等。
- **不要**用它改写某篇已有攻略的正文 —— 那是普通 Edit 任务。

## 工作流总览

```
Phase 1 需求确认（唯一需用户交互）
   ↓
Phase 2 信息研究（小红书优先 + web 补充，自动）
   ↓
Phase 3 路线规划（分段 / 每日安排 / 主题 / 亮点，自动）
   ↓
Phase 4 落成 React 数据模块（src/data/<id>.ts + registry.ts 注册）
   ↓
校验：npm run build → npm run dev 预览 #/guide/<id>
```

---

### Phase 1 — 需求确认（唯一需要用户交互的步骤）

收到新增需求后，用 `ask_followup_question` 确认以下关键信息（用户已给出的可跳过）：

1. **目的地**：去哪里（城市 / 景区 / 区域）？
2. **出行日期 & 天数**：何时出发、玩几天？
3. **出行方式**：自驾 / 高铁 / 飞机 / 房车？
4. **同行人员**：几人、有无老人小孩？
5. **偏好侧重**：自然风光 / 人文历史 / 美食 / 亲子 / 摄影？
6. **预算范围**（可选）：大致预算？

确认后，后续 **Phase 2–4 全部自动执行，不再停下等用户**。

---

### Phase 2 — 信息研究（自动执行）

分两轮，**小红书优先，公开搜索补充**。

#### 第一轮：小红书深度研究（优先，不可跳过）

强制规则：小红书搜索是本技能的核心差异化来源，**禁止因为上一次对话里 MCP 曾超时/失败就跳过**，每次新攻略都必须重新尝试。

执行前置检查（按顺序）：
1. `check_login_status` 检查登录状态；
2. 未登录 → `get_login_qrcode` 让用户扫码，登录成功继续；
3. 已登录 → 直接开搜；
4. 仅当 (a) `check_login_status` 工具本身不可用（MCP 未运行）**且** (b) 提醒用户启动 `xiaohongshu-mcp` 后用户明确拒绝，才允许跳过；
5. 单次搜索超时，**至少重试 2 次**（换关键词 / 缩短关键词），而非放弃整个研究。

搜索策略（每个维度至少 1–2 次）：
- `"{目的地} 攻略 {天数}天"` — 行程与路线
- `"{目的地} 避坑 踩雷"` — 真实踩坑
- `"{目的地} 费用 花费 预算"` — 真实花费
- `"{目的地} 住宿 酒店推荐"` — 住宿体验
- `"{目的地} 美食 餐厅"` — 美食口碑
- `"{目的地} 拍照 打卡"` — 机位与时段

深挖高赞笔记（前 3–5 篇）的详情 + 评论区，重点提取：
- 真实花费金额（机票/酒店/活动实付）
- 踩坑与避雷（公开搜索很难拿到）
- 隐藏玩法 / 小众景点
- 最新政策变化（预约、航线、景区规则）
- 拍照机位与最佳时间段
- 评论区的价格更新与纠错

#### 第二轮：公开网络搜索（补充验证）

用 `web_search` / `web_fetch` 交叉验证并补全：
- 景点：清单、门票、开放时间、建议游览时长
- 交通：到达方式、城际交通、停车
- 住宿：区域推荐与价位
- 美食：特色与推荐餐厅
- 实用：天气、注意事项、必备物品
- 预约：哪些需提前约、渠道
- 预算：机票 / 酒店 / 门票 / 餐饮 / 当地交通 / 签证保险 的区间价

#### 信息融合原则

- **价格**：小红书实测 > 携程等平台标价 > 攻略博客估算
- **踩坑**：评论区 > 小红书正文 > 公开搜索
- **路线**：高赞攻略 + 公开搜索的地理/交通信息
- **时效**：优先近 6 个月内的数据
- **标注来源**：页面里标注关键信息出处（如"据小红书用户@xxx 实测"）

---

### Phase 3 — 路线规划（自动执行）

把研究结果落成行程：
1. **分段**：按地理 + 主题把行程切成若干段；
2. **每日安排**：每天 3–5 个景点/活动，合理排时；
3. **时间分配**：每点标注建议时段（如 `09:00-11:30`）；
4. **主题命名**：每天一个主题（如"古镇寻韵""湿地观鸟"）；
5. **亮点标注**：每天 3–5 个"今日亮点"；
6. **避坑/预约**：把 Phase 2 的踩坑与预约要点落到对应天。

---

### Phase 4 — 落成 React 数据模块（适配本项目）

1. **复制模板**：把 `src/data/qinggan-2026.ts` 复制为 `src/data/<id>.ts`，改 `id` / `title` / `subtitle` / `emoji` / `facts` / `meta` / `sections`，**保留文件末尾** `export const guideData: Guide = raw as unknown as Guide;`。
2. **图标用 `{{icon:name}}` 令牌**（Lucide，由 `src/lib/icons.tsx` 的 `ICON_MAP` 解析）。注意：**`emoji` 字段也用 icon 令牌**（如 `emoji: '{{icon:mountains}}'`），不是真 emoji。**新增图标前请核对 `src/lib/icons.tsx` 的 `ICON_MAP` 键名**，未知名会回退到 `Circle`。常用键：`warning / ticket / compass / car / map-trifold / airplane / push-pin / mountains / money / house / calendar-blank / calendar / backpack / arrow-counter-clockwise / waves / shield / scroll / prohibit / lightning / fork-knife / buildings / bed / bank / circle / map-pin / banknote`。
3. **区块映射**（调研结果 → `Block`）：
   - 每天的行程 → `day` 块（`no`/`date`/`km`/`title`/`items`/`sleep`/`eat`/`note`）
   - 花费明细 → `budget` 或 `table`
   - 美食清单 → `food`（`city` + `items`）
   - 踩坑/预约提醒 → `callout`（`tone: 'warn'`，`s` 可含 HTML）
   - 综合摘要 → `summary`（`rows`）
   - 要点卡片 → `points`；多个地点 → `places`；单地点 → `place`
4. **注册**：编辑 `src/data/registry.ts`：
   - 加 `import { guideData as <x> } from "./<id>";`
   - 把 `<x>.id` 推入 `GUIDE_ORDER`
   - 加 `[<x>.id]: <x>` 到 `TRAVEL_GUIDES`
5. **校验 + 预览**：
   - `npm run build`（= `tsc --noEmit` + `vite build`，必须零错误）
   - `npm run dev` → 打开 `http://localhost:5173/#/guide/<id>`

---

## 数据模块速查（对照 `src/types/guide.ts`）

**Guide 顶层**：`{ id, updatedAt?, modes?: string[], cities?: number, title, subtitle?, emoji?, color?, breadcrumb?, badge?, facts?: {i?,k,v}[], meta?: string[], sections: {title, icon?, lead?, blocks: Block[]}[] }`

**Block 判别联合（`t` 字段）**：

| `t` | 关键字段 | 说明 |
|---|---|---|
| `text` | `s: string \| string[]` | 段落 |
| `callout` | `tone?: 'info'\|'tip'\|'warn'`, `title?`, `s`(可含 HTML) | 提示框 |
| `place` | `name`, `copy?`, `sub?` | 单个可复制地点 |
| `places` | `items: {name,copy?,sub?}[]` | 多个地点 |
| `points` | `items: {k, v}[]` | 要点卡片 |
| `checklist` | `groups?: {title?, items: string[]}[]` | 勾选清单 |
| `table` | `head: string[]`, `rows: string[][]` | 表格 |
| `day` | 见下 | 按天时间轴（核心） |
| `food` | `city`, `flag?`, `items: {name,addr?,price?,src?,note?}[]` | 美食卡片 |
| `budget` | `cells: {k, v, n?}[]` | 预算格子 |
| `summary` | `rows: {k, v}[]` | 双列摘要 |
| `gallery` | `caption?`, `items: {label?,title?,gradient?,src?}[]` | 图片画廊（占位渐变） |

**day 块**：`{ no, date?, km?, title, items: { time?, s?, place?: {name,copy?,sub?}, tags?: string[], note? }[], sleep?: {name,copy?,sub?}, eat?: {name,copy?,sub?}[], note? }`
- `day.items.tags` 按关键词自动配色：**免费 / 预约 / 拍照 / 换电 / 洗澡 / 可选 / 补给**。
- `copy` = 点击复制的精确导航串；`sub` = 副行说明。
- `s` 字段支持 `<b>`、`<br>` 等简单 HTML。

完整字段参考见 `references/block-types.md`。

## 校验清单（完成前）

- [ ] `src/data/<id>.ts` 存在，且 `npm run build`（`tsc`）零错误通过
- [ ] `src/data/registry.ts` 已 `import` 该模块，并加入 `GUIDE_ORDER` + `TRAVEL_GUIDES`
- [ ] `id` 唯一且 URL 安全（字母/数字/连字符）
- [ ] 至少含一个带 `day` 块的 `section`（页面不空）
- [ ] `#/guide/<id>` 预览无 console 报错
- [ ] 图标令牌均存在于 `src/lib/icons.tsx` 的 `ICON_MAP`
