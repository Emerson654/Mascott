// Renders the landing cast artwork once (prompts + seeds from src/content/brand.ts) into public/cast/<id>.jpg
// and lists the ids in src/content/cast-art.json. Run by .github/workflows/cast-art.yml on a GitHub runner:
// the free image tier allows 1 image / 45 s per IP, which a busy shared server IP never gets.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const src = readFileSync(new URL("../src/content/brand.ts", import.meta.url), "utf8");
const out = new URL("../public/cast/", import.meta.url);
const listFile = new URL("../src/content/cast-art.json", import.meta.url);
mkdirSync(out, { recursive: true });

const cast = [];
for (const block of src.split(/\n\s*\{\n\s*id: "/).slice(1)) {
  const id = block.match(/^([\w-]+)"/)?.[1];
  const seed = Number(block.match(/seed: (\d+)/)?.[1]);
  const body = block.match(/artPrompt:([\s\S]*?)\n\s*spec:/)?.[1] ?? "";
  const prompt = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)).join("").slice(0, 900);
  if (id && seed && prompt) cast.push({ id, seed, prompt });
}
if (!cast.length) throw new Error("no cast found in brand.ts");

const done = existsSync(listFile) ? JSON.parse(readFileSync(listFile, "utf8")) : [];
const force = process.argv.includes("--force");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const { id, seed, prompt } of cast) {
  if (!force && done.includes(id) && existsSync(new URL(`${id}.jpg`, out))) continue;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed}&nologo=true`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(90_000) }).catch((e) => ({ ok: false, status: e.message, headers: new Headers() }));
    const type = res.headers.get("content-type") || "";
    if (res.ok && type.startsWith("image/")) {
      writeFileSync(new URL(`${id}.jpg`, out), Buffer.from(await res.arrayBuffer()));
      if (!done.includes(id)) done.push(id);
      console.log(`ok ${id}`);
      break;
    }
    console.log(`retry ${id} (${res.status} ${type})`);
    await sleep(50_000);
  }
  await sleep(50_000); // free tier: 1 image / 45 s per IP
}
writeFileSync(listFile, JSON.stringify(done.sort(), null, 2) + "\n");
console.log(`cast art: ${done.length}/${cast.length}`);
