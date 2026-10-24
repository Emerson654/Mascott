# Ce qu'il te reste à faire (seul toi peux le faire)

Le site est en ligne : https://mascott-livid.vercel.app (déploiement automatique depuis la branche `claude/saas-mascots-simulation-syx5y6`).
Tout fonctionne déjà sans clé : génération de mascotte (mode sans IA), tunnel, paywall (qui renvoie vers la réservation de pilote tant que Stripe n'est pas branché).

## 1. Activer l'IA gratuite (5 min) — recommandé
1. Va sur https://aistudio.google.com/apikey et crée une clé Gemini (gratuite).
2. Vercel → projet `mascott` → Settings → Environment Variables → ajoute `GEMINI_API_KEY` (Production + Preview), puis « Redeploy ».
   Ou donne-moi la clé dans une conversation et je l'ajoute.

## 2. Encaisser les paiements (20 min)
Suis `docs/stripe-setup.md` (écrit par Inès) : compte Stripe, 3 produits / 6 prix, puis ajoute dans Vercel `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER_MONTHLY`… et `STRIPE_WEBHOOK_SECRET`. Active Stripe Tax.

## 3. Le nom de domaine
Achète `mascotte.io` (ou le nom choisi), ajoute-le dans Vercel → Domains, puis change `NEXT_PUBLIC_SITE_URL` en `https://mascotte.io` et redéploie. Vérifie aussi qui possède `mascott.ai` (risque de confusion de marque).

## 4. Être référencé (30 min, une fois)
Suis `docs/seo-launch.md` (écrit par Camille) : Google Search Console (soumettre le sitemap), Bing Webmaster, annuaires, Product Hunt.

## 5. Recevoir les leads
Optionnel : `LEAD_WEBHOOK_URL` (Slack / Make / Zapier) ou `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` pour recevoir par email les inscriptions et les ventes.

## Optionnel : images IA plus belles et plus fiables (5 min, gratuit)
Aujourd'hui les mascottes générées passent par l'offre gratuite anonyme de Pollinations (1 image / 45 s par IP, petit logo masqué par le site).
Pour la qualité « flux » sans filigrane ni file d'attente : créer un compte sur https://enter.pollinations.ai, copier la clé,
puis l'ajouter dans Vercel → projet mascott → Settings → Environment Variables : `POLLINATIONS_API_KEY` (cocher Sensitive), et redéployer.
Le code l'utilise automatiquement.
