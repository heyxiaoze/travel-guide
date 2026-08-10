# 区块类型参考（`src/data/<id>.ts` 的 `sections[].blocks[]`）

每个 block 都是 `{ t: '<type>', ...字段 }`。下面是本站点（React + Vite + TS）支持的全部类型及字段，与 `src/types/guide.ts` 一一对应。

> ⚠️ 旧 vanilla 站的 `data/<id>.js` + `window.registerGuide` + `helpers.js` + `index.html <script>` 已废弃。本文件只描述现站的 TS 数据模块写法。

## 顶层 guide 对象（`Guide` 接口）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一英文标识，路由 `#/guide/<id>` |
| `updatedAt?` | `string` | 更新日期，如 `'2026-08-10'` |
| `modes?` | `string[]` | 出行形式，可多选：`['自驾']` / `['高铁']` 等；缺省由筛选推断 |
| `cities?` | `number` | 去过的城市数（不含常住地），用于首页统计 |
| `title` | `string` | 标题 |
| `subtitle?` | `string` | 副标题 |
| `emoji?` | `string` | **用 icon 令牌**，如 `'{{icon:mountains}}'`（不是真 emoji） |
| `color?` | `string` | 渐变，首页卡片封面占位用，如 `'linear-gradient(135deg,#b8956b,#f5efe6)'` |
| `breadcrumb?` | `string[]` | 面包屑数组 |
| `badge?` | `string` | 详情页徽章，可用 icon 令牌 |
| `facts?` | `{i?, k, v}[]` | 事实条：`i` 为 icon 令牌，`k` 标签，`v` 值 |
| `meta?` | `string[]` | 首页卡片芯片 |
| `sections` | `{title, icon?, lead?, blocks: Block[]}[]` | 章节数组 |

## 图标令牌

所有图标位置（`emoji` / `facts[].i` / `section.icon` / `badge`）都写 **`{{icon:<name>}}`** 令牌，由 `src/lib/icons.tsx` 的 `ICON_MAP` 解析为 Lucide 图标。新增前**务必核对 `ICON_MAP` 键名**，未知名回退 `Circle`。
常用键：`warning / ticket / compass / car / map-trifold / airplane / push-pin / mountains / money / house / calendar-blank / calendar / backpack / arrow-counter-clockwise / waves / shield / scroll / prohibit / lightning / fork-knife / buildings / bed / bank / circle / map-pin / banknote`。

## 区块类型 `t`

| t | 字段 | 说明 |
|---|------|------|
| `text` | `s`: string 或 string[] | 段落（`s` 可含 `<b>`/`<br>` 等简单 HTML） |
| `callout` | `tone`: 'info'\|'tip'\|'warn'；`title?`；`s`(可含 HTML) | 提示框 |
| `place` | `name`, `copy?`(导航精确名), `sub?` | 单个可复制地点框 |
| `places` | `items`: [{name,copy?,sub?}] | 多个地点框 |
| `points` | `items`: [{k, v}] | ①②③ 要点卡片 |
| `checklist` | `groups`: [{title?, items:[string]}] | 勾选清单（选中划线） |
| `table` | `head`:[列名], `rows`:[[单元格]] | 通用表格 |
| `day` | 见下 | 按天时间轴（核心） |
| `food` | `city`, `flag?`, `items`:[{name,addr?,price?,src?,note?}] | 美食卡片 |
| `budget` | `cells`:[{k,v,n?}] | 预算格子 |
| `summary` | `rows`:[{k,v}] | 双列摘要面板 |
| `gallery` | `caption?`, `items`:[{label?,title?,gradient?,src?}] | 图片画廊（占位渐变） |

## day 块（最重要）

```ts
{ t:'day', no:'D1', date:'MM/DD 周X', km:'~XXXkm', title:'...',
  items: [
    { time:'07:00', s:'纯文字行程说明' },
    { time:'12:00', place:{ name, copy, sub }, tags:['预约','拍照'], note:'补充说明' }
  ],
  sleep: { name, copy, sub },                 // 过夜点（可复制）
  eat:   [ { name, copy, sub } ],             // 备选吃饭
  note:  '当天提醒/避坑' }
```

- `tags` 数组按关键词自动配色：**免费 / 预约 / 拍照 / 换电 / 洗澡 / 可选 / 补给**。
- 时间徽章与标签同行、同尺寸、不换行。
- `copy` = 点击复制的精确导航串（默认回退到 `name`）；`sub` = 副行。

## 数据文件模板骨架

```ts
import type { Guide } from "@/types/guide";

const raw = {
  id: '<id>',
  updatedAt: '2026-08-10',
  modes: ['自驾'],
  cities: 3,
  title: '...',
  subtitle: '...',
  emoji: '{{icon:mountains}}',
  color: 'linear-gradient(135deg,#b8956b,#f5efe6)',
  facts: [
    { i: '{{icon:calendar}}', k: '出行日期', v: '...' },
    { i: '{{icon:map-trifold}}', k: '总里程', v: '...' }
  ],
  meta: ['...', '...'],
  sections: [
    { title: '行程概览', icon: '{{icon:compass}}', lead: '...', blocks: [
      { t: 'text', s: ['段落一', '段落二'] },
      { t: 'day', no: 'D1', date: 'MM/DD', km: '~XXXkm', title: '...', items: [
        { time: '07:00', s: '...' }
      ] }
    ] }
  ]
};

export const guideData: Guide = raw as unknown as Guide;
```

## 注册与接入（现站 React 流程）

1. 在 `src/data/registry.ts` 顶部加：`import { guideData as <x> } from "./<id>";`
2. 把 `<x>.id` 推入 `GUIDE_ORDER` 数组。
3. 在 `TRAVEL_GUIDES` 对象加 `[<x>.id]: <x>`。
4. 校验：`npm run build`（tsc + vite）；预览 `npm run dev` → `http://localhost:5173/#/guide/<id>`。

应用是客户端 React SPA（HashRouter），`#/guide/<id>` 无需服务端配置即可访问。
