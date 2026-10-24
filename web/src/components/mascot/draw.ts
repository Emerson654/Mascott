// Mascott drawing engine: one source of truth for the React <Mascot> and public/widget.js.
// Pure string builder (no React, no DOM) so it can be transpiled into the widget:
//   node src/components/mascot/sync-widget.mjs
// Every value injected into the markup goes through hex()/lookup tables, never raw user input.
import type { MascotSpec } from "@/lib/mascot-spec";

const INK = "#2B2340";

function rgb(c: string): number[] {
  let h = String(c || "").replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  const n = parseInt(h, 16);
  if (!/^[0-9a-fA-F]{6}$/.test(h) || isNaN(n)) return [124, 140, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mix(a: string, b: string, t: number): string {
  const A = rgb(a), B = rgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

// Mirror a fragment onto the right half of the 200x200 canvas.
const left = (s: string) => `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
const both = (s: string) => s + left(s);
const star = (x: number, y: number, r: number, fill: string, cls = "") =>
  `<path class="${cls}" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${fill}"/>`;

const BOX = "M68 44H132Q160 44 160 72V142Q160 170 132 170H68Q40 170 40 142V72Q40 44 68 44Z";
// Procedural variety: the colours pick a silhouette [path, arm x, foot y], a coat pattern,
// belly on/off, limb style and ear size, so two mascots of the same species rarely look alike.
const BODIES: [string, number, number][] = [
  ["M100 40C142 40 164 74 164 114C164 152 138 172 100 172C62 172 36 152 36 114C36 74 58 40 100 40Z", 40, 168], // bean
  ["M100 40C146 40 168 72 168 110C168 150 140 174 100 174C60 174 32 150 32 110C32 72 54 40 100 40Z", 35, 170], // round
  ["M100 42C134 42 148 68 150 96C152 120 170 132 170 150C170 168 142 174 100 174C58 174 30 168 30 150C30 132 48 120 50 96C52 68 66 42 100 42Z", 37, 170], // pear
  ["M100 44C150 44 162 56 162 104C162 158 150 172 100 172C50 172 38 158 38 104C38 56 50 44 100 44Z", 38, 168], // soft square
];

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

// Mood effects (sparkles, "!", thought bubbles). Also used as an overlay on AI artwork.
export function moodFx(spec: Partial<MascotSpec> | null | undefined): string {
  const s = spec || {};
  const A = mix(s.accent || "#FF9EC4", "#000", 0);
  const ol = mix(mix(s.primary || "#7C8CFF", "#000", 0), INK, 0.5);
  return `<g class="fx"><g class="x-h">${star(36, 48, 9, A, "tw")}${star(168, 40, 7, "#FFD45C", "tw t2")}${star(176, 76, 5, A, "tw t3")}</g>` +
    `<g class="x-o"><g class="pop"><rect x="163" y="18" width="8" height="24" rx="4" fill="${A}"/><circle cx="167" cy="51" r="4.5" fill="${A}"/></g></g>` +
    `<g class="x-k"><circle class="d1" cx="150" cy="44" r="4" fill="#fff" stroke="${ol}" stroke-width="2"/><circle class="d2" cx="164" cy="30" r="6" fill="#fff" stroke="${ol}" stroke-width="2"/><circle class="d3" cx="182" cy="14" r="8" fill="#fff" stroke="${ol}" stroke-width="2"/></g></g>`;
}

export function mascotSvg(spec: Partial<MascotSpec> | null | undefined, uid = "m"): string {
  const s = spec || {};
  const sp = ["blob", "cat", "bear", "bunny", "fox", "owl", "robot", "dragon"].indexOf(String(s.species)) >= 0 ? String(s.species) : "blob";
  const eyes = ["round", "sparkle", "sleepy"].indexOf(String(s.eyes)) >= 0 ? String(s.eyes) : "round";
  const acc = String(s.accessory || "none");
  const pro = s.style === "pro";
  const u = String(uid).replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mix(s.primary || "#7C8CFF", "#000", 0);
  const S = mix(s.secondary || "#E9ECFF", "#000", 0);
  const A = mix(s.accent || "#FF9EC4", "#000", 0);
  const ol = mix(P, INK, 0.5);
  const dark = mix(P, INK, 0.2);
  const robot = sp === "robot";
  const eyeC = robot ? "#8FF3FF" : INK;
  const sw = `stroke="${ol}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const fillB = `fill="url(#${u}g)" ${sw}`;
  const k = pro ? 0.8 : 1; // pro = calmer: smaller eyes, softer cheeks
  const v = hash(P + S + A + sp + eyes + acc);
  const [bodyD, armX, footY] = robot ? [BOX, 40, 168] : BODIES[v % 4];
  const coat = robot ? 0 : (v >>> 3) % 4; // 0 plain, 1 spots, 2 stripes, 3 two-tone hood
  const hasBelly = robot || (v >>> 5) % 3 > 0;
  const nub = (v >>> 7) % 2 > 0;
  const earS = [1, 0.88, 1.12][(v >>> 8) % 3];

  let back = "", ears = "", face = "", belly = "";

  // ---- species features ----
  if (sp === "cat") {
    ears = both(`<path d="M48 76Q49 42 55 29Q59 23 66 29L92 50Z" ${fillB}/><path d="M57 63Q58 46 61 38L79 51Z" fill="${S}"/>`);
    back = left(`<path d="M148 150Q186 150 180 118Q176 100 186 90" fill="none" stroke="${ol}" stroke-width="17" stroke-linecap="round"/><path d="M148 150Q186 150 180 118Q176 100 186 90" fill="none" stroke="${P}" stroke-width="11" stroke-linecap="round"/>`);
    face = `<path d="M96 112H104L100 117Z" fill="${A}" stroke="${mix(A, INK, 0.3)}" stroke-width="1.5" stroke-linejoin="round"/>` +
      both(`<path d="M58 113L42 109M58 119L42 121" stroke="${ol}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`);
  } else if (sp === "fox") {
    ears = both(`<path d="M44 82Q44 40 51 22Q55 15 62 22L94 48Z" ${fillB}/><path d="M53 66Q54 44 58 34L79 50Z" fill="${S}"/>`);
    back = left(`<path d="M146 158Q198 162 192 112Q188 90 172 94Q180 124 148 136Z" ${fillB}/><path d="M172 94Q188 90 192 112Q184 106 177 109Q179 100 172 94Z" fill="${S}" stroke="${ol}" stroke-width="2" stroke-linejoin="round"/>`);
    face = `<path d="M58 110Q80 102 100 116Q120 102 142 110Q138 142 100 148Q62 142 58 110Z" fill="${S}"/><ellipse cx="100" cy="115" rx="5.5" ry="4" fill="${INK}"/>`;
  } else if (sp === "bear") {
    ears = both(`<circle cx="60" cy="54" r="18" ${fillB}/><circle cx="60" cy="54" r="9" fill="${S}"/>`);
    face = `<ellipse cx="100" cy="121" rx="19" ry="14" fill="${S}"/><ellipse cx="100" cy="114" rx="6.5" ry="4.5" fill="${INK}"/>`;
  } else if (sp === "bunny") {
    ears = both(`<ellipse cx="74" cy="30" rx="13" ry="35" transform="rotate(-10 74 30)" ${fillB}/><ellipse cx="74" cy="32" rx="6" ry="25" transform="rotate(-10 74 32)" fill="${mix(S, A, 0.4)}"/>`);
    face = `<ellipse cx="100" cy="114" rx="4.5" ry="3.2" fill="${A}"/>`;
  } else if (sp === "owl") {
    ears = both(`<path d="M52 66L46 30L82 50Z" ${fillB}/>`);
    face = both(`<circle cx="80" cy="102" r="21" fill="${S}" stroke="${ol}" stroke-width="2"/>`) +
      `<path d="M94 108H106L100 117Z" fill="#FFB547" stroke="${mix("#FFB547", INK, 0.4)}" stroke-width="2" stroke-linejoin="round"/>`;
    belly = both(`<path d="M86 140l5 5 5-5M96 152l4 4 4-4" fill="none" stroke="${mix(S, INK, 0.3)}" stroke-width="2" stroke-linecap="round"/>`);
  } else if (sp === "robot") {
    ears = both(`<rect x="28" y="94" width="14" height="30" rx="6" fill="${dark}" ${sw}/>`) +
      `<path d="M100 46V24" ${sw}/><circle class="ant" cx="100" cy="19" r="7" fill="${A}" ${sw}/>`;
    face = `<rect x="56" y="76" width="88" height="56" rx="22" fill="${INK}" stroke="${ol}" stroke-width="3"/>`;
    belly = `<circle cx="100" cy="150" r="6" fill="${A}"/>` + both(`<rect x="72" y="146" width="12" height="8" rx="4" fill="${mix(S, INK, 0.15)}"/>`);
  } else if (sp === "dragon") {
    ears = both(`<path d="M66 52Q58 32 62 18Q72 32 82 46Z" fill="${mix(S, "#fff", 0.3)}" ${sw}/>`);
    back = both(`<path d="M44 104Q8 76 6 100Q18 100 14 112Q28 110 32 124Z" fill="${S}" ${sw}/>`) +
      left(`<path d="M148 154Q184 158 186 128" fill="none" stroke="${ol}" stroke-width="17" stroke-linecap="round"/><path d="M148 154Q184 158 186 128" fill="none" stroke="${P}" stroke-width="11" stroke-linecap="round"/><path d="M176 132L186 108L196 134Q186 128 176 132Z" fill="${A}" ${sw}/>`);
    face = `<circle cx="95" cy="114" r="1.8" fill="${INK}"/><circle cx="105" cy="114" r="1.8" fill="${INK}"/>`;
    belly = `<path d="M74 138H126M70 150H130M78 162H122" stroke="${mix(S, INK, 0.2)}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  } else {
    ears = `<path d="M100 42C99 31 102 25 108 20" fill="none" ${sw}/><ellipse cx="113" cy="20" rx="10" ry="6" transform="rotate(-25 113 20)" fill="${A}" ${sw}/>`;
  }

  // ---- eyes ----
  const ex = [80, 120], ey = 102;
  const er = 10 * k, eh = 12.5 * k;
  let en = "";
  for (const x of ex) {
    if (eyes === "sleepy") {
      en += `<path d="M${x - er} ${ey}Q${x} ${ey + er * 1.1} ${x + er} ${ey}" fill="none" stroke="${eyeC}" stroke-width="3.5" stroke-linecap="round"/><path d="M${x + er - 1} ${ey - 1}l4 -3" stroke="${eyeC}" stroke-width="2.5" stroke-linecap="round"/>`;
    } else if (eyes === "sparkle") {
      en += `<ellipse cx="${x}" cy="${ey}" rx="${er + 2}" ry="${eh + 2}" fill="${robot ? eyeC : `url(#${u}e)`}"/><circle cx="${x + 3.5 * k}" cy="${ey - 5 * k}" r="${4.4 * k}" fill="#fff"/>` +
        star(x - 3.5 * k, ey + 4.5 * k, 3.4 * k, "#fff");
    } else {
      en += `<ellipse cx="${x}" cy="${ey}" rx="${er}" ry="${eh}" fill="${eyeC}"/><circle cx="${x + 3 * k}" cy="${ey - 4 * k}" r="${3.6 * k}" fill="#fff"/><circle cx="${x - 3 * k}" cy="${ey + 4.5 * k}" r="${1.6 * k}" fill="#fff"/>`;
    }
  }
  const happyEyes = ex.map((x) => `<path d="M${x - 8} ${ey + 3}Q${x} ${ey - 8} ${x + 8} ${ey + 3}" fill="none" stroke="${eyeC}" stroke-width="4" stroke-linecap="round"/>`).join("");

  // ---- mouths (all present, CSS shows the one matching data-mood) ----
  const mc = robot ? eyeC : INK;
  const ms = `fill="none" stroke="${mc}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const smile = sp === "cat" ? `<path d="M92 120Q96 125 100 120Q104 125 108 120" ${ms}/>` : `<path d="M93 121Q100 128 107 121" ${ms}/>`;
  const tongue = robot ? mc : A;
  const mouths =
    `<g class="m-s">${smile}</g>` +
    `<g class="m-t"><ellipse cx="100" cy="125" rx="6.5" ry="5.5" fill="${mc}"/><ellipse cx="100" cy="128" rx="3.6" ry="2" fill="${robot ? INK : tongue}"/></g>` +
    `<g class="m-h"><path d="M90 119Q100 136 110 119Z" fill="${mc}" stroke="${mc}" stroke-width="2" stroke-linejoin="round"/><path d="M95 127Q100 131 105 127Q100 124 95 127Z" fill="${robot ? INK : tongue}"/></g>` +
    `<g class="m-o"><ellipse cx="100" cy="125" rx="4.5" ry="5.5" fill="${mc}"/></g>` +
    `<g class="m-k"><path d="M94 124Q100 120 107 123" ${ms}/></g>`;

  const cheekY = 119, cheekX = robot ? [68, 132] : [62, 138];
  const cheeks = cheekX.map((x) => `<ellipse cx="${x}" cy="${cheekY}" rx="${9 * k}" ry="${5.5 * k}" fill="${A}" opacity="${pro ? 0.22 : 0.55}"/>`).join("");

  // ---- accessories (drawn on top) ----
  let top = "";
  if (acc === "glasses") {
    top = both(`<circle cx="80" cy="102" r="16" fill="#fff" fill-opacity=".18" stroke="${INK}" stroke-width="3.5"/><path d="M64 99L48 95" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`) +
      `<path d="M95 99Q100 95 105 99" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  } else if (acc === "scarf") {
    top = `<path d="M124 146L130 178L146 174L139 142Z" fill="${mix(A, INK, 0.12)}" ${sw}/><path d="M40 130Q100 152 160 130L162 145Q100 168 38 145Z" fill="${A}" ${sw}/><path d="M60 140V152M80 145V157M100 147V160M120 145V157M140 140V152" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
  } else if (acc === "hat") {
    top = `<path d="M56 68Q56 28 100 26Q144 28 144 68Z" fill="${A}" ${sw}/><rect x="52" y="58" width="96" height="15" rx="7.5" fill="${mix(A, "#fff", 0.4)}" ${sw}/><circle cx="100" cy="24" r="10" fill="${mix(A, "#fff", 0.6)}" ${sw}/>`;
  } else if (acc === "headphones") {
    top = `<path d="M42 100Q42 30 100 30Q158 30 158 100" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M42 100Q42 30 100 30Q158 30 158 100" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"/>` +
      both(`<rect x="28" y="86" width="20" height="36" rx="9" fill="${A}" stroke="${INK}" stroke-width="3"/>`);
  } else if (acc === "bow") {
    top = `<g transform="rotate(14 130 50)"><path d="M130 50Q110 32 110 50Q110 68 130 54ZM130 50Q150 32 150 50Q150 68 130 54Z" fill="${A}" ${sw}/><circle cx="130" cy="52" r="5.5" fill="${mix(A, INK, 0.15)}" ${sw}/></g>`;
  } else if (acc === "crown") {
    top = `<path d="M74 50L78 20L91 36L100 14L109 36L122 20L126 50Q100 56 74 50Z" fill="#FFD45C" stroke="${mix("#FFD45C", INK, 0.45)}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="40" r="4" fill="${A}"/><circle cx="84" cy="43" r="2.6" fill="#fff"/><circle cx="116" cy="43" r="2.6" fill="#fff"/>`;
  }

  const arm = (x: number, cls: string) => `<g class="${cls}">${nub
    ? `<ellipse cx="${x}" cy="116" rx="9" ry="14" fill="${P}" ${sw}/>`
    : `<rect x="${x - 10}" y="104" width="20" height="36" rx="10" fill="${P}" ${sw}/>`}</g>`;
  const pat = coat === 1
    ? [[62, 64, 9], [138, 58, 6], [152, 134, 9], [48, 140, 6], [122, 46, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${mix(P, S, 0.55)}" opacity=".8"/>`).join("")
    : coat === 2
      ? `<path d="M100 40V58M84 42L87 57M116 42L113 57" stroke="${dark}" stroke-width="5" stroke-linecap="round" opacity=".45"/>` +
        both(`<path d="M30 108H48M30 122H45" stroke="${dark}" stroke-width="5" stroke-linecap="round" opacity=".4"/>`)
      : coat === 3 ? `<path d="M20 20H180V74Q100 60 20 74Z" fill="${mix(P, INK, 0.14)}"/>` : "";
  const earT = earS === 1 ? "" : ` transform="translate(100 62) scale(${earS}) translate(-100 -62)"`;

  return (
    `<defs><radialGradient id="${u}g" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${mix(P, "#fff", 0.45)}"/><stop offset=".55" stop-color="${P}"/><stop offset="1" stop-color="${mix(P, INK, 0.18)}"/></radialGradient>` +
    `<linearGradient id="${u}e" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${INK}"/><stop offset="1" stop-color="${mix(INK, A, 0.6)}"/></linearGradient>` +
    `<clipPath id="${u}c"><path d="${bodyD}"/></clipPath><radialGradient id="${u}s"><stop offset="0" stop-color="${INK}" stop-opacity=".22"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse class="sh" cx="100" cy="182" rx="58" ry="10" fill="url(#${u}s)"/>` +
    `<g class="pk"><g class="j"><g class="b">` +
    back + arm(armX, "al") + arm(200 - armX, "ar") +
    both(`<ellipse cx="80" cy="${footY}" rx="15" ry="9" fill="${dark}" ${sw}/>`) +
    `<g${earT}>${ears}</g>` +
    `<path d="${bodyD}" ${fillB}/>` +
    (pat ? `<g clip-path="url(#${u}c)">${pat}</g>` : "") +
    (hasBelly ? `<ellipse cx="100" cy="146" rx="${robot ? 34 : 40}" ry="${robot ? 18 : 25}" fill="${S}" opacity="${robot ? 0.9 : 1}"/>` : "") + belly +
    `<ellipse cx="70" cy="62" rx="15" ry="8" transform="rotate(-32 70 62)" fill="#fff" opacity=".35"/>` +
    `<g class="f">${face}${cheeks}<g class="ey"><g class="en">${en}</g><g class="eh">${happyEyes}</g></g>${mouths}</g>` +
    top +
    `</g></g></g>` + moodFx(s)
  );
}

// AI artwork usually sits on a plain studio background. Flood-fill it away from the edges
// (soft, colour-decontaminated edge) so the character floats like a sticker. Returns a PNG
// data URL, or null when the background is not plain, already transparent, or the canvas
// is cross-origin tainted; the caller then keeps the original image with a soft mask.
export function cutout(img: HTMLImageElement): string | null {
  try {
    // Keep the top-centred 90% square: drops the free image tier's corner watermark before keying the background.
    const sw = img.naturalWidth * 0.9, sh = img.naturalHeight * 0.9, sx = img.naturalWidth * 0.05, sy = img.naturalHeight * 0.01;
    const sc = Math.min(1, 512 / Math.max(sw, sh));
    const w = Math.round(sw * sc), h = Math.round(sh * sc);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    if (!g || !w || !h) return null;
    g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const im = g.getImageData(0, 0, w, h), d = im.data;
    const corners = [0, w - 1, (h - 1) * w, h * w - 1].map((q) => q * 4);
    if (corners.some((q) => d[q + 3] < 250)) return null;
    const bg = [0, 1, 2].map((k) => corners.reduce((t, q) => t + d[q + k], 0) / 4);
    const dist = (q: number) => Math.hypot(d[q] - bg[0], d[q + 1] - bg[1], d[q + 2] - bg[2]);
    if (corners.some((q) => dist(q) > 24)) return null;
    const seen = new Uint8Array(w * h), stack: number[] = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    let n = 0;
    while (stack.length) {
      const i = stack.pop() as number, q = i * 4;
      if (seen[i]) continue;
      seen[i] = 1;
      const e = dist(q);
      if (e > 48) continue; // reached the character
      const a = e < 20 ? 0 : (e - 20) / 28;
      for (let k = 0; k < 3; k++) d[q + k] = a ? Math.max(0, Math.min(255, (d[q + k] - bg[k] * (1 - a)) / a)) : d[q + k];
      d[q + 3] = Math.round(a * 255);
      n++;
      const x = i % w;
      if (x > 0) stack.push(i - 1);
      if (x < w - 1) stack.push(i + 1);
      if (i >= w) stack.push(i - w);
      if (i < w * (h - 1)) stack.push(i + w);
    }
    if (n < w * h * 0.05 || n > w * h * 0.95) return null;
    g.putImageData(im, 0, 0);
    return c.toDataURL("image/png");
  } catch {
    return null;
  }
}

// Shared animation sheet. Poses are static transforms; loops run on top after a short
// delay so the pose change transitions smoothly first. Reduced motion keeps poses only.
export const MASCOT_CSS = `
.msc{overflow:visible;display:block}
.msc .pk,.msc .j,.msc .b,.msc .al,.msc .ar,.msc .ey,.msc .m-t,.msc .sh,.msc .fx *{transform-box:fill-box}
.msc .pk,.msc .j,.msc .b{transform-origin:50% 100%}
.msc .b{animation:msc-br 3.6s ease-in-out infinite}
.msc .j{transition:transform .5s cubic-bezier(.34,1.4,.5,1)}
.msc .al,.msc .ar{transform-origin:50% 14%;transition:transform .45s cubic-bezier(.34,1.5,.5,1)}
.msc .al{transform:rotate(18deg)}.msc .ar{transform:rotate(-18deg)}
.msc .ey{transform-origin:50% 50%;animation:msc-bl 5s infinite}
.msc .sh{transform-origin:50% 50%}
.msc .ant{animation:msc-gl 2s ease-in-out infinite}
.msc .m-t,.msc .m-h,.msc .m-o,.msc .m-k,.msc .eh,.msc .fx>g{display:none}
.msc[data-mood=talk] .m-t,.msc[data-mood=happy] .m-h,.msc[data-mood=surprised] .m-o,.msc[data-mood=think] .m-k,.msc[data-mood=happy] .eh,
.msc[data-mood=happy] .x-h,.msc[data-mood=surprised] .x-o,.msc[data-mood=think] .x-k{display:inline}
.msc[data-mood=talk] .m-s,.msc[data-mood=happy] .m-s,.msc[data-mood=surprised] .m-s,.msc[data-mood=think] .m-s,.msc[data-mood=happy] .en{display:none}
.msc[data-mood=wave] .ar{transform:rotate(-125deg);animation:msc-wv 1.1s .4s ease-in-out infinite}
.msc[data-mood=point] .ar{transform:rotate(-94deg);animation:msc-pt 1.2s .4s ease-in-out infinite}
.msc[data-mood=point] .j{transform:rotate(5deg)}
.msc[data-mood=talk] .m-t{transform-origin:50% 0;animation:msc-tk .3s ease-in-out infinite alternate}
.msc[data-mood=talk] .j{animation:msc-nod 1.4s ease-in-out infinite}
.msc[data-mood=happy] .al{transform:rotate(135deg)}.msc[data-mood=happy] .ar{transform:rotate(-135deg)}
.msc[data-mood=happy] .j{animation:msc-hop .8s cubic-bezier(.3,0,.4,1) infinite}
.msc[data-mood=happy] .sh{animation:msc-shh .8s cubic-bezier(.3,0,.4,1) infinite}
.msc[data-mood=surprised] .al{transform:rotate(70deg)}.msc[data-mood=surprised] .ar{transform:rotate(-70deg)}
.msc[data-mood=surprised] .j{animation:msc-sp .55s cubic-bezier(.3,0,.4,1) both}
.msc[data-mood=surprised] .ey{animation:none;transform:scale(1.18)}
.msc[data-mood=think] .j{transform:rotate(-5deg)}
.msc[data-mood=think] .ar{transform:rotate(-55deg)}
.msc[data-mood=think] .en{transform:translate(-3px,-3px)}
.msc .tw{transform-origin:50% 50%;animation:msc-tw 1.2s ease-in-out infinite}.msc .t2{animation-delay:.3s}.msc .t3{animation-delay:.6s}
.msc .pop{transform-origin:50% 100%;animation:msc-pop .4s cubic-bezier(.34,1.6,.5,1) both}
.msc .d1,.msc .d2,.msc .d3{animation:msc-fl 1.8s ease-in-out infinite}.msc .d2{animation-delay:.25s}.msc .d3{animation-delay:.5s}
.msc.p1 .pk{animation:msc-pa .6s cubic-bezier(.3,0,.3,1)}.msc.p2 .pk{animation:msc-pb .6s cubic-bezier(.3,0,.3,1)}
@keyframes msc-br{50%{transform:scale(.988,1.025)}}
@keyframes msc-bl{0%,93%,100%{transform:none}96%{transform:scaleY(.1)}}
@keyframes msc-gl{50%{opacity:.55}}
@keyframes msc-wv{0%,100%{transform:rotate(-125deg)}50%{transform:rotate(-150deg)}}
@keyframes msc-pt{0%,100%{transform:rotate(-94deg)}50%{transform:rotate(-88deg) translateY(2px)}}
@keyframes msc-tk{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
@keyframes msc-nod{50%{transform:rotate(-2deg) translateY(-1px)}}
@keyframes msc-hop{0%,100%{transform:none}15%{transform:scale(1.07,.9)}45%{transform:translateY(-18px) scale(.95,1.06)}72%{transform:none}82%{transform:scale(1.05,.95)}}
@keyframes msc-shh{45%{transform:scale(.7);opacity:.6}}
@keyframes msc-sp{0%{transform:none}30%{transform:translateY(-10px) scale(.93,1.09)}60%{transform:scale(1.04,.96)}100%{transform:none}}
@keyframes msc-tw{0%,100%{transform:scale(.4) rotate(0);opacity:.3}50%{transform:scale(1) rotate(45deg);opacity:1}}
@keyframes msc-pop{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes msc-fl{50%{transform:translateY(-4px)}}
@keyframes msc-pa{0%{transform:none}25%{transform:scale(1.14,.82)}55%{transform:scale(.9,1.12) translateY(-6px)}80%{transform:scale(1.04,.97)}100%{transform:none}}
@keyframes msc-pb{0%{transform:none}25%{transform:scale(1.14,.82)}55%{transform:scale(.9,1.12) translateY(-6px)}80%{transform:scale(1.04,.97)}100%{transform:none}}
.mart{position:relative;display:inline-block;line-height:0;vertical-align:middle}
.mart>*,.mart .aj,.mart .ab,.mart .aimg{position:absolute;inset:0;width:100%;height:100%;display:block}
.mart .apk,.mart .aj,.mart .ab{transform-origin:50% 92%}
.mart .ab{animation:msc-br 3.6s ease-in-out infinite}
.mart .aj{transition:transform .5s cubic-bezier(.34,1.4,.5,1)}
.mart .aimg{object-fit:contain;opacity:0;transition:opacity .5s ease;-webkit-mask:radial-gradient(closest-side,#000 74%,transparent);mask:radial-gradient(closest-side,#000 74%,transparent)}
.mart.cut .aimg{-webkit-mask:none;mask:none}
.mart .ash{top:auto;left:20%;bottom:-1%;width:60%;height:9%;background:radial-gradient(closest-side,rgba(43,35,64,.24),transparent);opacity:0;transition:opacity .5s}
.mart .afb{transition:opacity .5s ease}.mart .afx{display:none;pointer-events:none}
.mart.ok .aimg,.mart.ok .ash{opacity:1}.mart.ok .afb{opacity:0}.mart.ok .afx{display:block}.mart.er .aimg{display:none}
.mart.rv.ok .aimg{animation:msc-rv 1.2s cubic-bezier(.2,.75,.25,1) both}.mart.rv.ok .afb{transition-duration:.9s}
.mart[data-mood=idle] .aj{animation:msc-af 3.6s ease-in-out infinite}.mart[data-mood=idle] .ash{animation:msc-as 3.6s ease-in-out infinite}
.mart[data-mood=wave] .aj{animation:msc-aw 1.1s ease-in-out infinite}
.mart[data-mood=talk] .aj{animation:msc-at .42s ease-in-out infinite}
.mart[data-mood=happy] .aj{animation:msc-ah .8s cubic-bezier(.3,0,.4,1) infinite}.mart[data-mood=happy] .ash{animation:msc-shh .8s cubic-bezier(.3,0,.4,1) infinite}
.mart[data-mood=surprised] .aj{animation:msc-ao .6s cubic-bezier(.3,0,.4,1) both}
.mart[data-mood=think] .aj{animation:msc-ak 3.2s ease-in-out infinite}
.mart[data-mood=point] .aj{transform:rotate(7deg);animation:msc-ap 1.2s .4s ease-in-out infinite}
.mart.p1 .apk{animation:msc-pa .6s cubic-bezier(.3,0,.3,1)}.mart.p2 .apk{animation:msc-pb .6s cubic-bezier(.3,0,.3,1)}
@keyframes msc-af{50%{transform:translateY(-5%)}}
@keyframes msc-as{50%{transform:scale(.82);opacity:.6}}
@keyframes msc-aw{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
@keyframes msc-at{50%{transform:translateY(-3%) scale(.99,1.02)}}
@keyframes msc-ah{0%,100%{transform:none}15%{transform:scale(1.07,.9)}45%{transform:translateY(-14%) scale(.95,1.06)}72%{transform:none}82%{transform:scale(1.05,.95)}}
@keyframes msc-ao{0%{transform:none}25%{transform:translateY(3%) scale(1.06,.9)}55%{transform:translateY(-6%) scale(.92,1.1) rotate(-3deg)}80%{transform:scale(1.02,.98)}100%{transform:none}}
@keyframes msc-ak{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(3deg) translateY(-2%)}}
@keyframes msc-ap{0%,100%{transform:rotate(7deg)}50%{transform:rotate(9deg) translateX(3%)}}
@keyframes msc-rv{from{filter:blur(24px) saturate(0);transform:scale(.92);opacity:0}40%{opacity:1}to{filter:none;transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.msc *,.msc.p1 .pk,.msc.p2 .pk,.mart *{animation:none!important;transition:none!important}.mart .aimg{transition:opacity .4s!important}}
`;
