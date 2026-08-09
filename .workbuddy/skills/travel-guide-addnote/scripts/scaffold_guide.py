#!/usr/bin/env python3
# scaffold_guide.py — 在 Travel Guide 站点新增一篇攻略（脚手架）
#
# 用法：
#   python scaffold_guide.py --id qinggan-2027 --title "青甘大环线 2027" --subtitle "..." [--emoji 🏜️]
#
# 行为：
#   1. 复制 skills 内的 guide-template.js 到 data/<id>.js（已替换占位符）
#   2. 在 index.html 的 app.js 引入行之前插入 <script src="data/<id>.js"></script>
#   3. 用 node 校验数据文件语法（可选，依赖 node）
#
# 注意：脚本不覆盖已存在的 data/<id>.js。

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parents[1]          # travel-guide-addnote/
REPO = Path(__file__).resolve().parents[4]               # Travel Guide 仓库根
TEMPLATE = SKILL_DIR / "assets" / "guide-template.js"


def main():
    ap = argparse.ArgumentParser(description="Scaffold a new travel guide data file.")
    ap.add_argument("--id", required=True, help="唯一英文 id，如 qinggan-2027")
    ap.add_argument("--title", required=True, help="攻略标题")
    ap.add_argument("--subtitle", default="", help="副标题（含日期）")
    ap.add_argument("--emoji", default="🧭", help="卡片图标")
    args = ap.parse_args()

    data_file = REPO / "data" / f"{args.id}.js"
    if data_file.exists():
        print(f"⚠️ 已存在 {data_file}，未覆盖。请换一个 id 或手动编辑该文件。")
        return 1

    if not TEMPLATE.exists():
        print(f"❌ 找不到模板 {TEMPLATE}")
        return 1

    text = TEMPLATE.read_text(encoding="utf-8")
    text = text.replace("your-id-2026", args.id)
    text = text.replace("新旅行攻略标题", args.title)
    text = text.replace("一句话副标题，含出发/返程日期", args.subtitle)
    text = text.replace("🏜️", args.emoji)
    # 文件名注释也更新一下
    text = text.replace("data/<your-id>.js", f"data/{args.id}.js")
    text = text.replace('<你的文件>.js', f"{args.id}.js")

    data_file.write_text(text, encoding="utf-8")
    print(f"✅ 已创建 {data_file}")

    # 在 index.html 的 app.js 行之前插入引入行
    index = REPO / "index.html"
    idx = index.read_text(encoding="utf-8")
    new_line = f'  <script src="data/{args.id}.js"></script>'
    if new_line.strip() in idx:
        print("ℹ️ index.html 已包含该引入行，跳过。")
    else:
        # 匹配 app.js 引入行，在其上方插入
        pat = re.compile(r'(\s*<script src="assets/js/app\.js"></script>)')
        if pat.search(idx):
            idx = pat.sub(new_line + r"\1", idx)
            index.write_text(idx, encoding="utf-8")
            print(f"✅ 已在 index.html 加入引入行：{new_line.strip()}")
        else:
            print("⚠️ 未在 index.html 找到 assets/js/app.js 引入行，请手动添加：")
            print(f"   {new_line.strip()}")

    # 语法校验（依赖 node）
    node = shutil.which("node")
    if node:
        try:
            subprocess.run([node, "-e",
                            "global.window={registerGuide:function(){}};require("
                            + repr(str(data_file)) + ");console.log('OK')"],
                           check=True)
            print("✅ 数据文件语法校验通过。")
        except Exception as e:
            print(f"⚠️ node 校验失败：{e}")
    else:
        print("ℹ️ 未检测到 node，跳过语法校验（可用浏览器预览自查）。")

    print("➡️ 预览：在仓库根目录起静态服务，访问 index.html 查看。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
