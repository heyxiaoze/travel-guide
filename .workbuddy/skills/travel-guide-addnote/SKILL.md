---
name: travel-guide-addnote
description: This skill should be used when adding a new travel guide / travel note ("旅行笔记"/"攻略") to the Travel Guide static site in this repo. It scaffolds a new data file from a bundled template, registers it via window.registerGuide, and wires it into index.html. Trigger phrases include "加一篇攻略", "新增旅行笔记", "增加新的旅行计划", "再加一个目的地". Do not use for building entirely new websites or for editing existing guide content (use the project's normal Edit workflow for that).
agent_created: true
---

# Travel Guide Addnote

## Overview

The Travel Guide site (`C:/Documents/Travel Guide`) is a zero-build static SPA where **every travel guide is a single data file** under `data/*.js`. Adding a new note means: create one data file, register it, and wire it into `index.html`. This skill automates that scaffold and documents the data schema so the content renders correctly through `app.js` / `helpers.js`.

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

## Manual steps (if not using the script)

1. Copy `data/qinggan-2026.js` (or the bundled `assets/guide-template.js`) to `data/<id>.js`.
2. Edit the `window.registerGuide({...})` object — set a unique `id`, plus `title` / `subtitle` / `emoji` / `facts` / `meta` / `sections`.
3. Open `index.html`; add `<script src="data/<id>.js"></script>` on its own line **between** the `helpers.js` line and the `assets/js/app.js` line (load order matters: helpers → data → app).
4. Validate: `node -e "global.window={registerGuide:function(){}}; require('./data/<id>.js'); console.log('OK')"`.
5. Preview: start any static server in the repo root (e.g. `python -m http.server 8080`) and open `index.html`.

## Content schema

See `references/block-types.md` for the full field reference. Key points:

- A guide = `{ id, title, subtitle, emoji, facts[], meta[], sections[] }`.
- Each `section` = `{ title, icon, lead, blocks[] }`.
- Blocks are typed by `t`: `text`, `callout`, `place`, `places`, `points`, `checklist`, `table`, `day`, `food`, `budget`, `summary`, `gallery`.
- The **`day`** block is the core: `no`, `date`, `km`, `title`, `items[]` (each with `time` + either `s` or `place`/`tags`/`note`), optional `sleep`, `eat[]`, `note`.
- `tags:[]` on a timeline item auto-colors by keyword (免费/预约/拍照/换电/洗澡/可选/补给). Time badge and tags render on the same line, same size.
- Use `copy` on places for the precise navigation string copied on click; `sub` is the secondary line.

## Rendering notes

- `app.js` registers guides via `window.registerGuide` (defined in `helpers.js`) into `TRAVEL_GUIDES` / `GUIDE_ORDER`.
- All blocks render client-side; no build step. After editing, just refresh the preview.
- Route to a guide at `#/guide/<id>`.

## Checklist before finishing

- [ ] `data/<id>.js` exists and `node` syntax check passes.
- [ ] `index.html` has the `<script>` line placed before `assets/js/app.js`.
- [ ] `id` is unique and URL-safe (letters/digits/hyphen).
- [ ] At least one `section` with a `day` block so the page isn't empty.
- [ ] Preview renders without console errors.
