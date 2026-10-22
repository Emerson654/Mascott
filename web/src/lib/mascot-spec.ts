// Shared contract between the mascot engine (Sacha), the generator API (Yanis) and the pages (Chloé).
export type Species = "blob" | "cat" | "bear" | "bunny" | "fox" | "owl" | "robot" | "dragon";
export type Eyes = "round" | "sparkle" | "sleepy";
export type Accessory = "none" | "glasses" | "scarf" | "hat" | "headphones" | "bow" | "crown";
export type Mood = "idle" | "wave" | "talk" | "happy" | "surprised" | "think" | "point";

export interface MascotSpec {
  species: Species;
  primary: string;   // body colour, hex
  secondary: string; // belly / inner ears, hex
  accent: string;    // cheeks / accessory, hex
  eyes: Eyes;
  accessory: Accessory;
  style: "cute" | "pro";
}

export const SPECIES: Species[] = ["blob", "cat", "bear", "bunny", "fox", "owl", "robot", "dragon"];
export const ACCESSORIES: Accessory[] = ["none", "glasses", "scarf", "hat", "headphones", "bow", "crown"];

export const DEFAULT_SPEC: MascotSpec = {
  species: "blob", primary: "#7C8CFF", secondary: "#E9ECFF", accent: "#FF9EC4",
  eyes: "round", accessory: "none", style: "cute",
};
