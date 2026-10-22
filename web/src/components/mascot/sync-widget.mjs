// Copies the drawing engine (draw.ts) into public/widget.js so the widget draws exactly
// the same mascot as the React app. Run after editing draw.ts:
//   node src/components/mascot/sync-widget.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const widgetPath = join(here, "../../../public/widget.js");
const src = readFileSync(join(here, "draw.ts"), "utf8");
const js = ts
  .transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2019, module: ts.ModuleKind.ESNext, removeComments: true } })
  .outputText.replace(/^export /gm, "")
  .replace(/^\s*$\n/gm, "");

const widget = readFileSync(widgetPath, "utf8");
const start = "/* @draw:start (generated from src/components/mascot/draw.ts) */";
const end = "/* @draw:end */";
const a = widget.indexOf(start), b = widget.indexOf(end);
if (a < 0 || b < 0) throw new Error("draw markers not found in widget.js");
writeFileSync(widgetPath, widget.slice(0, a + start.length) + "\n" + js + widget.slice(b));
console.log(`widget.js updated (${readFileSync(widgetPath).length} bytes)`);
