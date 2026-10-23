# Mascott: brand and art direction

Owner: Léa (brand). Version 2, 2026-10-23 (section 9 added: generated mascots art direction). The values in code live in `web/src/content/brand.ts`; the text lives in `web/src/content/copy.ts`.
Sources: `founder/marketing.md` (positioning A, beachhead), `founder/competitors.md` (complaints, gap), `founder/panel-v2/results.md` (objections), `report/mascott-v2.html` (plan: 49/149 EUR, install in a few clicks, cute + pro).

## 1. What the brand has to do

- **Promise (one line):** a cute guide that gets your new users to the next step.
- **The tension to solve:** the panel calls cartoons "childish" (P009, P015) and fears an AI acting badly in front of customers (P002, P010). The buyers who said yes wanted "on top of my chat, no migration" and a refund (P007, P011). So the look is cute, and every word next to it is about control, proof and a flat price.
- **Category words** (for SEO/GEO, from `marketing.md`): "AI onboarding guide", "AI mascot for website". "Mascot" is the brand and the hook; "onboarding guide" is what buyers search for.

## 2. Benchmark: cute brands that sell

These are my reading of public sites, not measured data. What we keep is noted for each.

| Brand | What they do | What we keep | What we avoid |
|---|---|---|---|
| **Duolingo** (Duo the owl) | The mascot *is* the product voice: it reacts, nudges and jokes. Flat shapes, thick rounded forms, one saturated green. | A character with moods and short, funny lines. Reactions when poked. One body colour per mascot. | The guilt-trip tone ("you made Duo sad"). B2B buyers will not tolerate it on their users. |
| **Clippy** (Microsoft Office) | The cautionary tale: it popped up uninvited and interrupted. | The idea that a helper should be *right there* in context. | Interrupting. Our mascot waits, greets once, and stays small unless asked (answers complaint #5 in `competitors.md`). |
| **Notion** | Hand-drawn black-and-white people on a white page. Calm, smart, a little playful. | Lots of white space and characters as accents, never wallpaper. Serious product, warm drawings. | Monochrome. We need colour to make the mascot the hero. |
| **Linear** | Precise, fast, minimal. Proof that a small team can look premium. | Tight type, one strong accent, sharp product screenshots, short sentences. | The dark, cold mood. Our page is bright. |
| **Mailchimp** (Freddie) | A mascot on a B2B tool that SMBs trust with money and customer data. Warm colours, editorial illustrations. | Cute and credible can coexist when the copy is concrete. Mascot as signature, not the whole page. | Over-quirky illustration that hides the product. |
| **Headspace** | Round, soft, orange characters; cocooning feeling; simple shapes. | Soft, round, pastel halos behind characters. The "safe, cozy" feeling. | Consumer wellness tone. We still sell activation to SaaS teams. |

**Competitor looks to stay clear of** (`competitors.md`): Mascotbot (Rive animated characters, custom-built), Anam (photoreal faces), Tidio/Intercom/Crisp (blue chat bubble). Note: a `mascott.ai` domain exists and ranks for "ai mascot" (`report/mascott-v2.html`); our name, colours and logo must never resemble it. Trademark and domain checks are open (see section 8).

## 3. Art direction

**One sentence:** a bright white page, one big rounded headline whose last words change in a gradient, and a carousel of soft, round mascots that talk and react, framed by copy that sounds like a calm senior PM.

- **Page:** white (#FFFFFF) and luminous. Pastel halos (lavender, pink, apricot) sit behind mascots only. Sections alternate white and the lavender surface (#F6F5FF).
- **Hero:** "Give your product a" + rotating words in the gradient (#4F5BF5 → #D94E9A → #E8742A). The prompt box sits right under it: describing a mascot is the first action.
- **Carousel:** six demo mascots on a slow 3D ring, each in a different art direction (felt plush, glossy object, gradient orb, vinyl robot, clay, plant creature; see section 9). The front one speaks (speech bubble, typing effect). A poke makes it react. Each mascot shows a SaaS job: pointing at a button, answering from docs, handing off to a human.
- **Universe:** "cute / cocooning" (soft shapes, round eyes, scarves and headphones, warm pastels) made credible for B2B by: real product moments in every line, a "pro" style variant shown in the cast (Miso, Juno, Bolt), sober typography for body text, and no exclamation marks.

## 4. Palette

| Token | Hex | Job | Contrast on white |
|---|---|---|---|
| `bg` | #FFFFFF | Page background | n/a |
| `surface` | #F6F5FF | Cards, prompt box, alternating sections | n/a |
| `ink` | #1B1D3A | Headlines and body text | 16.4:1 |
| `muted` | #6B6F93 | Secondary text, captions | 4.9:1 (AA) |
| `primary` | #4F5BF5 | Buttons, links, focus rings. White text on it: 5.1:1 | 5.1:1 (AA) |
| `sun` | #FFD36E | Step numbers, badges, highlights. **Never text on white** | 1.4:1 |
| `gradient` | #4F5BF5 → #D94E9A → #E8742A | The rotating hero word only (and the logo dot) | each stop ≥ 3.0:1 (AA large text) |
| `soft` | #E9ECFF · #FFE3F1 · #FFF1DE | Halos behind mascots, section blobs. Backgrounds only | n/a |

The gradient is darker than a typical pastel gradient on purpose: a pastel gradient (#7C8CFF → #FF8FC7) falls to 2.1:1 on white and fails even for large text. Mascot body colours (in `brand.ts`) can be pastel because they are illustration, not text.

## 5. Typography (Google Fonts, free, SIL Open Font License)

- **Display: Fredoka** (600 for headlines, 500 for subheads). Rounded terminals give the "cute" signal at large sizes; at 600 weight it stays readable and not babyish. Use it for h1-h3, the rotating word, step numbers and mascot names only.
- **Body: Figtree** (400 / 600). Geometric, friendly, very readable at 16px. Everything else: body, buttons, FAQ, forms.
- Loading: `next/font/google` with `display: "swap"`, subsets `latin`. Same pair as the CEO's reports, so the brand already feels consistent.
- Sizes: h1 clamp(2.5rem, 6vw, 4.5rem), line-height 1.05, `text-wrap: balance`. Body 16-18px, line-height 1.6, max 68ch.

## 6. Voice

Three adjectives, each with a do and a don't:

| Adjective | Do | Don't |
|---|---|---|
| **Warm** | "Welcome in. Three steps and your first invoice goes out." | "Hey there, superstar!!" |
| **Concrete** | "The CSV button is right here, top right." | "Seamlessly streamline your onboarding journey." |
| **Calm and honest** | "We won't promise a number we haven't measured on your product." | "Boost conversions by 300%." |

Rules: short sentences; the mascot speaks in the first person, the brand in "we"; mascots are "she" in brand copy (one consistent pronoun, gender-neutral species); no exclamation marks in site copy (mascot reactions may use one sparingly); no invented numbers, logos or testimonials; prices always shown in EUR and always flat.

**Before / after** (pitch line from `marketing.md`):
- Before: "Mascott is the AI onboarding guide with a face that answers from your docs and points new users to their next step, on top of the Intercom or Crisp you already run."
- After: "A cute guide that shows your new users the next button to click. It sits next to your current chat."

**Taglines** (pick one for the footer and social bios): 1. "Cute AI mascots that guide your users to the next step." (in use) 2. "The friendly face of your onboarding." 3. "Your product's new favourite guide."

## 7. Ten visual rules

1. **White first.** At least 60% of every screen is white. Colour comes from the mascots and the gradient word.
2. **One gradient, one place.** The gradient is only on the rotating hero word and the logo dot. Never on buttons, never on body text.
3. **Every mascot gets a halo.** A soft pastel circle or blob sits behind each mascot; no hard drop shadows.
4. **Round everything.** Radius 16-24px on cards, 999px on buttons and pills. No sharp corners anywhere.
5. **One primary action per screen.** A single #4F5BF5 button; secondary actions are text links or ghost buttons.
6. **Show a pro mascot above the fold.** At least one "pro" style mascot is visible in the first carousel view, so B2B buyers see the sober option immediately.
7. **Motion is gentle and optional.** Idle breathing, blinking and a slow carousel; nothing loops faster than 3 seconds. Respect `prefers-reduced-motion` (static mascots, no rotation).
8. **Mascots speak product, not fluff.** Every bubble on the landing shows a real SaaS action: pointing at a button, answering a docs question, handing off to a human.
9. **Text never sits on pastel or sun colours** unless it is ink (#1B1D3A). Check AA on every new pair.
10. **No fake proof.** No invented logos, ratings, counters or quotes. A proof section stays empty until we have real pilots.

## 8. Open items (not mine to decide, flagged for the CEO)

- **Claims to confirm before launch** (written in `copy.ts`, need Yanis/Sacha/Victor to confirm they are true): the mascot never clicks or submits (read-only v1); conversations are never sold and can be deleted; a DPA is available on request; the script loads after the page; one switch turns the mascot off; React/Next.js/Vue/HTML and Google Tag Manager install; "Made with care in Europe" in the footer.
- **Guarantee wording:** I wrote "30 days, full refund, one email". Inès must confirm the exact terms match Stripe and the CGV.
- **Plan names:** copy says "€49 a month for one product, €149 for larger teams or several products". Align with `src/lib/pricing.ts` once Inès ships it.
- **Name and domain:** `mascotte.io` availability, the `mascott.ai` conflict and trademark searches (EUIPO, INPI, USPTO, class 9 and 42) are still to run. Public searches only; a trademark lawyer confirms.
- **Logo:** not designed yet. Brief: the word "Mascott" in Fredoka 600 ink, with the dot of a small round blob (gradient) as a mark that works alone at 32px.

## 9. Art direction of generated mascots (v2)

**Why:** the Président's feedback was "all the mascots look the same". One SVG template recoloured six times reads as one product, not as *your* mascot. v2 (`web/CONTRACTS.md`) has an AI art director design a one-off character around each brand universe (colours, vibes, notes, uploaded logo or screenshots). Reference point: the companion characters of modern AI assistants (soft 3D characters, minimal gradient orbs, friendly companion creatures), which our buyers already see every day. We borrow the *category* of look, never a specific character.
**Panel link:** "childish" was the top objection (P009, P015, `founder/panel-v2/results.md`). That is why at least four of the ten directions below read as "pro" (orb, object, robot, paper), and why the AI picks the direction from the brand's vibe, not at random.

### 9.1 The ten directions the AI can choose

| # | Direction | What it looks like | Prompt keywords | Use it when |
|---|---|---|---|---|
| 1 | **Glossy 3D toy** | Smooth vinyl-toy character, big glossy eyes, soft rim light | `glossy 3D render, smooth vinyl toy, soft subsurface glow, studio lighting, soft contact shadow` | Default for SaaS, consumer apps, marketplaces. Vibes: playful, bold, warm |
| 2 | **Felt plush** | Hand-sewn wool felt toy, stitched seams, bead eyes | `wool felt plush toy, visible blanket-stitch seams, fuzzy fibres, soft matte, handmade` | CRM, HR, community, family, education, food. Vibes: cozy, warm |
| 3 | **Claymation** | Plasticine figure with fingerprints and tool marks | `plasticine claymation character, fingerprints, handcrafted stop-motion, soft studio lighting` | Analytics, creative tools, agencies, kids/edu. Vibes: playful, natural |
| 4 | **Gradient orb** | Floating frosted-glass sphere, soft gradient inside, minimal face (two arcs and a smile), no limbs | `floating frosted glass orb, soft inner gradient, gentle glow, minimal face, no limbs, serene` | AI products, wellbeing, finance, premium B2B, dev tools. Vibes: calm, minimal, premium, futuristic |
| 5 | **Object character** | The product's own object with a face: a cup, an invoice, a parcel, a calendar page, a plant pot | `cute object character, [object] with a friendly face, stubby arms, glossy 3D toy` | Whenever the product has an obvious object (invoice, booking, coffee shop, shipping, docs). Vibes: any; strongest memorability |
| 6 | **Rounded robot** | Capsule body, dark face screen with glowing eyes, soft-touch matte | `small rounded robot, soft-touch matte vinyl, dark face screen with glowing eyes, chubby proportions` | No-code, dev tools, automation, IT, security. Vibes: techy, futuristic |
| 7 | **Plant creature** | Sprout or leaf creature, often in a tiny pot | `cute plant creature, sprout body, glossy leaves, tiny terracotta pot` | Language learning, sustainability, wellbeing, growth tools, gardening. Vibes: natural, calm |
| 8 | **Soft animal (3D)** | A rounded animal (fox, owl, otter, bear, cat...) with a brand-specific prop | `chubby rounded [animal], short limbs, big head, [prop], soft 3D render` | When the brand name or notes suggest an animal, or the vibe is warm/friendly |
| 9 | **Paper cut-out** | Layered paper craft character, subtle drop shadows between layers | `layered paper craft character, cut paper, subtle depth shadows, matte` | Publishing, legal, docs, editorial, accounting. Vibes: minimal, calm |
| 10 | **Knitted / crochet** | Amigurumi crochet character, visible yarn loops | `amigurumi crochet character, visible yarn loops, soft wool, handmade` | Retail, crafts, kids, local shops, cozy consumer brands. Vibes: cozy, warm |

Choosing: (1) if the product has an obvious object, prefer **5**; (2) otherwise match the strongest vibe chip to the "use it when" column; (3) on a tie, take the more sober option for B2B (4, 6, 9) and the softer one for consumer (2, 7, 10). Colours always come from the brand scan: body = main brand colour softened, accents = second brand colour, background = a very pale tint of one of them.

### 9.2 Rules (every generated mascot)

1. **Cute first:** big head, short limbs, large friendly eyes or a soft minimal face, a smile. Never scary, sad, sexy or aggressive.
2. **Readable at 64 px:** one simple silhouette, at most one prop, no thin details that vanish when small. Test: squint; you should still see the shape and the eyes.
3. **Plain background:** one flat soft pastel colour, no scene, no gradient sky, no floor pattern (the widget cuts the character out and places it on any site).
4. **Full body, centered**, the whole character in frame with a little margin.
5. **No text:** no letters, numbers, logos or watermarks in the image. The brand's logo is never drawn on the mascot.
6. **No imitation:** no existing character, mascot, brand or trademark, and no "in the style of" a named living artist or studio. Describe the material and shape instead.
7. **5 colours max**, each with a hex value in the prompt.
8. **One mascot, one expression, one pose** per image. Friendly default: waving or pointing to the side (the product job).

### 9.3 Creative director system prompt (copy-paste, for Yanis)

```
You are the art director of Mascott. You design one cute, original mascot character for a brand's website guide.
Input: company name, industry, description, brand colours (hex), vibe words, free notes and image descriptions.
Steps:
1. Pick ONE direction: glossy 3D toy, felt plush, claymation, gradient orb with minimal face, object character (an object from the product with a face), rounded robot, plant creature, soft 3D animal, paper cut-out, crochet amigurumi. Prefer an object character when the product has an obvious object. Match the strongest vibe. For serious B2B, prefer orb, robot, object or paper.
2. Build the palette from the brand colours: body = main colour softened, accents = second colour, background = very pale tint. Max 5 colours, all hex.
3. Write the image prompt in English, 80-140 words, in this order: subject and concept tied to the product; shape and proportions (big head, short limbs, simple silhouette readable at 64 px); material and render; palette with hex; expression; pose (waving or pointing to the side); then "full body, centered, plain soft pastel background <hex>, no text, no logo, high quality mascot character, soft studio lighting".
Rules: always cute and friendly. No text, letters, numbers or logos in the image. Never reference an existing character, brand, franchise or named artist. One character only.
Also return: a short name (1-2 syllables), a one-line concept for alt text, and the closest SVG fallback (species among blob, cat, bear, bunny, fox, owl, robot, dragon, with primary, secondary and accent hex).
```

The six landing mascots in `brand.ts` follow this exactly and serve as worked examples (fixed `seed` so they never change between visits).
