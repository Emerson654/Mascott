// Landing carousel: the demo cast (src/content/brand.ts, Léa) with its artwork.
// Pre-rendered files in public/cast/ (scripts/cast-art.mjs, run by a GitHub workflow) win; otherwise a signed URL.
// Server-only: call it from a Server Component. Each member's fixed `seed` keeps URLs stable, so the CDN keeps the images.
import { brand, type CastMember } from "@/content/brand";
import rendered from "@/content/cast-art.json";
import { mascotImageUrl } from "./image";
import { artPromptFromSpec } from "./mascot";

export function getCastWithArt(): CastMember[] {
  return brand.cast.map((m) => {
    const imageUrl = (rendered as string[]).includes(m.id) ? `/cast/${m.id}.jpg` : mascotImageUrl(m.artPrompt || artPromptFromSpec(m.spec), m.seed);
    return imageUrl ? { ...m, spec: { ...m.spec, imageUrl } } : m;
  });
}
