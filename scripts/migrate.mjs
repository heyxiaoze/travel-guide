// scripts/migrate.mjs
// 一次性迁移：把 src/data/*.ts（Guide 对象）转成内容仓库的 guides/<id>.json + guides/index.json。
// 用法：node scripts/migrate.mjs   （可选 CONTENT_REPO_DIR 指定输出目录，默认 ../travel-guide-content）
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const PROJECT = process.cwd();
const SRC_DATA = path.join(PROJECT, "src", "data");
const OUT_DIR = process.env.CONTENT_REPO_DIR
  ? path.resolve(PROJECT, process.env.CONTENT_REPO_DIR)
  : path.resolve(PROJECT, "..", "travel-guide-content");
const GUIDES_OUT = path.join(OUT_DIR, "guides");

// 与 src/data/registry.ts 的静态顺序保持一致
const FILES = [
  { file: "qinggan-2026.ts", id: "qinggan-2026" },
  { file: "chuanyu-2026.ts", id: "chuanyu-2026" },
  { file: "dalian-qiqihaer-2026.ts", id: "dalian-qiqihaer-2026" },
];

async function loadGuide(relPath) {
  const abs = path.join(SRC_DATA, relPath);
  const code = await readFile(abs, "utf8");
  // TypeScript 单文件转译为 CommonJS（纯 JS，不依赖原生二进制），剥离类型与 `import type`
  const out = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      isolatedModules: true,
    },
  });
  // 内存求值，避免落盘临时文件（沙箱会拦截 rm）
  const moduleObj = { exports: {} };
  const fn = new Function("module", "exports", "require", out.outputText);
  fn(moduleObj, moduleObj.exports, () => ({}));
  return moduleObj.exports.guideData;
}

async function main() {
  await mkdir(GUIDES_OUT, { recursive: true });
  const index = [];
  const order = [];
  for (const { file, id } of FILES) {
    const guide = await loadGuide(file);
    if (!guide || guide.id !== id) {
      throw new Error(`id mismatch in ${file}: ${guide?.id} != ${id}`);
    }
    const published = { ...guide, status: "published" };
    await writeFile(
      path.join(GUIDES_OUT, `${id}.json`),
      JSON.stringify(published, null, 2) + "\n",
      "utf8",
    );
    index.push({
      id: guide.id,
      status: "published",
      title: guide.title,
      subtitle: guide.subtitle ?? "",
      emoji: guide.emoji ?? "",
      color: guide.color ?? "",
      updatedAt: guide.updatedAt ?? "",
      badge: guide.badge ?? "",
      modes: guide.modes ?? [],
      cities: guide.cities ?? 0,
    });
    order.push(id);
    console.log(`migrated ${id}`);
  }
  index.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  await writeFile(
    path.join(GUIDES_OUT, "index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8",
  );

  const readme = `# travel-guide-content

Travel Guide 站点的**内容仓库（公开）**，作为站点唯一真相源。

- \`guides/<id>.json\` —— 单篇攻略完整数据（含 \`status: "draft" | "published"\`）
- \`guides/index.json\` —— 攻略清单（id / status / 标题 / emoji / color / updatedAt 等），供站点枚举

站点构建期通过 \`raw.githubusercontent.com\` 拉取本仓库「已发布」攻略生成静态快照；
管理员经 Cloudflare Pages Functions + GitHub PAT 写回本仓库并触发重新部署。
每篇攻略的独立提交历史即为该攻略的**版本历史**。
`;
  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");

  console.log(`\nDone. Wrote ${FILES.length} guides + index.json -> ${GUIDES_OUT}`);
  console.log("Next: 在 GitHub 创建公开仓库 travel-guide-content，将该目录 git init 后推送。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
