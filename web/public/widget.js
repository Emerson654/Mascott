/*! Mascott widget | https://mascotte.io
 * <script src="https://mascotte.io/widget.js" data-mascot='{"species":"cat",...}' data-name="Pip" data-greeting="Hi!"></script>
 * API: Mascott.pointAt(cssSelector, text?) -> boolean, Mascott.say(text), Mascott.open(), Mascott.close()
 */
(function () {
  "use strict";
  if (window.Mascott && window.Mascott.loaded) return;
  var script = document.currentScript || document.querySelector('script[src*="widget.js"]');

/* @draw:start (generated from src/components/mascot/draw.ts) */
const INK = "#2B2340";
function rgb(c) {
let h = String(c || "").replace("#", "");
if (h.length === 3)
h = h.replace(/./g, "$&$&");
const n = parseInt(h, 16);
if (!/^[0-9a-fA-F]{6}$/.test(h) || isNaN(n))
return [124, 140, 255];
return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
const A = rgb(a), B = rgb(b);
return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const both = (s) => s + `<g transform="matrix(-1 0 0 1 200 0)">${s}</g>`;
const star = (x, y, r, fill, cls = "") => `<path class="${cls}" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${fill}"/>`;
const BEAN = "M100 40C142 40 164 74 164 114C164 152 138 172 100 172C62 172 36 152 36 114C36 74 58 40 100 40Z";
const BOX = "M68 44H132Q160 44 160 72V142Q160 170 132 170H68Q40 170 40 142V72Q40 44 68 44Z";
function mascotSvg(spec, uid = "m") {
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
const k = pro ? 0.8 : 1;
let back = "", ears = "", face = "", belly = "";
if (sp === "cat") {
ears = both(`<path d="M48 76Q49 42 55 29Q59 23 66 29L92 50Z" ${fillB}/><path d="M57 63Q58 46 61 38L79 51Z" fill="${S}"/>`);
back = `<path d="M148 150Q186 150 180 118Q176 100 186 90" fill="none" stroke="${ol}" stroke-width="17" stroke-linecap="round"/><path d="M148 150Q186 150 180 118Q176 100 186 90" fill="none" stroke="${P}" stroke-width="11" stroke-linecap="round"/>`;
face = `<path d="M96 112H104L100 117Z" fill="${A}" stroke="${mix(A, INK, 0.3)}" stroke-width="1.5" stroke-linejoin="round"/>` +
both(`<path d="M58 113L42 109M58 119L42 121" stroke="${ol}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`);
}
else if (sp === "fox") {
ears = both(`<path d="M44 82Q44 40 51 22Q55 15 62 22L94 48Z" ${fillB}/><path d="M53 66Q54 44 58 34L79 50Z" fill="${S}"/>`);
back = `<path d="M146 158Q198 162 192 112Q188 90 172 94Q180 124 148 136Z" ${fillB}/><path d="M172 94Q188 90 192 112Q184 106 177 109Q179 100 172 94Z" fill="${S}" stroke="${ol}" stroke-width="2" stroke-linejoin="round"/>`;
face = `<path d="M58 110Q80 102 100 116Q120 102 142 110Q138 142 100 148Q62 142 58 110Z" fill="${S}"/><ellipse cx="100" cy="115" rx="5.5" ry="4" fill="${INK}"/>`;
}
else if (sp === "bear") {
ears = both(`<circle cx="60" cy="54" r="18" ${fillB}/><circle cx="60" cy="54" r="9" fill="${S}"/>`);
face = `<ellipse cx="100" cy="121" rx="19" ry="14" fill="${S}"/><ellipse cx="100" cy="114" rx="6.5" ry="4.5" fill="${INK}"/>`;
}
else if (sp === "bunny") {
ears = both(`<ellipse cx="74" cy="30" rx="13" ry="35" transform="rotate(-10 74 30)" ${fillB}/><ellipse cx="74" cy="32" rx="6" ry="25" transform="rotate(-10 74 32)" fill="${mix(S, A, 0.4)}"/>`);
face = `<ellipse cx="100" cy="114" rx="4.5" ry="3.2" fill="${A}"/>`;
}
else if (sp === "owl") {
ears = both(`<path d="M52 66L46 30L82 50Z" ${fillB}/>`);
face = both(`<circle cx="80" cy="102" r="21" fill="${S}" stroke="${ol}" stroke-width="2"/>`) +
`<path d="M93 113H107L100 125Z" fill="#FFB547" stroke="${mix("#FFB547", INK, 0.4)}" stroke-width="2" stroke-linejoin="round"/>`;
belly = both(`<path d="M86 140l5 5 5-5M96 152l4 4 4-4" fill="none" stroke="${mix(S, INK, 0.3)}" stroke-width="2" stroke-linecap="round"/>`);
}
else if (sp === "robot") {
ears = both(`<rect x="28" y="94" width="14" height="30" rx="6" fill="${dark}" ${sw}/>`) +
`<path d="M100 46V24" ${sw}/><circle class="ant" cx="100" cy="19" r="7" fill="${A}" ${sw}/>`;
face = `<rect x="56" y="76" width="88" height="56" rx="22" fill="${INK}" stroke="${ol}" stroke-width="3"/>`;
belly = `<circle cx="100" cy="150" r="6" fill="${A}"/>` + both(`<rect x="72" y="146" width="12" height="8" rx="4" fill="${mix(S, INK, 0.15)}"/>`);
}
else if (sp === "dragon") {
ears = both(`<path d="M66 52Q58 32 62 18Q72 32 82 46Z" fill="${mix(S, "#fff", 0.3)}" ${sw}/>`);
back = both(`<path d="M44 104Q8 76 6 100Q18 100 14 112Q28 110 32 124Z" fill="${S}" ${sw}/>`) +
`<path d="M148 154Q184 158 186 128" fill="none" stroke="${ol}" stroke-width="17" stroke-linecap="round"/><path d="M148 154Q184 158 186 128" fill="none" stroke="${P}" stroke-width="11" stroke-linecap="round"/><path d="M176 132L186 108L196 134Q186 128 176 132Z" fill="${A}" ${sw}/>`;
face = `<circle cx="95" cy="114" r="1.8" fill="${INK}"/><circle cx="105" cy="114" r="1.8" fill="${INK}"/>`;
belly = `<path d="M74 138H126M70 150H130M78 162H122" stroke="${mix(S, INK, 0.2)}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
}
else {
ears = `<path d="M100 42C99 31 102 25 108 20" fill="none" ${sw}/><ellipse cx="113" cy="20" rx="10" ry="6" transform="rotate(-25 113 20)" fill="${A}" ${sw}/>`;
}
const ex = [80, 120], ey = 102;
const er = 9 * k, eh = 11 * k;
let en = "";
for (const x of ex) {
if (eyes === "sleepy") {
en += `<path d="M${x - er} ${ey}A${er} ${er} 0 0 0 ${x + er} ${ey}Z" fill="${eyeC}"/><path d="M${x - er - 2} ${ey}H${x + er + 2}" stroke="${eyeC}" stroke-width="3" stroke-linecap="round"/><circle cx="${x + 3}" cy="${ey + 3}" r="${2 * k}" fill="#fff"/>`;
}
else if (eyes === "sparkle") {
en += `<ellipse cx="${x}" cy="${ey}" rx="${er + 2}" ry="${eh + 2}" fill="${robot ? eyeC : `url(#${u}e)`}"/><circle cx="${x + 3.5 * k}" cy="${ey - 5 * k}" r="${4.4 * k}" fill="#fff"/>` +
star(x - 3.5 * k, ey + 4.5 * k, 3.4 * k, "#fff");
}
else {
en += `<ellipse cx="${x}" cy="${ey}" rx="${er}" ry="${eh}" fill="${eyeC}"/><circle cx="${x + 3 * k}" cy="${ey - 4 * k}" r="${3.6 * k}" fill="#fff"/><circle cx="${x - 3 * k}" cy="${ey + 4.5 * k}" r="${1.6 * k}" fill="#fff"/>`;
}
}
const happyEyes = ex.map((x) => `<path d="M${x - 8} ${ey + 3}Q${x} ${ey - 8} ${x + 8} ${ey + 3}" fill="none" stroke="${eyeC}" stroke-width="4" stroke-linecap="round"/>`).join("");
const mc = robot ? eyeC : INK;
const ms = `fill="none" stroke="${mc}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const smile = sp === "cat" ? `<path d="M92 120Q96 125 100 120Q104 125 108 120" ${ms}/>` : `<path d="M93 121Q100 128 107 121" ${ms}/>`;
const tongue = robot ? mc : A;
const mouths = `<g class="m-s">${smile}</g>` +
`<g class="m-t"><ellipse cx="100" cy="125" rx="6.5" ry="5.5" fill="${mc}"/><ellipse cx="100" cy="128" rx="3.6" ry="2" fill="${robot ? INK : tongue}"/></g>` +
`<g class="m-h"><path d="M90 119Q100 136 110 119Z" fill="${mc}" stroke="${mc}" stroke-width="2" stroke-linejoin="round"/><path d="M95 127Q100 131 105 127Q100 124 95 127Z" fill="${robot ? INK : tongue}"/></g>` +
`<g class="m-o"><ellipse cx="100" cy="125" rx="4.5" ry="5.5" fill="${mc}"/></g>` +
`<g class="m-k"><path d="M94 124Q100 120 107 123" ${ms}/></g>`;
const cheekY = 119, cheekX = robot ? [68, 132] : [62, 138];
const cheeks = cheekX.map((x) => `<ellipse cx="${x}" cy="${cheekY}" rx="${9 * k}" ry="${5.5 * k}" fill="${A}" opacity="${pro ? 0.22 : 0.55}"/>`).join("");
let top = "";
if (acc === "glasses") {
top = both(`<circle cx="80" cy="102" r="16" fill="#fff" fill-opacity=".18" stroke="${INK}" stroke-width="3.5"/><path d="M64 99L48 95" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`) +
`<path d="M95 99Q100 95 105 99" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
}
else if (acc === "scarf") {
top = `<path d="M124 146L130 178L146 174L139 142Z" fill="${mix(A, INK, 0.12)}" ${sw}/><path d="M40 130Q100 152 160 130L162 145Q100 168 38 145Z" fill="${A}" ${sw}/><path d="M60 140V152M80 145V157M100 147V160M120 145V157M140 140V152" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>`;
}
else if (acc === "hat") {
top = `<path d="M56 68Q56 28 100 26Q144 28 144 68Z" fill="${A}" ${sw}/><rect x="52" y="58" width="96" height="15" rx="7.5" fill="${mix(A, "#fff", 0.4)}" ${sw}/><circle cx="100" cy="24" r="10" fill="${mix(A, "#fff", 0.6)}" ${sw}/>`;
}
else if (acc === "headphones") {
top = `<path d="M42 100Q42 30 100 30Q158 30 158 100" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M42 100Q42 30 100 30Q158 30 158 100" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"/>` +
both(`<rect x="28" y="86" width="20" height="36" rx="9" fill="${A}" stroke="${INK}" stroke-width="3"/>`);
}
else if (acc === "bow") {
top = `<g transform="rotate(14 130 50)"><path d="M130 50Q110 32 110 50Q110 68 130 54ZM130 50Q150 32 150 50Q150 68 130 54Z" fill="${A}" ${sw}/><circle cx="130" cy="52" r="5.5" fill="${mix(A, INK, 0.15)}" ${sw}/></g>`;
}
else if (acc === "crown") {
top = `<path d="M74 50L78 20L91 36L100 14L109 36L122 20L126 50Q100 56 74 50Z" fill="#FFD45C" stroke="${mix("#FFD45C", INK, 0.45)}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="40" r="4" fill="${A}"/><circle cx="84" cy="43" r="2.6" fill="#fff"/><circle cx="116" cy="43" r="2.6" fill="#fff"/>`;
}
const fx = `<g class="x-h">${star(36, 48, 9, A, "tw")}${star(168, 40, 7, "#FFD45C", "tw t2")}${star(176, 76, 5, A, "tw t3")}</g>` +
`<g class="x-o"><g class="pop"><rect x="163" y="18" width="8" height="24" rx="4" fill="${A}"/><circle cx="167" cy="51" r="4.5" fill="${A}"/></g></g>` +
`<g class="x-k"><circle class="d1" cx="150" cy="44" r="4" fill="#fff" stroke="${ol}" stroke-width="2"/><circle class="d2" cx="164" cy="30" r="6" fill="#fff" stroke="${ol}" stroke-width="2"/><circle class="d3" cx="182" cy="14" r="8" fill="#fff" stroke="${ol}" stroke-width="2"/></g>`;
const arm = (x, cls) => `<g class="${cls}"><rect x="${x - 10}" y="104" width="20" height="36" rx="10" fill="${P}" ${sw}/></g>`;
const body = robot ? BOX : BEAN;
return (`<defs><radialGradient id="${u}g" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${mix(P, "#fff", 0.45)}"/><stop offset=".55" stop-color="${P}"/><stop offset="1" stop-color="${mix(P, INK, 0.18)}"/></radialGradient>` +
`<linearGradient id="${u}e" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${INK}"/><stop offset="1" stop-color="${mix(INK, A, 0.6)}"/></linearGradient>` +
`<radialGradient id="${u}s"><stop offset="0" stop-color="${INK}" stop-opacity=".22"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></radialGradient></defs>` +
`<ellipse class="sh" cx="100" cy="182" rx="58" ry="10" fill="url(#${u}s)"/>` +
`<g class="pk"><g class="j"><g class="b">` +
back + arm(42, "al") + arm(158, "ar") +
both(`<ellipse cx="80" cy="168" rx="15" ry="9" fill="${dark}" ${sw}/>`) +
ears +
`<path d="${body}" ${fillB}/>` +
`<ellipse cx="100" cy="146" rx="${robot ? 34 : 40}" ry="${robot ? 18 : 25}" fill="${S}" opacity="${robot ? 0.9 : 1}"/>` + belly +
`<ellipse cx="70" cy="62" rx="15" ry="8" transform="rotate(-32 70 62)" fill="#fff" opacity=".35"/>` +
`<g class="f">${face}${cheeks}<g class="ey"><g class="en">${en}</g><g class="eh">${happyEyes}</g></g>${mouths}</g>` +
top +
`</g></g></g><g class="fx">${fx}</g>`);
}
const MASCOT_CSS = `
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
.msc[data-mood=wave] .ar{transform:rotate(-140deg);animation:msc-wv 1.1s .4s ease-in-out infinite}
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
@keyframes msc-wv{0%,100%{transform:rotate(-140deg)}50%{transform:rotate(-170deg)}}
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
@media (prefers-reduced-motion:reduce){.msc *,.msc.p1 .pk,.msc.p2 .pk{animation:none!important;transition:none!important}}
`;
/* @draw:end */

  var ds = (script && script.dataset) || {};
  var spec = {};
  try { spec = JSON.parse(ds.mascot || "{}") || {}; } catch (e) { console.info("[Mascott] data-mascot is not valid JSON, using the default mascot."); }
  var name = String(ds.name || "Pip").slice(0, 40);
  var greeting = String(ds.greeting || "Hi! I'm " + name + ". Need a hand?").slice(0, 300);
  var origin = location.origin;
  try { origin = new URL(script.src).origin; } catch (e) { /* inline or missing src: same origin */ }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var P = mix(spec.primary || "#7C8CFF", "#000", 0);
  var A = mix(spec.accent || "#FF9EC4", "#000", 0);
  var D = mix(P, "#2B2340", 0.4);

  var CSS = MASCOT_CSS +
    ":host{all:initial}*{box-sizing:border-box;font-family:ui-rounded,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".w{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:88px;height:88px;transition:transform .75s cubic-bezier(.34,1.2,.5,1)}" +
    ".m{all:unset;cursor:pointer;display:block;width:100%;height:100%;border-radius:30px;-webkit-tap-highlight-color:transparent}" +
    ".m:focus-visible{outline:3px solid " + D + ";outline-offset:3px}" +
    ".m svg{width:100%;height:100%;transition:transform .3s cubic-bezier(.34,1.4,.5,1),scale .12s}.m:active svg{scale:.94}.flip .m svg{transform:scaleX(-1)}" +
    ".bub{position:absolute;right:4px;bottom:100px;width:max-content;max-width:min(250px,70vw);background:#fff;color:#2B2340;border-radius:18px;padding:10px 30px 10px 14px;font-size:14px;line-height:1.45;box-shadow:0 14px 34px -12px rgba(43,35,64,.45),0 0 0 1px rgba(43,35,64,.06);transform-origin:85% 100%;animation:mw-in .4s cubic-bezier(.34,1.5,.5,1)}" +
    ".bub:after{content:'';position:absolute;right:32px;bottom:-6px;width:12px;height:12px;background:#fff;transform:rotate(45deg)}" +
    ".below .bub{bottom:auto;top:100px;transform-origin:85% 0}.below .bub:after{bottom:auto;top:-6px}" +
    ".flip .bub{right:auto;left:4px;padding:10px 30px 10px 14px}.flip .bub:after{right:auto;left:32px}" +
    ".x{all:unset;position:absolute;top:7px;right:10px;cursor:pointer;color:#8a84a0;font-size:17px;line-height:1;padding:2px}.x:focus-visible{outline:2px solid " + D + "}" +
    ".chat{position:absolute;right:0;bottom:100px;width:min(340px,calc(100vw - 32px));height:min(450px,calc(100vh - 140px));background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border-radius:24px;box-shadow:0 24px 60px -18px rgba(43,35,64,.5),0 0 0 1px rgba(43,35,64,.07);display:flex;flex-direction:column;overflow:hidden;transform-origin:85% 100%;animation:mw-in .4s cubic-bezier(.34,1.3,.5,1)}" +
    "[hidden]{display:none!important}" +
    ".hd{position:relative;padding:14px 40px 12px 16px;color:#2B2340;font-size:15px;font-weight:700;border-bottom:1px solid rgba(43,35,64,.07)}.hd small{display:block;font-weight:500;font-size:12px;color:#8a84a0}" +
    ".log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}" +
    ".msg{max-width:85%;padding:9px 13px;border-radius:18px;font-size:14px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;animation:mw-in .3s ease-out}" +
    ".a{background:#F3F1FA;color:#2B2340;align-self:flex-start;border-bottom-left-radius:6px}.u{background:" + D + ";color:#fff;align-self:flex-end;border-bottom-right-radius:6px}" +
    "form{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(43,35,64,.07)}" +
    "input{flex:1;min-width:0;border:1px solid rgba(43,35,64,.14);border-radius:999px;padding:10px 14px;font-size:14px;outline:none;background:#fff;color:#2B2340}input:focus{border-color:" + D + "}" +
    "form button{all:unset;cursor:pointer;background:" + D + ";color:#fff;border-radius:999px;padding:0 16px;font-weight:600;font-size:14px}form button:focus-visible{outline:2px solid " + A + "}" +
    ".halo{position:fixed;z-index:2147482999;pointer-events:none;border-radius:14px;box-shadow:0 0 0 3px " + A + ",0 0 0 10px " + A + "55;animation:mw-halo 1.4s ease-in-out infinite;transition:all .3s}" +
    "@keyframes mw-halo{50%{box-shadow:0 0 0 4px " + A + ",0 0 0 18px " + A + "00}}" +
    "@keyframes mw-in{from{opacity:0;transform:scale(.85) translateY(8px)}}" +
    "@media (max-width:480px){.w{right:12px;bottom:12px;width:72px;height:72px}.bub,.chat{bottom:84px}.below .bub{top:84px}}" +
    "@media (prefers-reduced-motion:reduce){.w,.bub,.chat,.halo,.msg{animation:none!important;transition:none!important}}";

  var root, wrap, svg, bub, bubText, chat, log, input, halo;
  var history = [], pointing = null, moodTimer, typeTimer, poke = 0;

  function el(tag, attrs, parent) {
    var n = document.createElement(tag);
    for (var k in attrs) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(n);
    return n;
  }

  function setMood(m, ms) {
    clearTimeout(moodTimer);
    svg.setAttribute("data-mood", m);
    if (ms) moodTimer = setTimeout(function () { svg.setAttribute("data-mood", pointing ? "point" : "idle"); }, ms);
  }

  function type(node, text, done) {
    clearInterval(typeTimer);
    if (reduce) { node.textContent = text; if (done) done(); return; }
    var i = 0;
    node.textContent = "";
    typeTimer = setInterval(function () {
      node.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(typeTimer); if (done) done(); }
    }, 24);
  }

  function say(text) {
    text = String(text || "");
    bub.hidden = false;
    bub.style.animation = "none"; void bub.offsetWidth; bub.style.animation = "";
    setMood("talk");
    type(bubText, text, function () { setMood(pointing ? "point" : "idle"); });
  }

  function addMsg(role, text, animate) {
    var m = el("div", { class: "msg " + (role === "user" ? "u" : "a") }, log);
    if (animate) type(m, text); else m.textContent = text;
    log.scrollTop = log.scrollHeight;
    return m;
  }

  function open() {
    home();
    bub.hidden = true;
    chat.hidden = false;
    if (!log.childNodes.length) addMsg("assistant", greeting);
    setMood("happy", 900);
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { chat.hidden = true; setMood("idle"); }

  function send(text) {
    addMsg("user", text);
    history.push({ role: "user", content: text });
    history = history.slice(-10);
    setMood("think");
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
    fetch(origin + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        mascot: { name: name, spec: spec, greeting: greeting, personality: "", sampleDialog: [], systemPrompt: "", source: "fallback" },
        messages: history,
      }),
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { if (!d || typeof d.reply !== "string" || !d.reply) throw new Error("empty"); return d.reply; })
      .catch(function () {
        return "I'm in demo mode right now, so I can't answer for real yet. Once " + name + " is connected to your site, I'll answer from your docs and show visitors the way.";
      })
      .then(function (reply) {
        clearTimeout(t);
        reply = String(reply).slice(0, 1200);
        history.push({ role: "assistant", content: reply });
        addMsg("assistant", reply, true);
        setMood("talk", Math.min(4000, 400 + reply.length * 24));
      });
  }

  // ---- pointAt: walk over to an element, point at it and ring it with a halo ----
  function place() {
    if (!pointing) return;
    var r = pointing.getBoundingClientRect();
    var s = wrap.offsetWidth, vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    var cs = getComputedStyle(wrap);
    var hx = vw - parseFloat(cs.right) - s, hy = vh - parseFloat(cs.bottom) - s;
    var flip = r.left < s + 24;
    var x = flip ? r.right + 6 : r.left - s - 6;
    var y = r.top + r.height / 2 - s * 0.56;
    x = Math.max(8, Math.min(vw - s - 8, x));
    y = Math.max(8, Math.min(vh - s - 8, y));
    wrap.style.transform = "translate(" + (x - hx) + "px," + (y - hy) + "px)";
    wrap.classList.toggle("flip", flip);
    wrap.classList.toggle("below", y < 130);
    halo.hidden = false;
    halo.style.left = r.left - 6 + "px"; halo.style.top = r.top - 6 + "px";
    halo.style.width = r.width + 12 + "px"; halo.style.height = r.height + 12 + "px";
  }
  var raf = 0;
  function onMove() { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); }
  var backTimer;
  function home() {
    if (!pointing) return;
    pointing = null;
    clearTimeout(backTimer);
    removeEventListener("scroll", onMove, true); removeEventListener("resize", onMove);
    wrap.style.transform = "";
    wrap.classList.remove("flip", "below");
    halo.hidden = true;
    bub.hidden = true;
    setMood("idle");
  }

  function pointAt(selector, text) {
    var target = null;
    try { target = document.querySelector(selector); } catch (e) { /* invalid selector */ }
    if (!target) {
      home();
      setMood("surprised", 1200);
      say("Hmm, I can't find that on this page.");
      return false;
    }
    chat.hidden = true;
    home();
    pointing = target;
    target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    addEventListener("scroll", onMove, true); addEventListener("resize", onMove);
    setTimeout(function () { place(); setMood("point"); say(text || "Right here!"); }, reduce ? 0 : 450);
    backTimer = setTimeout(home, 8000);
    return true;
  }

  function mount() {
    var host = el("div", { id: "mascott-widget" }, document.body);
    if (!host.attachShadow) { console.info("[Mascott] Shadow DOM not supported, widget disabled."); return; }
    root = host.attachShadow({ mode: "open" });
    el("style", { text: CSS }, root);
    halo = el("div", { class: "halo", hidden: "" }, root);
    wrap = el("div", { class: "w" }, root);

    chat = el("div", { class: "chat", role: "dialog", "aria-label": "Chat with " + name, hidden: "" }, wrap);
    var hd = el("div", { class: "hd", text: name }, chat);
    el("small", { text: "Usually answers instantly" }, hd);
    el("button", { class: "x", type: "button", "aria-label": "Close chat", text: "×" }, hd).onclick = close;
    log = el("div", { class: "log", "aria-live": "polite" }, chat);
    var form = el("form", {}, chat);
    input = el("input", { type: "text", maxlength: "500", placeholder: "Ask me anything…", "aria-label": "Message " + name }, form);
    el("button", { type: "submit", text: "Send" }, form);
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      input.value = "";
      send(v);
    };

    bub = el("div", { class: "bub", role: "status", hidden: "" }, wrap);
    bubText = el("span", {}, bub);
    el("button", { class: "x", type: "button", "aria-label": "Dismiss", text: "×" }, bub).onclick = function () { home(); bub.hidden = true; };

    var btn = el("button", { class: "m", type: "button", "aria-label": "Chat with " + name }, wrap);
    btn.innerHTML = '<svg class="msc" viewBox="0 0 200 200" aria-hidden="true" data-mood="wave">' + mascotSvg(spec, "mw") + "</svg>";
    svg = btn.firstChild;
    btn.onclick = function () {
      svg.classList.remove("p1", "p2");
      svg.classList.add(++poke % 2 ? "p1" : "p2");
      if (chat.hidden) open(); else close();
    };
    root.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); home(); btn.focus(); } });

    setMood("wave", 2600);
    setTimeout(function () { if (chat.hidden && !pointing) say(greeting); }, 700);
  }

  window.Mascott = {
    loaded: true,
    pointAt: function (sel, text) { return root ? pointAt(sel, text) : false; },
    say: function (t) { if (root) { home(); chat.hidden = true; say(t); } },
    open: function () { if (root) open(); },
    close: function () { if (root) close(); },
  };

  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
