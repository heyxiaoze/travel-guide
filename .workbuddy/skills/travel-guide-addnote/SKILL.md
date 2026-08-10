---
name: travel-guide-addnote
description: This skill should be used when adding a new travel guide / travel note ("旅行笔记"/"攻略") to the Travel Guide static site in this repo. It scaffolds a new data file from a bundled template, registers it via window.registerGuide, and wires it into index.html. Trigger phrases include "加一篇攻略", "新增旅行笔记", "增加新的旅行计划", "再加一个目的地". Do not use for building entirely new websites or for editing existing guide content (use the project's normal Edit workflow for that).
agent_created: true
---

# Travel Guide Addnote

## Overview

This repo is a **React + Vite + TypeScript SPA** (shadcn/ui + Tailwind). **Every travel guide is a single TS data module** under `src/data/<id>.ts`, and is registered in `src/data/registry.ts` (imported into `GUIDE_ORDER` + `TRAVEL_GUIDES`). There is **no** `window.registerGuide` / `data/*.js` / `index.html <script>` wiring anymore — that was the old vanilla site, which is now legacy/dead weight.

> ⚠️ The bundled `scripts/scaffold_guide.py` + `assets/guide-template.js` still target the **legacy vanilla site** (`data/<id>.js` + `index.html` `<script>`). Do **not** use them for the live React site — they produce files that won't render. Use the Manual steps below instead.

Adding a new note means: create `src/data/<id>.ts`, register it in `src/data/registry.ts`, then `npm run build` to verify. The content schema (block types) is the same as the legacy site and is documented in `references/block-types.md`.

## When to use

- User wants to add a new destination / trip plan to this site.
- User says "加一篇攻略", "新增旅行笔记", "再来一个目的地", etc.
- Never use it to rewrite an existing guide's content — that is a normal Edit task.

## Quick start (auto-scaffold)

Run the bundled scaffolder from the repo root. It copies the template, fills the placeholders, and inserts the `<script>` tag into `index.html` before `assets/js/app.js`.

```bash
# 仓库根目录（含 data/ index.html）
python "<repo>/.workbuddy/skills/travel-guide-addnote/scripts/scaffold_guide.py" \
  --id qinggan-2027 --title "青甘大环线 2027" --subtitle "大连 ⇄ 西宁 · 2027/09/24 出发" --emoji 🏜️
```

The script:
1. Copies `assets/guide-template.js` → `data/<id>.js` and replaces `id` / `title` / `subtitle` / `emoji` placeholders.
2. Inserts `<script src="data/<id>.js"></script>` right before `assets/js/app.js` in `index.html`.
3. Validates JS syntax with `node` if available.

It refuses to overwrite an existing `data/<id>.js`.

## Manual steps (React / Vite SPA — the live site)

1. Copy an existing module (e.g. `src/data/qinggan-2026.ts`) to `src/data/<id>.ts` and set a unique `id`, plus `title` / `subtitle` / `emoji` / `facts` / `meta` / `sections`. Keep the trailing `export const guideData: Guide = raw as unknown as Guide;`.
2. Icons use the `{{icon:name}}` token, resolved to Lucide via `src/lib/icons.tsx` (`ICON_MAP`). Valid names include: `warning, ticket, compass, car, map-trifold, airplane, push-pin, mountains, money, house, calendar-blank, calendar, backpack, arrow-counter-clockwise, waves, shield, scroll, prohibit, lightning, fork-knife, buildings, bed, bank, circle, map-pin, banknote`. Unknown names fall back to a `Circle`.
3. Register it in `src/data/registry.ts`: add `import { guideData as <x> } from "./<id>";`, push `<x>.id` into `GUIDE_ORDER`, and add `[<x>.id]: <x>` to `TRAVEL_GUIDES`.
4. Validate + render: `npm run build` (runs `tsc --noEmit` + `vite build`). Start the dev server with `npm run dev` and open `#/guide/<id>`.
5. Preview: `npm run dev` → open `http://localhost:5173/#/guide/<id>`.

## Content schema

See `references/block-types.md` for the full field reference. Key points:

- A guide = `{ id, title, subtitle, emoji, facts[], meta[], sections[] }`.
- Each `section` = `{ title, icon, lead, blocks[] }`.
- Blocks are typed by `t`: `text`, `callout`, `place`, `places`, `points`, `checklist`, `table`, `day`, `food`, `budget`, `summary`, `gallery`.
- The **`day`** block is the core: `no`, `date`, `km`, `title`, `items[]` (each with `time` + either `s` or `place`/`tags`/`note`), optional `sleep`, `eat[]`, `note`.
- `tags:[]` on a timeline item auto-colors by keyword (免费/预约/拍照/换电/洗澡/可选/补给). Time badge and tags render on the same line, same size.
- Use `copy` on places for the precise navigation string copied on click; `sub` is the secondary line.

## Rendering notes

- Guides register through `src/data/registry.ts` → `GUIDE_ORDER` + `TRAVEL_GUIDES`. The app is a client-side React SPA (HashRouter), so routes like `#/guide/<id>` work with no server config.
- All blocks render client-side. After editing, run `npm run build` (or `npm run dev`) to verify — there **is** a build step now (TypeScript + Vite).
- The `{{icon:name}}` tokens and `tags` keyword colors (免费/预约/拍照/换电/洗澡/可选/补给) render identically to the legacy schema.

## Checklist before finishing

- [ ] `src/data/<id>.ts` exists and `npm run build` (tsc) passes.
- [ ] `src/data/registry.ts` imports it and adds it to `GUIDE_ORDER` + `TRAVEL_GUIDES`.
- [ ] `id` is unique and URL-safe (letters/digits/hyphen).
- [ ] At least one `section` with a `day` block so the page isn't empty.
- [ ] Preview at `#/guide/<id>` renders without console errors.
