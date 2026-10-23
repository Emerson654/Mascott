"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { MascotSpec, Mood } from "@/lib/mascot-spec";
import { MASCOT_CSS, mascotSvg, moodFx } from "./draw";

export interface MascotProps {
  spec: MascotSpec;
  mood?: Mood;
  size?: number;
  onPoke?: () => void;
  className?: string;
  label?: string; // accessible name, defaults to the art concept or "<species> mascot"
  /** Artwork only: blur/desaturated → sharp reveal when the image arrives (end of the funnel). */
  reveal?: boolean;
}

const BTN_CSS = `.msc-btn{background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:28px;display:inline-block;line-height:0}
.msc-btn .msc,.msc-btn .mart{transition:transform .12s ease-out}.msc-btn:active .msc,.msc-btn:active .mart{transform:scale(.95)}
.msc-btn:focus-visible{outline:3px solid #7C8CFF;outline-offset:4px}`;

export function Mascot({ spec, mood = "idle", size = 160, onPoke, className, label, reveal }: MascotProps) {
  const uid = "m" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [reaction, setReaction] = useState<Mood | null>(null);
  const [poke, setPoke] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Artwork load state, keyed by URL so a new image starts over without an effect.
  const url = spec.imageUrl;
  const [art, setArt] = useState<{ url?: string; ok: boolean }>({ ok: false });
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // The image may have finished before hydration attached onLoad/onError.
    const el = img.current;
    if (url && el?.complete) setArt({ url, ok: el.naturalWidth > 0 });
  }, [url]);
  const state = url && art.url === url ? (art.ok ? " ok" : " er") : "";

  const m = reaction ?? mood;
  const pk = poke ? ` p${(poke % 2) + 1}` : "";
  const outer = onPoke ? "" : className ? " " + className : "";
  const name = label ?? (url && spec.concept ? spec.concept : `${spec.species} mascot`);
  const svgEl = (cls: string, html: string, labelled: boolean) => (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? name : undefined}
      aria-hidden={labelled ? undefined : true}
      data-mood={m}
      className={cls}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  const view = url ? (
    <span className={"mart" + state + pk + (reveal ? " rv" : "") + outer} data-mood={m} style={{ width: size, height: size }}>
      <span className="ash" />
      {svgEl("msc afb" + pk, mascotSvg(spec, uid), state === " er")}
      <span className="apk">
        <span className="aj">
          <span className="ab">
            {/* eslint-disable-next-line @next/next/no-img-element -- signed, already-sized artwork; next/image adds nothing here */}
            <img
              ref={img}
              key={url}
              className="aimg"
              src={url}
              alt={state === " er" ? "" : name}
              width={size}
              height={size}
              decoding="async"
              draggable={false}
              onLoad={() => setArt({ url, ok: true })}
              onError={() => setArt({ url, ok: false })}
            />
          </span>
        </span>
      </span>
      {svgEl("msc afx", moodFx(spec), false)}
    </span>
  ) : (
    svgEl("msc" + pk + outer, mascotSvg(spec, uid), true)
  );
  const sheet = (
    <style href="mascott-mascot" precedence="default">
      {MASCOT_CSS + BTN_CSS}
    </style>
  );

  if (!onPoke) return <>{sheet}{view}</>;

  const handlePoke = () => {
    setPoke((n) => n + 1);
    setReaction(Math.random() < 0.6 ? "happy" : "surprised");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setReaction(null), 1400);
    onPoke();
  };

  return (
    <>
      {sheet}
      <button type="button" className={"msc-btn" + (className ? " " + className : "")} onClick={handlePoke} aria-label={`Poke ${name}`}>
        {view}
      </button>
    </>
  );
}

export default Mascot;
