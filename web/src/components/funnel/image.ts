// Client-side photo compression for the brand step and the hero PromptBox.
import { FUNNEL_STORAGE_KEY, type OnboardingData } from "@/lib/funnel";

export const MAX_IMAGES = 3;
const MAX_SIDE = 1024;
const MAX_BYTES = 400 * 1024;

export type BrandImage = OnboardingData["brand"]["images"][number];

/** Canvas → JPEG, longest side ≤ 1024 px, ≤ 400 KB (quality then size stepped down). Rejects non-images. */
export async function compressImage(file: File): Promise<BrandImage> {
  if (!file.type.startsWith("image/")) throw new Error("not-an-image");
  const bmp = await createImageBitmap(file);
  let scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  for (let pass = 0; pass < 4; pass++) {
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    ctx.fillStyle = "#ffffff"; // transparent logos would turn black in JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    for (const q of [0.85, 0.72, 0.6]) {
      const dataUrl = canvas.toDataURL("image/jpeg", q);
      // base64 length × 3/4 ≈ bytes
      if ((dataUrl.length - 23) * 0.75 <= MAX_BYTES) {
        bmp.close();
        return { name: file.name.slice(0, 80) || "photo.jpg", dataUrl };
      }
    }
    scale *= 0.75;
  }
  bmp.close();
  throw new Error("too-big");
}

/** Used by the landing PromptBox: drop a photo straight into the saved funnel so the brand step opens pre-filled. */
export function addImageToSavedFunnel(img: BrandImage) {
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    const d = (raw ? JSON.parse(raw) : {}) as Partial<OnboardingData>;
    const brand = { colors: [], vibe: [], notes: "", images: [], ...d.brand } as OnboardingData["brand"];
    brand.images = [...brand.images.filter((i) => i.name !== img.name), img].slice(-MAX_IMAGES);
    localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify({ ...d, brand }));
  } catch {
    // storage full or blocked: the photo can still be added in the brand step
  }
}

export function removeImageFromSavedFunnel(name: string) {
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw) as Partial<OnboardingData>;
    if (!d.brand) return;
    d.brand.images = d.brand.images.filter((i) => i.name !== name);
    localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(d));
  } catch {}
}
