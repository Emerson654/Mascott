// Landing carousel: the demo cast with signed artwork URLs. Server-only (call it from a Server Component).
// Seeds are derived from the member id so URLs stay stable across deploys and the CDN keeps the images.
import { brand, type CastMember } from "@/content/brand";
import { mascotImageUrl } from "./image";
import { artPromptFromSpec } from "./mascot";

function stableSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % 2 ** 31;
}

export function getCastWithArt(): CastMember[] {
  return (brand.cast as (CastMember & { artPrompt?: string })[]).map((m) => {
    const imageUrl = mascotImageUrl(m.artPrompt || artPromptFromSpec(m.spec), stableSeed(m.id));
    return imageUrl ? { ...m, spec: { ...m.spec, imageUrl } } : m;
  });
}
