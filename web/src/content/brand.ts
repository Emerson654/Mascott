// Owned by Léa (brand). Defaults so other teams can build; Léa refines the values.
import type { MascotSpec } from "@/lib/mascot-spec";

export interface CastMember { id: string; name: string; role: string; spec: MascotSpec; lines: string[]; reactions: string[] }

export const brand = {
  name: "Mascott",
  domain: "mascotte.io",
  heroPrefix: "Give your website a",
  rotatingWords: ["guide", "friend", "sidekick", "onboarding coach", "host", "superpower"],
  heroSubtitle: "Cute AI mascots that greet your visitors, answer from your content and point them to the next step. Installed in a few clicks.",
  palette: { bg: "#FFFFFF", ink: "#1B1D3A", muted: "#6B6F93", gradient: ["#7C8CFF", "#FF8FC7", "#FFC46B"] },
  cast: [] as CastMember[],
};
