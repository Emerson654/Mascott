# Mascott (nom provisoire, domaine envisagé : mascotte.io)

SaaS : des mascottes IA mignonnes et personnalisables (prompt ou cases à cocher) qui guident les visiteurs d'un site ou d'un SaaS (répondre, pointer l'étape suivante, actions guidées), installées en quelques clics.
Cible n°1 (simulations) : petites équipes SaaS B2B (2-20 pers.), onboarding / activation. Prix : Starter 19 € / Growth 49 € / Scale 149 € par mois, 2 mois offerts en annuel, essai sur le vrai site, garantie, pas de plan gratuit (générateur de mascotte gratuit = aimant).
Sources : `founder/` (board, panels, concurrents, CFO, marketing, SEO Semrush), `sim/` (simulateur, résultats), `report/` (rapports CEO), `docs/roadmap.md` (Gantt).

## Organisation : une entreprise d'agents IA
- **Président** : le fondateur (humain). Donne les objectifs, valide le travail final.
- **CEO** : la conversation principale. Traduit les demandes en missions, déploie les agents de `.claude/agents/`, relit et teste leur travail, puis soumet au Président.
- **Employés** : les sous-agents définis dans `.claude/agents/`. Chaque fiche dit quels skills charger.

### Règle pour TOUS les agents (CEO compris)
- Toujours appliquer `graphify` (avant tout changement touchant plusieurs fichiers) et `ponytail` (choisir la solution la plus simple).
- Les devs finissent par `verify-and-stop` : tests / lint verts avant de rendre la main.
- Ne jamais commiter de secret (clés Stripe, Supabase…). Rendre au CEO un résumé court : fait, testé, reste à faire.

## Pôles, agents et skills
| Pôle | Agent (`.claude/agents/`) | Skills dédiés |
|---|---|---|
| Direction | CEO (conversation principale) | founder-* (board, plan, cfo, launch…), caveman/cavecrew et context-mode pour économiser les tokens |
| Marketing · Marque & DA | `marketing-brand` (Léa) | founder-brand, product-marketing, copywriting, copy-editing, marketing-psychology |
| Marketing · CRO (avec le front) | `marketing-cro` (Hugo) | cro, cro-optimization, signup, onboarding, popups, ab-testing, analytics, lead-magnets, copywriting |
| Marketing · Prix & Stripe | `marketing-pricing` (Inès) | pricing, offers, founder-pricing, founder-offer, founder-cfo ; + implementing-api-schema-validation-security avant de toucher au code Stripe |
| Marketing · Communication (INACTIF au départ) | `marketing-communication` (Nora) | copywriting, copy-editing, marketing-psychology, hyperframes (+ hyperframes-*), general-video, media-use |
| Commercial · Prospection | `sales` (Malik) | customer-research, competitors, founder-competitors, offers, copywriting |
| Dev · Front-end (pages du SaaS) | `dev-frontend` (Chloé) | TOUS les skills design : impeccable, apple-design, react-bits |
| Dev · Back-end (base de données, API) | `dev-backend` (Yanis) | lean-build, migration, safe-refactor, surgical-patch, investigate-first |
| Dev · Moteur de la mascotte | `dev-mascot-engine` (Sacha) | lean-build, investigate-first, safe-refactor, surgical-patch, apple-design (animations) |
| Dev · SEO / GEO | `dev-seo-geo` (Camille) | TOUS les skills SEO/GEO : seo, seo-audit, seo-content, seo-geo, seo-local, seo-page, seo-schema, seo-sitemap, seo-technical, + competitors (pages « alternative à ») |
| Dev · Cybersécurité | `dev-security` (Victor) | implementing-api-schema-validation-security, implementing-secret-scanning-with-gitleaks, testing-api-security-with-owasp-top-10, testing-for-broken-access-control |

Note : certains skills personnels mentionnent « Favoly » (autre projet du fondateur) ; ici, lire « Mascott ».

## Méthode de travail
1. Le Président écrit sa demande au CEO.
2. Le CEO découpe en missions, lance les agents concernés (en parallèle si indépendants) avec un brief autonome (les agents ne voient pas la conversation).
3. Les agents livrent ; le CEO relit, lance les tests, renvoie si besoin (l'agent `dev-security` passe sur tout ce qui touche auth, paiements, données).
4. Le CEO soumet au Président : ce qui est fait, comment tester, ce qui reste. Commit + push sur la branche de travail.

## Organigramme en direct (obligatoire dès qu'une demande mobilise des sous-agents)
Page : https://claude.ai/artifact/V21CttCNhW8co6hBZbMEx9 (source : `report/organigramme.html`).
1. Ouvrir la page pour le Président (outil Artifact, action `open`).
2. État = document `org/status` de la base de la page (outil `ArtifactData`, `collection: "org"`, `doc_id: "status"`, toujours avec `if_version`).
   Clés = id de l'agent (ex. `"dev-frontend"`), valeur `{"state": "working" | "testing" | "idle", "task": "≤ 16 caractères"}` ; `ceo: {"task": ...}`.
3. `working` au lancement d'un agent (le courant descend) ; `testing` quand le CEO vérifie son travail (le courant remonte) ; `idle` quand c'est fini. Plusieurs agents peuvent être actifs en même temps.
4. Parler des employés par leur prénom (Léa, Hugo, Inès, Nora, Malik, Chloé, Yanis, Sacha, Camille, Victor).
