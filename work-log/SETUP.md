# 环境搭建与部署（SETUP）

---

## 1. 仓库与远程

| 仓库 | 本地路径 | 远程 | 分支 |
| --- | --- | --- | --- |
| 主项目 | `D:/Travel Guide App/travel-guide` | `git@github.com:heyxiaoze/travel-guide.git` | `main` |
| 内容仓库 | `D:/Travel Guide App/travel-guide-content` | `git@github.com:heyxiaoze/travel-guide-content.git` | `main` |

- 主项目用 **git 连接式** 部署到 Cloudflare Pages（推 `main` 自动构建）。根目录 `/functions` 即 Functions 源；`pages_build_output_dir = "dist"`。
- 内容仓库为 **公开** 仓库，存放 `guides/<id>.json` 与 `guides/index.json`。

## 2. 本地依赖与脚本

```bash
cd "D:/Travel Guide App/travel-guide"
npm install
npm run dev          # 本地开发（predev 会跑 sync-content，本地无网会回退静态）
npm run build        # tsc --noEmit && vite build && copy-functions（见雷区：本地 vite 可能跑不了）
npm run typecheck    # 仅类型检查（本地可用，推荐用显式 tsc 路径）
npm run deploy       # npm run build && wrangler pages deploy dist
```

> 内容同步可用本地模式离线跑：`CONTENT_LOCAL_DIR=../travel-guide-content npm run build`（指向本地内容仓库目录）。

## 3. Cloudflare Pages 必须设置的 Secrets（用户已于 2026-08-10 添加，待部署后实测验证）

位置：Cloudflare 控制台 → Pages → travel-guide → Settings → Environment variables（类型选 **Secret**）。
用户已添加这 4 个 Secret；若登录/保存异常，优先核对变量名大小写与值（变量名校验区分大小写，见下表的精确名称）。

| 变量名 | 值 | 用途 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 你设定的管理员密码 | 登录校验 + Cookie 签名密钥 |
| `GITHUB_TOKEN` | 具备 `repo` 权限的 PAT | Functions 写回内容仓库 |
| `CONTENT_REPO` | `heyxiaoze/travel-guide-content` | 内容仓库 `owner/repo`（注意是完整形式） |
| `DEPLOY_HOOK_URL` | Cloudflare Deploy Hook 地址 | 写入后触发站点重建 |

> 本地调试可复制 `.dev.vars.example` 为 `.dev.vars` 并填值（已被 `.gitignore` 忽略，勿提交）。

## 4. 部署流程

1. 在主项目提交并 `git push origin main` → Cloudflare 自动拉取构建。
2. 构建步骤：`sync-content`（拉已发布攻略 → `generated.ts`）→ `tsc --noEmit` → `vite build` → `copy-functions`（复制 `/functions` 到 `dist/_functions`）。
3. 注意：**Cloudflare 用的是根目录 `/functions`** 来生成 Pages Functions（日志 `Found Functions directory at /functions`）。`dist/_functions` 仅供 `wrangler pages deploy` 直接上传用，二者内容一致。

## 5. 验证清单（让 Phase 1 真正「跑起来」）

- [ ] 下一次 Cloudflare 构建日志 **不再** 出现 `Could not resolve` 错误（Functions 构建通过）。
- [ ] 构建日志中 `sync-content` 不再出现 `heyxiaoze/heyxiaoze` 双斜杠 URL（应正确拉到内容）。
- [ ] 在 Cloudflare 设置第 3 节 4 个 Secrets。
- [ ] 访问站点，右上角出现「登录」按钮；输入密码后变为「登出」且 `GET /api/me` 返回 `{isAdmin:true}`。
- [ ] 管理员保存一次编辑 → 内容仓库出现新提交 → Deploy Hook 触发重建 → 站点更新。

## 6. 🔥 环境雷区（动之前必读）

1. **后台同步工具删 `.git`/`.workbuddy`**：本机有个后台同步工具会周期性删除这两个目录（曾发生在 `C:/Documents`，仓库已迁到 `D:` 但同机，仍可能被波及）。
   - 任何 git 操作前先 `ls -a` 确认 `.git` 存在。
   - 被破坏：`git checkout HEAD -- <path>` 恢复工作树文件（index/HEAD 仍持有内容），然后尽快 `commit`/`push`。
   - 不要信任上一次「干净的 `git status`」，调用之间可能被删。
   - 注：本地 `origin/main` 远程跟踪引用在本沙箱内不会持久化（`git status` 偶现 `[gone]`）；以 `git ls-remote origin` 为准，真机上 `git fetch origin` 一次即可正常。
2. **本地 `vite` 曾跑不了（已修复）**：早期 `node_modules` 只装了 **darwin** 二进制（项目先在 macOS 上 `npm install`），Windows 上无法执行。已于 2026-08-10 补装 `@esbuild/win32-x64@0.21.5` 与 `@rollup/rollup-win32-x64-msvc@4.62.4`，现 **`npm run dev` 可在本机启动并服务 `http://localhost:5173/`**（实测 HTTP 200）。
   - ⚠️ 此问题**只因 node_modules 来自 macOS**；在 Windows 上重新 `npm install` 会自动装对平台二进制，**无需手动补**。若日后重置 node_modules，直接 `npm install` 即可。
   - 类型检查仍用 `node node_modules/typescript/bin/tsc --noEmit`（显式路径，避开沙箱 PATH 差异）。
3. **`Bash` 的 `rm` 被沙箱包裹会失败**：删文件请改用 **PowerShell `Remove-Item -Force`**。
4. **git-bash `ssh-keygen`/自带 `ssh` 损坏**：用原生 `C:/Windows/System32/OpenSSH/ssh-keygen.exe` 与 `ssh.exe`；已配置 `git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"`。
5. **路径含空格**（`Travel Guide App`）会让部分 git 显示异常，命令里路径加引号。
6. **CF 构建 Node 版本**：`22.22.0`（日志显示；项目 `engines.node >=20`）。
