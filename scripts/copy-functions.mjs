// Build step: copy the source /functions directory into dist/_functions.
// Cloudflare Pages (direct upload via `wrangler pages deploy dist`) reads
// Functions from `_functions` inside the output directory. The root /functions
// is also used by `wrangler pages dev` for local testing.
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const PROJECT = process.cwd();
const SRC = path.join(PROJECT, "functions");
const DEST = path.join(PROJECT, "dist", "_functions");

await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });
await cp(SRC, DEST, { recursive: true });
console.log(`[copy-functions] ${SRC} -> ${DEST}`);
