# 区块类型参考（data/<id>.js 的 sections[].blocks[]）

每个 block 都是 `{ t: '<type>', ...字段 }`。下面是本站点支持的全部类型及字段。

## 顶层 guide 对象
| 字段 | 说明 |
|------|------|
| `id` | 唯一英文标识，路由 `#/guide/<id>` |
| `title` / `subtitle` | 标题 / 副标题 |
| `emoji` | 卡片图标 |
| `color` | 渐变（首页卡片封面占位用，可选） |
| `breadcrumb` | 面包屑数组 |
| `badge` | 详情页徽章 |
| `facts[]` | 事实条：`{ i 图标, k 标签, v 值 }` |
| `meta[]` | 首页卡片芯片 |
| `sections[]` | 章节数组，每个 `{ title, icon, lead, blocks[] }` |

## 区块类型 t
| t | 字段 | 说明 |
|---|------|------|
| `text` | `s`: string 或 string[] | 段落 |
| `callout` | `tone`: info/tip/warn；`title`；`s`(可含 HTML) | 提示框 |
| `place` | `name`, `copy`(导航精确名), `sub` | 单个可复制地点框 |
| `places` | `items`: [{name,copy,sub}] | 多个地点框 |
| `points` | `items`: [{k, v}] | ①②③ 要点卡片 |
| `checklist` | `groups`: [{title, items:[string]}] | 勾选清单（:has 选中划线） |
| `table` | `head`:[列名], `rows`:[[单元格]] | 通用表格 |
| `day` | 见下 | 按天时间轴（核心） |
| `food` | `city`, `flag?`, `items`:[{name,addr?,price?,src?,note?}] | 美食卡片 |
| `budget` | `cells`:[{k,v,n?}] | 预算格子 |
| `summary` | `rows`:[{k,v}] | 双列摘要面板 |
| `gallery` | `caption?`, `items`:[{label,gradient?,src?}] | 图片画廊（占位渐变） |

## day 块（最重要）
```
{ t:'day', no:'D1', date:'MM/DD 周X', km:'~XXXkm', title:'...',
  items: [
    { time:'07:00', s:'纯文字行程说明' },
    { time:'12:00', place:{ name, copy, sub }, tags:['预约','拍照'], note:'补充说明' }
  ],
  sleep: { name, copy, sub },                 // 过夜点（可复制）
  eat:   [ { name, copy, sub } ],             // 备选吃饭
  note:  '当天提醒/避坑' }
```
- `tags` 数组按关键词自动配色：免费/预约/拍照/换电/洗澡/可选/补给 → 对应颜色类（绿/橙/粉/蓝/青/灰）。
- 时间 `.tl-time` 与标签 `.tl-tag` 同行、同尺寸、不换行（CSS `.tl-meta`）。

## 地点复制助手（helpers.js）
- `P(name, copy, sub)` → 单个地点框 HTML。
- `Plist(items)` → 多个地点框。
- 点击地点框复制 `copy`（默认回退到文本），弹 toast 提示。

## 注册与接入
1. 数据文件末尾 `window.registerGuide({...})` 自动注册到 `TRAVEL_GUIDES[id]` 与 `GUIDE_ORDER`。
2. 必须在 `index.html` 中 `assets/js/app.js` 之前用 `<script src="data/<id>.js"></script>` 引入。
3. 顺序：helpers → 数据文件 → app.js。
