# Feuille de route Mascott (CEO) — mise à jour le 14 octobre 2026

Issue des simulations v2 (contrôle à 6 mois : MRR ≥ 1 500 € et ≥ 4 000 € encaissés). Règle d'or : la prospection paie les premiers mois, le SEO/GEO prépare l'année 2.

```mermaid
gantt
  title Mascott - de l'idée au contrôle des 6 mois
  dateFormat YYYY-MM-DD
  axisFormat %d/%m
  section Marque
  Nom + domaine (mascotte.io ?)            :a1, 2026-10-15, 7d
  Identité, landing + prix 49/149          :a2, after a1, 10d
  section Commercial
  Liste 200 SaaS cibles                    :b1, 2026-10-15, 7d
  Prospection + démos                      :b2, after b1, 30d
  GO / NO-GO : 3 pilotes prépayés          :milestone, m1, 2026-11-20, 0d
  section Produit
  Prototype générateur + installation      :c1, 2026-10-22, 21d
  MVP (snippet SaaS, 2 actions, Stripe)    :c2, after c1, 35d
  Audit sécurité avant lancement           :c3, 2026-12-15, 7d
  section SEO / GEO
  Pages "alternative à…" (2/semaine)       :d1, 2026-10-22, 120d
  Checklist GEO (llms.txt, annuaires, G2)  :d2, 2026-11-01, 30d
  section Lancement
  Lancement + Product Hunt                 :milestone, m2, 2027-01-12, 0d
  Communication LinkedIn (agent activé)    :e1, 2027-01-12, 150d
  Alerte M3 (MRR < 300 €)                  :milestone, m3, 2027-04-12, 0d
  Contrôle M6 (1 500 € MRR)                :milestone, m4, 2027-07-12, 0d
```

## Maintenant (cette semaine)
1. **marketing-brand** : 5 noms candidats + vérification des domaines (mascotte.io, alternatives) et des marques déposées.
2. **sales** : liste des 200 premiers SaaS de 2-20 personnes, avec un angle de message pour chacun.
3. **dev-frontend + marketing-cro** : landing page (promesse, prix, bouton « Réserver un pilote »).
