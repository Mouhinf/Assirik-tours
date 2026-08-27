# Marketing brief — Assirik Tours

> Synthèse des décisions marketing/positionnement pour le site.
> Source : brief client + atelier de cadrage. Mise à jour : 2026.

## Audience cible

1. **Voyageurs sénégalais et diaspora** — Sénégalais résidant au Sénégal, en Europe (France, Belgique, Italie) ou aux USA qui réservent un vol ou un visa vers le Sénégal, l'Europe, le Maroc, la Turquie, Dubai.
2. **Résidents et expatriés à Dakar** — qui cherchent un séjour balnéaire (Saly, Petite-Côte), une excursion (Lac Rose, Gorée, Lompoul), ou un voyage religieux (Omra Ramadan).
3. **Familles et groupes** — qui veulent un séjour tout compris clé en main.

## Positionnement

> L'agence dakaroise de confiance pour vos voyages — pas un OTA impersonnel.

Concurrents directs : agences de voyage physiques à Dakar (aucune digitale dominante). Concurrents indirects : Booking, Airbnb pour les séjours, mais aucun ne couvre la double expertise **visa + séjour + voyage religieux** pour une clientèle sénégalaise.

## Piliers de contenu

1. **Confiance** — « interlocuteur unique », témoignages, agréments, certifications.
2. **Expertise visa** — contenu détaillé (guides, checklists), différent de toute autre agence.
3. **Sens du lieu** — photographies authentiques du Sénégal, ton éditorial local.
4. **Accessibilité** — WhatsApp direct, présence multilingue à terme (FR / EN).

## Pages prioritaires (entonnoir de conversion)

| Étape | Page | Objectif |
| --- | --- | --- |
| Découverte | `/`, `/destinations` | Établir la confiance, montrer l'étendue de l'offre |
| Considération | `/offres`, `/destinations/[slug]`, `/offres/[slug]` | Comparer, comprendre les détails |
| Décision | `/contact`, `/paiement/[slug]` | Réserver / demander un devis |
| Suivi | `/espace-client/dashboard` | Retrouver voucher, suivre visa |

## SEO

- **Schema.org** : `TravelAgency`, `TouristTrip` par destination, `Article` par article de blog, `BreadcrumbList` sur les pages intérieures.
- **Métadonnées** : title ≤ 60 chars, description 150–160 chars.
- **Sitemap.xml** : généré dynamiquement par `src/app/sitemap.ts`.
- **Robots** : `disallow /admin/`, `disallow /espace-client/`, sitemap référencé.
- **Ciblage mots-clés** (FR, Sénégal) :
  - agence de voyage dakar
  - visa schengen dakar
  - omra sénégal
  - sejour casamance
  - billetterie dakar
  - séjour saly-portudal
  - désert lompoul

## CTA

- **CTA principal** : WhatsApp (lien `wa.me/221775495314` avec message pré-rempli).
- **CTA secondaire** : Formulaire de contact.
- **CTA tertiaire** : Téléphone fixe.

Pourquoi WhatsApp d'abord : c'est le canal dominant au Sénégal et dans la diaspora. Le site doit en faire un point de friction zéro (FAB flottant + liens contextuels depuis chaque page).

## Copywriting

- Ton : professionnel, rassurant, jamais condescendant. Éviter les superlatifs vides (« le meilleur », « unique »).
- Toujours préciser les **chiffres** : 15 ans d'expérience, délai visa France 15–21 jours, etc.
- Mettre en avant la **trajectoire** : Dakar → terrain → client.

## Croisement avec les skills

- **ui-ux-pro-max** : pour le design language et la structure des composants (cf. DESIGN.md).
- **impeccable** : pour auditer chaque livraison et bloquer les tics visuels « AI slop ».
- **marketingskills** : pour la structure SEO on-page et le copywriting des landing pages.
- **open-seo** : pour les audits Lighthouse et structured data.
