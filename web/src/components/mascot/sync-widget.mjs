// Builds public/widget.js from widget.src.js + the drawing engine (draw.ts), so the widget
// draws exactly the same mascot as the React app, then minifies it (budget: 30 KB).
// Run after editing draw.ts or widget.src.js:
//   node src/components/mascot/sync-widget.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { minify } = require("next/dist/compiled/terser"); // ships with Next, no extra dependency

const here = dirname(fileURLToPath(import.meta.url));
const widgetPath = join(here, "../../../public/widget.js");
const draw = ts
  .transpileModule(readFileSync(join(here, "draw.ts"), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2019, module: ts.ModuleKind.ESNext, removeComments: true },
  })
  .outputText.replace(/^export /gm, "");

const src = readFileSync(join(here, "widget.src.js"), "utf8");
const start = "/* @draw:start (generated from src/components/mascot/draw.ts) */";
const end = "/* @draw:end */";
const a = src.indexOf(start), b = src.indexOf(end);
if (a < 0 || b < 0) throw new Error("draw markers not found in widget.src.js");
const full = src.slice(0, a) + draw + src.slice(b + end.length);

const out = await minify(full, { ecma: 2019, compress: { passes: 2 }, mangle: true, format: { comments: /^!/ } });
const code = "/* eslint-disable */\n" + out.code + "\n";
writeFileSync(widgetPath, code);
const kb = Buffer.byteLength(code) / 1024;
console.log(`widget.js updated (${kb.toFixed(1)} KB)`);
if (kb > 30) throw new Error("widget.js is over the 30 KB budget");
