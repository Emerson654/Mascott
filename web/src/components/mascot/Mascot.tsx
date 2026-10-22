"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { MascotSpec, Mood } from "@/lib/mascot-spec";
import { MASCOT_CSS, mascotSvg } from "./draw";

export interface MascotProps {
  spec: MascotSpec;
  mood?: Mood;
  size?: number;
  onPoke?: () => void;
  className?: string;
  label?: string; // accessible name, defaults to "<species> mascot"
}

const BTN_CSS = `.msc-btn{background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:28px;display:inline-block;line-height:0}
.msc-btn .msc{transition:transform .12s ease-out}.msc-btn:active .msc{transform:scale(.95)}
.msc-btn:focus-visible{outline:3px solid #7C8CFF;outline-offset:4px}`;

export function Mascot({ spec, mood = "idle", size = 160, onPoke, className, label }: MascotProps) {
  const uid = "m" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [reaction, setReaction] = useState<Mood | null>(null);
  const [poke, setPoke] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const name = label ?? `${spec.species} mascot`;
  const svg = (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={name}
      data-mood={reaction ?? mood}
      className={"msc" + (poke ? ` p${(poke % 2) + 1}` : "") + (onPoke ? "" : className ? " " + className : "")}
      dangerouslySetInnerHTML={{ __html: mascotSvg(spec, uid) }}
    />
  );
  const sheet = (
    <style href="mascott-mascot" precedence="default">
      {MASCOT_CSS + BTN_CSS}
    </style>
  );

  if (!onPoke) return <>{sheet}{svg}</>;

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
        {svg}
      </button>
    </>
  );
}

export default Mascot;
