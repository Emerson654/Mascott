# Lancement SEO / GEO : ce que seul le Président peut faire

Rédigé par Camille (SEO/GEO), 22 octobre 2026. Le site technique est prêt (sitemap, robots, JSON-LD, llms.txt, 8 articles, 5 pages « alternative à »). Ce qui suit demande un compte, une carte ou une identité : seul toi peux le faire. Coche et date chaque ligne.

## 0. Avant tout (jour 1)

- [ ] **Domaine** : acheter `mascotte.io`, le brancher sur Vercel, forcer HTTPS et choisir une seule version (sans `www`, redirection 301 de `www` vers la racine).
- [ ] **Variable Vercel** `NEXT_PUBLIC_SITE_URL=https://mascotte.io` (production). Sans elle, les URLs canoniques pointent déjà vers `https://mascotte.io` par défaut ; à changer seulement si le domaine change.
- [ ] **Nom** : vérifier à qui appartient `mascott.ai` (il est 5e sur « ai mascot », AS 7). Si ce n'est pas nous, risque de confusion de marque : à trancher avant d'acheter des liens ou d'imprimer quoi que ce soit (voir `founder/seo-competition.md`).
- [ ] Vérifier en ligne après déploiement : `https://mascotte.io/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/opengraph-image`.

## 1. Google Search Console (jour 1, 20 min)

1. Aller sur https://search.google.com/search-console, « Ajouter une propriété » → **Domaine** → `mascotte.io`.
2. Copier l'enregistrement **TXT** proposé et l'ajouter dans la zone DNS (chez le registrar ou dans Vercel → Domains → DNS). Attendre la validation (quelques minutes à quelques heures).
3. Menu **Sitemaps** → soumettre `https://mascotte.io/sitemap.xml`.
4. **Inspection d'URL** → demander l'indexation de : `/`, `/pricing`, `/alternatives/intercom`, `/alternatives/userpilot`, `/blog/best-intercom-alternatives-small-saas`.
5. Laisser le réglage « Search generative AI » sur **inclure** (par défaut) : c'est ce qui rend le site éligible aux AI Overviews / AI Mode.
6. Garder l'accès propriétaire pour toi seul. Pour les revues (M1, M3), exporter le rapport « Performances » en CSV dans `founder/` : les agents l'analyseront.

## 2. Bing Webmaster Tools + IndexNow (jour 1, 15 min)

Bing alimente ChatGPT Search et Copilot : c'est aussi important que Google pour le GEO.

1. https://www.bing.com/webmasters → « Importer depuis Google Search Console » (le plus rapide) ou vérification DNS.
2. Soumettre `https://mascotte.io/sitemap.xml`.
3. **IndexNow** : dans Bing Webmaster → IndexNow, générer une clé. Me la transmettre (ce n'est pas un secret critique, mais on la met en variable d'env) : j'ajouterai le fichier de clé et un ping automatique à chaque publication. Rien à coder de ton côté.
4. Revendiquer **Bing Places** n'est pas utile (pas de commerce local).

## 3. Mesure (semaine 1)

- [ ] GA4 ou Plausible : créer le groupe de canaux « AI assistants » (référents `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`, `copilot.microsoft.com`, `utm_source=chatgpt.com`).
- [ ] Ajouter « ChatGPT / assistant IA » dans la question « Comment nous avez-vous connus ? » à l'inscription (voir avec Hugo).
- [ ] Lundi, 30 min : le panel de 25 prompts × 5 moteurs (`founder/marketing.md` §3), consigné dans `founder/geo-log.csv`.

## 4. Annuaires à soumettre (semaines 1 à 4, gratuits d'abord)

Utiliser **partout la même phrase** : « Mascott is an AI onboarding guide with a face: a cute, customisable mascot that answers visitors from your content and points new users to their next step. » Même nom, même URL, même logo.

| Annuaire | URL | Note |
|---|---|---|
| Product Hunt (page « upcoming ») | https://www.producthunt.com | Lancement prévu mardi 1er décembre |
| There's An AI For That | https://theresanaiforthat.com | |
| Futurepedia | https://www.futurepedia.io | |
| Toolify | https://www.toolify.ai | |
| AlternativeTo | https://alternativeto.net | Se lister comme alternative à Userpilot, Appcues, Intercom, Tidio, Chatbase |
| SaaSHub | https://www.saashub.com | Idem, onglet « alternatives » |
| BetaList | https://betalist.com | |
| Indie Hackers (produits) | https://www.indiehackers.com/products | |
| Uneed | https://www.uneed.best | |
| Microlaunch | https://microlaunch.net | |
| Crunchbase | https://www.crunchbase.com | Fiche entreprise |
| LinkedIn (page entreprise) et X | | Puis me donner les URLs |

Objectif : **15 fiches d'ici la semaine 6.** Chaque fois qu'un profil existe, me donner son URL : je l'ajoute à `SAME_AS` dans `web/src/lib/seo.ts` (schéma Organization). Ne jamais lister un profil qui n'existe pas.

## 5. G2 et Capterra (semaine 4)

1. Revendiquer la fiche vendeur sur https://sell.g2.com et https://www.capterra.com/vendors (Capterra couvre aussi GetApp et Software Advice).
2. Catégories : « Digital Adoption Platform / User Onboarding », et « Chatbots ».
3. Après 30 jours d'usage, demander un **avis honnête** à chaque client pilote. Si une incitation est offerte, elle suit les règles de chaque plateforme (neutre, déclarée, identique quelle que soit la note). **Jamais de faux avis**, ni d'avis écrits par nous.
4. Pas de `AggregateRating` dans le schéma tant qu'il n'y a pas de vrais avis affichés.

## 6. Product Hunt (lancement mardi 1er décembre)

- [ ] Créer la page « upcoming » dès maintenant pour collecter des abonnés.
- [ ] Préparer : tagline (60 caractères), 4 visuels (dont la mascotte en action), une vidéo de 30 s, le premier commentaire du fondateur (qui tu es, pourquoi, ce qui ne marche pas encore).
- [ ] Lancer à 00:01 heure du Pacifique, être présent toute la journée pour répondre.
- [ ] Lien de la page PH vers `/alternatives` et `/create`.

## 7. Liens et mentions (en continu, toi seul)

- 3 réponses utiles par semaine sur r/SaaS, r/startups, Indie Hackers ; **toujours dire que tu es le fondateur** quand Mascott est cité. La plupart des réponses ne doivent pas citer le produit.
- Écrire aux auteurs des 20 pages « best AI onboarding tools » / « Userpilot alternatives » avec une fiche de 3 lignes et un accès gratuit.
- Nom de domaine, profils sociaux et annuaires : ce sont les « mentions de marque » qui comptent le plus pour être cité par les IA.

## 8. Calendrier éditorial : 12 semaines, 1 article par semaine

Rédigés par les agents (Camille + relecture Léa pour le ton), publiés le lundi. Règles : réponse directe en tête, tableau de faits sourcés et datés, FAQ, liens internes vers `/alternatives/*` et `/create`, aucun chiffre inventé, dire quand un concurrent est meilleur. Mots-clés et volumes : `founder/seo-competition.md` (groupe A sauf mention).

| Semaine (lundi) | Article | Mot-clé principal (vol./mois, KD) | Page « alternative » à créer en même temps |
|---|---|---|---|
| S1 (26 oct.) | Appcues alternatives: the honest shortlist | appcues alternatives (140, KD 3) | — (existe) |
| S2 (2 nov.) | What does Intercom Fin really cost? A per-resolution calculator | intercom fin pricing (20, KD 0) + intercom fin alternative | `/alternatives/intercom-fin` |
| S3 (9 nov.) | Interactive walkthroughs without code: 5 ways compared | interactive walkthrough (70, KD 5) | — |
| S4 (16 nov.) | Crisp vs Intercom for early-stage SaaS | crisp vs intercom (70, KD 9) | — |
| S5 (23 nov.) | Chatbase alternatives for SaaS teams | chatbase alternative (70, KD 10) | — (existe) |
| S6 (30 nov.) | AI mascot generator: how to design a brand mascot that isn't childish | ai mascot generator (170, KD 21), mascot generator (260, KD 14) | — |
| S7 (7 déc.) | Product Fruits alternatives | product fruits alternatives (30, KD 0) | `/alternatives/product-fruits` |
| S8 (14 déc.) | Product adoption software: what small teams actually need | product adoption software (210, KD 22) | — |
| S9 (21 déc.) | SaaS onboarding: the 10-step checklist for small teams | saas onboarding (390, KD 28) | — |
| S10 (28 déc.) | Time to value: how to measure it and cut it in half | time to value (720, KD 28) | — |
| S11 (4 janv.) | UserGuiding alternatives | userguiding alternatives (10, KD 0) | `/alternatives/userguiding` |
| S12 (11 janv.) | Chatbot avatar: should your chatbot have a face? | chatbot avatar (90, KD 24), chatbot widget (110, KD 22) | — |

Chaque trimestre : revérifier les prix concurrents (date `CHECKED_ON` dans `web/src/app/alternatives/_data.ts`) et mettre à jour le champ `updated` des articles modifiés. À M3 : revue Search Console, fusionner ou supprimer les pages sans impression.

## Où sont les choses (pour les agents)

- Métadonnées : `web/src/lib/seo.ts` (`pageMetadata({ title, description, path })` pour toute nouvelle page).
- JSON-LD : `web/src/components/seo/JsonLd.tsx` (le prix du schéma vient de `web/src/lib/pricing.ts`).
- Articles : un fichier `.md` dans `web/src/content/blog/` (frontmatter `title`, `description`, `date`, `updated?`, `keywords`, `author`). Les prix s'écrivent `{{price:growth}}`, `{{yearly:growth}}`, `{{plan:growth}}`, `{{guarantee}}` pour rester synchronisés avec la grille.
- Pages « alternative » : une entrée de plus dans `web/src/app/alternatives/_data.ts`.
- Sitemap, `llms.txt` et `llms-full.txt` se mettent à jour seuls au build.
