# 旅行手账 · Travel Guides

青甘大环线（2026 国庆错峰床车自驾）攻略站。纯静态、零构建、多端兼容，可直接托管到 GitHub + Cloudflare Pages（免费）。

## 本地预览
```bash
cd "Travel Guide"
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 部署到 Cloudflare Pages（免费）
1. 把本目录推到 GitHub 新建的仓库（见下）。
2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → 连接你的 GitHub 仓库。
3. 构建设置：
   - Framework preset：**None**
   - Build command：留空
   - Build output directory：`/`（根目录）
4. 点 **Save and Deploy**。每次 `git push` 自动重新部署，得到 `*.pages.dev` 免费域名（也可绑自定义域名）。

## 推送到 GitHub
```bash
git remote add origin https://github.com/<你的用户名>/travel-guides.git
git branch -M main
git add -A
git commit -m "add Qinghai-Gansu 2026 travel guide"
git push -u origin main
```

## 如何新增一篇攻略（框架用法）
1. 复制 `data/qinggan-2026.js`，改成你的行程，保存为 `data/你的行程.js`。
2. 在 `index.html` 的 `<!-- 新增攻略 -->` 注释下方加一行：
   ```html
   <script src="data/你的行程.js"></script>
   ```
3. 提交并推送，首页会自动出现新卡片。

数据格式见 `data/qinggan-2026.js`：每个攻略是一个对象，用 `window.registerGuide({...})` 注册，
`sections` 里用 `text / callout / place / places / table / day / food / budget` 等区块类型组合即可。
地点用 `P('名称','复制内容','副标题')` 生成“小框框+复制图标”。
