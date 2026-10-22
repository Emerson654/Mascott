# Mettre en place Stripe pour Mascott

Guide pas-à-pas pour le Président. Rédigé par Inès (prix et Stripe), le 2026-10-22.
Source des prix dans le code : `web/src/lib/pricing.ts`. Si un prix change, on le change là **et** dans Stripe.

> Règle d'or : **aucune clé Stripe dans le dépôt**. Les clés vont uniquement dans les variables d'environnement de Vercel (et dans `web/.env.local` sur ta machine, fichier ignoré par git). Toute modification du code Stripe passe ensuite par Victor (sécurité).

## 0. La grille à créer

| Plan | Id | Mensuel | Annuel (facturé une fois par an) | Conversations / mois | Sites |
|---|---|---:|---:|---:|---:|
| Starter | `starter` | 19 € | 190 € (soit 15,83 €/mois) | 300 | 1 |
| **Growth** (recommandé) | `growth` | 49 € | 490 € (soit 40,83 €/mois) | 1 500 | 3 |
| Scale | `scale` | 149 € | 1 490 € (soit 124,17 €/mois) | 6 000 | 10 |

- Annuel = 10 mois payés, **2 mois offerts** (−16,7 %, arrondi à −17 % comme dans le plan recommandé).
- Prix **hors taxes** : la TVA s'ajoute par Stripe Tax (étape 5).
- Pas de plan gratuit. L'essai, c'est la mascotte générée gratuitement et testée sur le vrai site du client dans le tunnel de création. Ensuite : **garantie « satisfait ou remboursé » 30 jours**, sans période d'essai Stripe (plus simple, et l'argent arrive tout de suite).
- **Offre de lancement** : −30 % sur les 3 premiers mois, abonnements **mensuels** uniquement, réservée aux **50 premiers clients**, jusqu'au **31 décembre 2026**. Le plafond et la date sont appliqués par Stripe lui-même (étape 3), donc l'urgence affichée est vraie.

## 1. Créer le compte

1. Va sur https://dashboard.stripe.com/register et crée le compte avec l'adresse de la société.
2. Laisse le **mode test** activé (interrupteur « Test mode » en haut à droite) pour toutes les étapes 2 à 6.
3. Plus tard, pour passer en live : « Activer les paiements » → infos de la SASU (SIREN, adresse), représentant légal, IBAN professionnel. Compte 1 à 2 jours de vérification.
4. Paramètres → Détails publics : nom affiché « Mascott », e-mail de support, URL du site. Paramètres → Branding : logo et couleur (demande-les à Léa).

## 2. Créer les produits et les prix

Catalogue de produits → « + Ajouter un produit ». Crée **3 produits**, chacun avec **2 prix récurrents** :

| Produit (nom exact) | Prix 1 | Prix 2 |
|---|---|---|
| Mascott Starter | 19,00 EUR, récurrent, mensuel | 190,00 EUR, récurrent, annuel |
| Mascott Growth | 49,00 EUR, récurrent, mensuel | 490,00 EUR, récurrent, annuel |
| Mascott Scale | 149,00 EUR, récurrent, mensuel | 1 490,00 EUR, récurrent, annuel |

Pour chaque prix :
- Devise **EUR**, modèle « Tarification standard ».
- Comportement fiscal : **« Exclusif »** (le prix affiché est HT, la TVA s'ajoute).
- Code fiscal du produit : « Logiciel en tant que service (SaaS) – usage professionnel » (`txcd_10103001`).

Chaque prix a un identifiant qui commence par `price_…` (clique sur le prix pour le copier). Note-les dans ces variables :

```
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_GROWTH_MONTHLY=price_...
STRIPE_PRICE_GROWTH_YEARLY=price_...
STRIPE_PRICE_SCALE_MONTHLY=price_...
STRIPE_PRICE_SCALE_YEARLY=price_...
```

Le format est `STRIPE_PRICE_<PLANID>_<MONTHLY|YEARLY>`, avec l'id du plan de `pricing.ts` en majuscules.

## 3. Créer le coupon de lancement

Catalogue de produits → Coupons → « + Nouveau » :
- Nom : `Founding customers`
- Type : pourcentage, **30 %**
- Durée : **plusieurs mois**, **3** mois
- Cocher « Limiter le nombre total d'utilisations » : **50**
- Cocher « Limiter la date d'utilisation » : **31/12/2026 23:59**

Copie l'id du coupon dans `STRIPE_LAUNCH_COUPON=...`. Le back-end l'applique seulement aux abonnements mensuels (`LAUNCH_OFFER.appliesTo = "monthly"`). Après le 31/12/2026, Stripe le refuse tout seul ; il suffira de mettre `LAUNCH_OFFER = null` dans `pricing.ts` pour retirer le bandeau.

Pas de faux prix barré : on n'affiche jamais un « ancien prix » qui n'a jamais été facturé.

## 4. Les clés API

Développeurs → Clés API :
- `STRIPE_SECRET_KEY` = la clé secrète (`sk_test_…` en test, `sk_live_…` en live). **Jamais dans le code, jamais dans un message, jamais côté navigateur.**
- La clé publiable (`pk_…`) n'est pas nécessaire : on redirige vers Stripe Checkout côté serveur.
- Mieux : crée une **clé restreinte** (`rk_…`) avec seulement « Checkout Sessions : écriture », « Customers : écriture », « Subscriptions : lecture », et utilise-la comme `STRIPE_SECRET_KEY`.

## 5. Activer la TVA (Stripe Tax)

1. Paramètres → Taxes → « Activer Stripe Tax ».
2. Adresse d'origine : l'adresse de la SASU en France. Code fiscal par défaut : `txcd_10103001` (SaaS professionnel).
3. Enregistrements : ajoute **France** (TVA 20 %). Pour les clients B2B de l'UE avec un numéro de TVA valide, Stripe applique l'**autoliquidation** (0 %) automatiquement si la collecte du numéro de TVA est activée dans Checkout (le back-end passe `tax_id_collection` et `automatic_tax`).
4. Pour les particuliers ou entreprises sans numéro dans d'autres pays de l'UE : à surveiller. Au-delà de 10 000 € de ventes B2C UE par an, il faut s'inscrire au guichet unique **OSS**. Stripe Tax affiche une alerte quand un seuil approche.
5. Stripe Tax coûte environ 0,5 % par transaction où une taxe est calculée. Fais valider par l'expert-comptable (TVA, OSS) avant le passage en live.

## 6. Le webhook

Développeurs → Webhooks → « + Ajouter un endpoint » :
- URL : `https://<ton-domaine>/api/stripe/webhook` (par exemple `https://mascotte.io/api/stripe/webhook`).
- Événement : **`checkout.session.completed`** (suffisant pour démarrer). Plus tard, utiles : `customer.subscription.deleted` (résiliation) et `invoice.payment_failed` (carte refusée).
- Après création, « Révéler » le secret de signature (`whsec_…`) → `STRIPE_WEBHOOK_SECRET=whsec_...`.

Le back-end doit **vérifier la signature** de chaque appel avec ce secret avant de croire l'événement (point contrôlé par Victor).

Test en local, si tu as la CLI Stripe : `stripe listen --forward-to localhost:3000/api/stripe/webhook` (elle affiche un `whsec_` temporaire à mettre dans `web/.env.local`).

## 7. Alternative sans code : les Payment Links

Si le Checkout du back-end n'est pas prêt, l'API `/api/checkout` peut renvoyer vers des liens de paiement Stripe.
Catalogue → Liens de paiement → « + Nouveau » → choisis le prix, active « Collecter les numéros de TVA » et « Taxes automatiques », et mets l'URL de confirmation `https://<ton-domaine>/success`. Un lien par prix (6 au total). Le nom exact des variables est dans `web/.env.example` (géré par Yanis). Limite : le coupon de lancement s'y active à la main (« Autoriser les codes promo » + un code promo lié au coupon).

## 8. Où mettre les variables

Vercel → projet → Settings → Environment Variables. Mets les valeurs **test** dans « Preview » et « Development », et les valeurs **live** dans « Production » uniquement. Variables :
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_LAUNCH_COUPON`, et les 6 `STRIPE_PRICE_*`. Redéploie après chaque changement.

## 9. Tester, puis passer en live

En mode test :
1. Fais le tunnel jusqu'au paywall, choisis Growth mensuel, paie avec la carte `4242 4242 4242 4242` (date future, CVC quelconque).
2. Vérifie dans Stripe : paiement réussi, abonnement créé, coupon −30 % appliqué, TVA calculée ; dans Webhooks : l'événement `checkout.session.completed` est en « 200 ».
3. Refais avec un annuel (pas de coupon attendu) et avec la carte refusée `4000 0000 0000 0002`.
4. Teste un remboursement (garantie 30 jours) : Paiements → le paiement → « Rembourser », puis Abonnement → « Annuler ».

Passage en live :
1. Activer le compte (étape 1.3).
2. Rebascule l'interrupteur en **live** : les produits, prix, coupon et webhook **ne sont pas copiés** du mode test. Recrée-les (ou « Copier en mode live » sur chaque produit), puis récupère les nouveaux `price_…`, `whsec_…` et l'id du coupon.
3. Mets les valeurs live dans Vercel « Production » uniquement, redéploie, et fais un vrai achat de 19 € que tu rembourses ensuite.
4. Clé live : jamais sur ta machine en clair hors de Vercel, jamais dans le dépôt. En cas de fuite : Développeurs → Clés API → « Faire tourner la clé ».

## 10. Récapitulatif de marge par plan

Hypothèses du CFO (`founder/cfo.md`) : LLM ≈ 0,006 € par conversation (modèle bon marché, actions activées ; estimation, fourchette haute ≈ 0,0112 €), inférence du générateur gratuit ≈ 1,50 € par compte payant, frais Stripe ≈ 2,9 % + 0,25 € (carte 2,2 % + Billing 0,7 %), hébergement 0,30 €. Calcul au **quota plein**, donc le pire cas normal ; un client moyen consomme moins.

| Plan (mensuel) | Prix HT | LLM au quota | Gratuit | Stripe | Hébergement | Marge / mois | Marge % | Si LLM cher (0,0112 €) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Starter | 19,00 | 1,80 | 1,50 | 0,80 | 0,30 | **14,60** | **77 %** | 13,04 (69 %) |
| Growth | 49,00 | 9,00 | 1,50 | 1,67 | 0,30 | **36,53** | **75 %** | 28,73 (59 %) |
| Scale | 149,00 | 36,00 | 1,50 | 4,57 | 0,30 | **106,63** | **72 %** | 75,43 (51 %) |
| Growth, offre de lancement (3 mois) | 34,30 | 9,00 | 1,50 | 1,24 | 0,30 | 22,26 | 65 % | |

- Les trois plans dépassent la condition du board (« marge brute > ~70 % au prix d'entrée ») avec le modèle bon marché, grâce au quota Starter ramené à 300 conversations (le CFO demandait ≈ 400 max).
- En annuel (2 mois offerts), la marge baisse d'environ 4 points, mais l'argent arrive d'avance : c'est la trésorerie qui compte au démarrage.
- La seule ligne qui peut casser la marge est le coût LLM : garder le modèle bon marché par défaut, n'utiliser le modèle cher que pour les actions, et **mesurer le coût réel par conversation dès le premier client** (condition du board non remplie à ce jour).
- Les quotas sont des plafonds doux : on prévient le client à 80 % et on propose le plan au-dessus, **jamais de facture surprise** (la plainte n°1 contre Intercom et Tidio).

Pas un conseil fiscal ou juridique : faire relire TVA/OSS et CGV par l'expert-comptable avant le live.
