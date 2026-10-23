// Landing carousel: the demo cast (src/content/brand.ts, Léa) with signed artwork URLs.
// Server-only: call it from a Server Component. Each member's fixed `seed` keeps URLs stable, so the CDN keeps the images.
import { brand, type CastMember } from "@/content/brand";
import { mascotImageUrl } from "./image";
import { artPromptFromSpec } from "./mascot";

export function getCastWithArt(): CastMember[] {
  return brand.cast.map((m) => {
    const imageUrl = mascotImageUrl(m.artPrompt || artPromptFromSpec(m.spec), m.seed);
    return imageUrl ? { ...m, spec: { ...m.spec, imageUrl } } : m;
  });
}
