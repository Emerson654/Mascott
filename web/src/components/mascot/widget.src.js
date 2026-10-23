/*! Mascott widget | https://mascotte.io (source: src/components/mascot/widget.src.js)
 * <script src="https://mascotte.io/widget.js" data-mascot='{"species":"cat",...}' data-name="Pip" data-greeting="Hi!"></script>
 * API: Mascott.pointAt(cssSelector, text?) -> boolean, Mascott.say(text), Mascott.open(), Mascott.close()
 */
(function () {
  "use strict";
  if (window.Mascott && window.Mascott.loaded) return;
  var script = document.currentScript || document.querySelector('script[src*="widget.js"]');

/* @draw:start (generated from src/components/mascot/draw.ts) */
  // filled by sync-widget.mjs (run it after editing draw.ts or this file)
  /* @draw:end */

  var ds = (script && script.dataset) || {};
  var spec = {};
  try { spec = JSON.parse(ds.mascot || "{}") || {}; } catch { console.info("[Mascott] data-mascot is not valid JSON, using the default mascot."); }
  var name = String(ds.name || "Pip").slice(0, 40);
  var greeting = String(ds.greeting || "Hi! I'm " + name + ". Need a hand?").slice(0, 300);
  var origin = location.origin;
  try { origin = new URL(script.src).origin; } catch { /* inline or missing src: same origin */ }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var P = mix(spec.primary || "#7C8CFF", "#000", 0);
  var A = mix(spec.accent || "#FF9EC4", "#000", 0);
  var D = mix(P, "#2B2340", 0.4);

  var CSS = MASCOT_CSS +
    ":host{all:initial}*{box-sizing:border-box;font-family:ui-rounded,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".w{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:88px;height:88px;transition:transform .75s cubic-bezier(.34,1.2,.5,1)}" +
    ".m{all:unset;cursor:pointer;display:block;width:100%;height:100%;border-radius:30px;-webkit-tap-highlight-color:transparent}" +
    ".m:focus-visible{outline:3px solid " + D + ";outline-offset:3px}" +
    ".m>*{width:100%;height:100%;transition:transform .3s cubic-bezier(.34,1.4,.5,1),scale .12s}.m:active>*{scale:.94}.flip .m>*{transform:scaleX(-1)}" +
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

  var root, wrap, btn, bub, bubText, chat, log, input, halo;
  var history = [], pointing = null, moodTimer, typeTimer, poke = 0;

  function el(tag, attrs, parent) {
    var n = document.createElement(tag);
    for (var k in attrs) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(n);
    return n;
  }

  // The mascot is one SVG, or artwork + SVG fallback + effects overlay: every part carries the mood.
  function each(fn) { var n = btn.querySelectorAll("[data-mood]"); for (var i = 0; i < n.length; i++) fn(n[i]); }
  function mood(m) { each(function (n) { n.setAttribute("data-mood", m); }); }
  function setMood(m, ms) {
    clearTimeout(moodTimer);
    mood(m);
    if (ms) moodTimer = setTimeout(function () { mood(pointing ? "point" : "idle"); }, ms);
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
    try { target = document.querySelector(selector); } catch { /* invalid selector */ }
    if (!target) {
      home();
      setMood("surprised", 1200);
      say("Hmm, I can't find that on this page.");
      return false;
    }
    chat.hidden = true;
    home();
    pointing = target;
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
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

    btn = el("button", { class: "m", type: "button", "aria-label": "Chat with " + name }, wrap);
    var sv = function (c, h) { return '<svg class="msc' + c + '" viewBox="0 0 200 200" aria-hidden="true" data-mood="wave">' + h + "</svg>"; };
    var src = "";
    try { src = spec.imageUrl ? new URL(String(spec.imageUrl), origin).href : ""; } catch { /* bad URL: SVG only */ }
    if (/^https?:/.test(src)) {
      // AI artwork: SVG fallback while loading (and for good on error), then cross-fade.
      btn.innerHTML = '<span class="mart" data-mood="wave"><span class="ash"></span>' + sv(" afb", mascotSvg(spec, "mw")) +
        '<span class="apk"><span class="aj"><span class="ab"><img class="aimg" alt=""></span></span></span>' + sv(" afx", moodFx(spec)) + "</span>";
      var art = btn.firstChild, im = art.querySelector("img");
      im.onload = function () {
        var c = cutout(im);
        im.onload = null;
        if (c) { im.src = c; art.classList.add("cut"); }
        art.classList.add("ok");
      };
      im.onerror = function () { art.classList.add("er"); };
      im.src = src;
    } else btn.innerHTML = sv("", mascotSvg(spec, "mw"));
    btn.onclick = function () {
      each(function (n) { n.classList.remove("p1", "p2"); n.classList.add(poke % 2 ? "p2" : "p1"); });
      poke++;
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
