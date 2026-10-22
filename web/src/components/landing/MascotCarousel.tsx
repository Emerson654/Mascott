"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mood } from "@/lib/mascot-spec";
import type { CastMember } from "@/content/brand";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { brand } from "@/content/brand";

const halos = brand.palette.soft;

/**
 * 3D roulette of the cast. Pure CSS 3D (perspective + translate3d), positions driven by one
 * spring-animated float `rot` (in slots). Drag 1:1, flick with momentum projection, arrows,
 * keyboard, gentle autoplay. Items are billboards (always face the camera).
 */

const AUTOPLAY_MS = 5200;
const LINE_MS = 4200;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;
const shortest = (d: number, m: number) => {
  const r = mod(d, m);
  return r > m / 2 ? r - m : r;
};

export function MascotCarousel({ cast, label = "Meet the mascots" }: { cast: CastMember[]; label?: string }) {
  const n = cast.length;
  const reduced = usePrefersReducedMotion();

  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rot = useRef(0); // current presentation value, in slots
  const vel = useRef(0); // slots / s
  const target = useRef(0);
  const spring = useRef({ zeta: 1, response: 0.45 });
  const raf = useRef<number | null>(null);
  const radius = useRef(320);
  const slotPx = useRef(220);
  const drag = useRef<{ id: number; x: number; rot: number; moved: boolean; hist: { x: number; t: number }[] } | null>(null);
  const suppressClick = useRef(false);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [size, setSize] = useState(200);

  const layout = useCallback(() => {
    const r = radius.current;
    for (let i = 0; i < n; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const a = ((i - rot.current) * 2 * Math.PI) / n;
      const c = Math.cos(a);
      const x = Math.sin(a) * r;
      const z = (c - 1) * r * 1.5; // deeper ring: the front mascot clearly leads
      const y = (1 - c) * -r * 0.07; // back of the ring sits a bit higher: we look down on the arc
      const depth = (c + 1) / 2; // 1 front, 0 back
      el.style.transform = `translate3d(-50%, 0, 0) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      el.style.opacity = (0.25 + 0.75 * depth ** 1.4).toFixed(3);
      el.style.filter = depth > 0.97 ? "none" : `blur(${((1 - depth) * 2.2).toFixed(2)}px) saturate(${(0.6 + 0.4 * depth).toFixed(2)})`;
      el.style.zIndex = String(Math.round(depth * 100));
    }
    const nowActive = mod(Math.round(rot.current), n);
    setActive((prev) => (prev === nowActive ? prev : nowActive));
  }, [n]);

  const tick = useCallback(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const { zeta, response } = spring.current;
      const k = (2 * Math.PI / response) ** 2;
      const c = (4 * Math.PI * zeta) / response;
      const f = -k * (rot.current - target.current) - c * vel.current;
      vel.current += f * dt;
      rot.current += vel.current * dt;
      layout();
      if (Math.abs(rot.current - target.current) < 0.0005 && Math.abs(vel.current) < 0.005) {
        rot.current = target.current;
        vel.current = 0;
        layout();
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    if (raf.current === null) raf.current = requestAnimationFrame(step);
  }, [layout]);

  const goTo = useCallback(
    (t: number, opts: { zeta?: number; velocity?: number } = {}) => {
      target.current = t;
      if (reduced) {
        rot.current = t;
        vel.current = 0;
        layout();
        return;
      }
      spring.current = { zeta: opts.zeta ?? 1, response: 0.5 };
      if (opts.velocity !== undefined) vel.current = opts.velocity;
      tick();
    },
    [layout, reduced, tick],
  );

  const next = useCallback(() => goTo(Math.round(target.current) + 1), [goTo]);
  const prev = useCallback(() => goTo(Math.round(target.current) - 1), [goTo]);

  // Size the ring from the stage width.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      radius.current = Math.min(w * 0.4, 400);
      slotPx.current = Math.max(140, Math.min(w * 0.36, 300));
      setSize(w < 480 ? 150 : w < 820 ? 190 : 220);
      layout();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
  }, []);

  // Gentle autoplay; stops on hover, focus, drag, hidden tab and reduced motion.
  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden && !drag.current) next();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, n, next]);

  // Pointer: 1:1 tracking, then momentum projection to the nearest slot.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, rot: rot.current, moved: false, hist: [{ x: e.clientX, t: e.timeStamp }] };
    target.current = rot.current;
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    vel.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 8) {
      d.moved = true;
      stageRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    rot.current = d.rot - dx / slotPx.current;
    target.current = rot.current;
    d.hist.push({ x: e.clientX, t: e.timeStamp });
    if (d.hist.length > 6) d.hist.shift();
    layout();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.moved) return;
    suppressClick.current = true;
    const first = d.hist[0];
    const last = d.hist[d.hist.length - 1];
    const dt = Math.max(1, last.t - first.t) / 1000;
    const vPx = (last.x - first.x) / dt; // px/s
    const vSlots = -vPx / slotPx.current;
    const projected = rot.current + vSlots * 0.2; // Apple projection, d = 0.995: (v/1000)·d/(1−d)
    const snap = Math.round(Math.max(rot.current - 2, Math.min(rot.current + 2, projected)));
    goTo(snap, { zeta: Math.abs(vSlots) > 1.5 ? 0.8 : 1, velocity: vSlots });
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  // Speech: the active mascot cycles its lines; a poke shows a reaction.
  const member = cast[active];
  const [line, setLine] = useState(0);
  const [poke, setPoke] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("wave");

  useEffect(() => {
    setLine(0);
    setPoke(null);
    setMood("wave");
    const t = window.setTimeout(() => setMood("talk"), 900);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!member || poke) return;
    const id = window.setInterval(() => {
      setLine((l) => (l + 1) % Math.max(1, member.lines.length));
      setMood("talk");
    }, LINE_MS);
    return () => window.clearInterval(id);
  }, [member, poke]);

  useEffect(() => {
    if (mood !== "talk") return;
    const t = window.setTimeout(() => setMood("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [mood, line]);

  const onPoke = useCallback(() => {
    if (!member?.reactions.length) return;
    setPoke((p) => {
      const pool = member.reactions.filter((r) => r !== p);
      return pool[Math.floor(Math.random() * pool.length)] ?? member.reactions[0];
    });
    setMood(Math.random() < 0.5 ? "surprised" : "happy");
  }, [member]);

  useEffect(() => {
    if (!poke) return;
    const t = window.setTimeout(() => {
      setPoke(null);
      setMood("idle");
    }, 3200);
    return () => window.clearTimeout(t);
  }, [poke]);

  if (!n) return null;
  const text = poke ?? member.lines[line % Math.max(1, member.lines.length)] ?? "";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative mx-auto w-full max-w-5xl select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Bubble of the active mascot, above the stage */}
      <div className="relative z-[200] mx-auto flex min-h-[5.5rem] max-w-md items-end justify-center px-4">
        <div key={`${active}-${poke ?? line}`} className="fade-up w-full">
          <SpeechBubble text={text} />
        </div>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        aria-label={`${label}. Use left and right arrow keys to turn.`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className="relative mx-auto cursor-grab touch-pan-y active:cursor-grabbing rounded-[2rem]"
        style={{ height: size + 70, perspective: "1100px", perspectiveOrigin: "50% 20%" }}
      >
        {/* floor */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            bottom: 18,
            width: "min(88%, 760px)",
            height: 70,
            background: "radial-gradient(closest-side, rgb(124 140 255 / 0.18), rgb(255 143 199 / 0.08) 60%, transparent)",
          }}
        />
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {cast.map((m, i) => {
            const isActive = i === active;
            return (
              <div
                key={m.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${m.name}, ${m.role}`}
                aria-hidden={!isActive}
                className="absolute bottom-6 left-1/2 flex flex-col items-center will-change-transform"
                style={{ width: size }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[8%] -z-10 aspect-square w-[92%] -translate-x-1/2 rounded-full blur-md"
                  style={{ background: halos[i % halos.length] }}
                />
                {isActive ? (
                  <Mascot spec={m.spec} mood={mood} size={size} onPoke={onPoke} label={m.name} />
                ) : (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => goTo(Math.round(target.current) + shortest(i - Math.round(target.current), n))}
                    className="block"
                    aria-label={`Show ${m.name}`}
                  >
                    <Mascot spec={m.spec} mood="idle" size={size} label={m.name} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption + controls */}
      <div className="mt-2 flex items-center justify-center gap-4">
        <button type="button" onClick={prev} className="btn btn-ghost !min-h-11 !w-11 !p-0" aria-label="Previous mascot">
          <Chevron dir="left" />
        </button>
        <div className="min-w-[11rem] text-center" aria-live="polite">
          <p className="font-display text-xl font-semibold leading-tight">{member.name}</p>
          <p className="text-sm text-muted">{member.role}</p>
        </div>
        <button type="button" onClick={next} className="btn btn-ghost !min-h-11 !w-11 !p-0" aria-label="Next mascot">
          <Chevron dir="right" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Drag to spin. Tap the one in front.</p>
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
