# Audit de l'admin — Assirik Tours

> **Date** : 2026-09-01
> **Périmètre** : back-office (`/admin`) et sa couverture des pages publiques.
> **Objectif** : servir de référence pour tous les prompts d'amélioration à venir.
> Chaque écran public amélioré devra correspondre à un écran admin existant ou à créer.

---

## 1. État de l'art au démarrage du prompt 0

Le projet est en **Phase 2 livrée** (cf. `CLAUDE.md`) : site public complet + back-office riche. Les fondations demandées par le prompt 0 (design tokens, skills, RBAC + 2FA) étaient **déjà en place**. Ce document se contente de :

- cartographier ce qui existe ;
- signaler les rares couleurs hex encore « hors-tokens » (et la correction déjà appliquée à `PageHero`) ;
- fournir la matrice **page publique ↔ écran admin** que chaque prompt suivant devra respecter.

Aucune régression visuelle ou fonctionnelle n'a été introduite.

---

## 2. Design tokens (vérification)

| Source | Statut |
| --- | --- |
| `src/app/globals.css` `@theme` | ✅ 11 tokens couleurs + aliases sémantiques (`brand`, `accent`, `bg`, `fg`) |
| `DESIGN.md` | ✅ Documente palette + typo + radius + shadows + motifs + anti-patterns |
| `tailwindcss` v4 (PostCSS) | ✅ auto-génère `bg-navy`, `text-ocean`, etc. depuis `@theme` |
| Utilisation dans l'UI | ✅ aucune occurrence de `bg-slate-X`, `text-gray-X`, etc. (audit `rg` négatif) |

### Couleurs hex résiduelles (et leur justification)

| Fichier | Ligne | Valeur | Justification | Action |
| --- | --- | --- | --- | --- |
| `src/components/brand/logo.tsx` | 24–29 | palette du logo SVG | Le logo doit reproduire fidèlement le fichier `public/logo.svg` ; les hex **correspondent** déjà aux tokens (`#1D6FB8` = ocean, `#12406B` = navy, etc.). | **Aucune** (cohérence design) |
| `src/lib/communications/templates.ts` | 434–456 | couleurs email HTML inline | Les clients mail ne supportent pas les variables CSS ; le template utilise un sous-ensemble des tokens brandés manuellement (`#1f3a5f` ≈ navy, `#fdf6ec` ≈ sand, `#efe6d5` ≈ sand-deep). | Documenter ; envisager extraction vers `src/lib/communications/brand-colors.ts` |
| `src/lib/pdf.ts` | 474–478 | `rgb(...)` PDF | `pdf-lib` exige des `rgb()` ; les commentaires rappellent le hex d'origine (`// #12406B`). | Documenter ; centraliser dans `src/lib/brand-pdf.ts` à terme |
| `src/app/paiement/[slug]/page.tsx` | 56 | `bg-[#635BFF]` | Couleur officielle Stripe (SDK brand) — non négociable. | **Aucune** (couleur de provider) |

### Correction appliquée dans le prompt 0

| Fichier | Avant | Après |
| --- | --- | --- |
| `src/app/globals.css` | (absent) | `--color-sand-warm: #fffaec; /* warm tint of sand, used as a hero glow */` ajouté sous `@theme` |
| `src/components/site/page-hero.tsx:30` | `"linear-gradient(180deg, #F7F5F0 0%, #FFFAEC 70%, #F7F5F0 100%)"` | `"linear-gradient(180deg, var(--color-sand) 0%, var(--color-sand-warm) 70%, var(--color-sand) 100%)"` |

Comportement visuel : **identique** (mêmes hex, juste promus en tokens).

---

## 3. Skills installées (vérification)

| Skill demandée | Statut | Source |
| --- | --- | --- |
| `ui-ux-pro-max` | ✅ présente | `.agents/skills/ui-ux-pro-max/` |
| `impeccable` | ✅ présente | `.agents/skills/impeccable/` |
| `marketingskills` | ✅ présente (30 skills : copywriting, seo-audit, cro, etc.) | `coreyhaines31/marketingskills` via `skills-lock.json` |
| `open-seo` | ✅ présente (competitive-landscape, competitor-analysis, seo-audit) | `every-app/open-seo` via `skills-lock.json` |

> Les skills sont verrouillées par `skills-lock.json` (hashes SHA-256) — toute mise à jour doit passer par le mécanisme prévu. Les commandes `npx skills add ...` du brief n'ont **pas** été ré-exécutées : elles écraseraient les hashes locaux sans bénéfice.

---

## 4. Auth admin — RBAC + 2FA (vérification)

| Élément | Statut | Détail |
| --- | --- | --- |
| Middleware Edge | ✅ | `src/proxy.ts` exporte `proxy()` sur le matcher `/admin/:path*`. Vérifie la présence + signature JWT via `jose`. Redirige vers `/admin/login?redirect=...` sinon. |
| Hashing mot de passe | ✅ | `bcryptjs`, 12 rounds (`src/lib/auth.ts`) |
| Cookie session | ✅ | `ass_admin_session`, httpOnly, `sameSite=lax`, `secure` en prod, durée 7j |
| 2FA TOTP | ✅ | `src/lib/totp.ts` (RFC 6238 maison, sans dépendance) — activable par super-admin via `/admin/parametres` |
| Rôles | ✅ | 3 rôles définis dans `src/lib/rbac.ts` : `SUPER_ADMIN`, `AGENT`, `COMPTABLE` |
| Matrice RBAC | ✅ | 50+ actions, granulaire par surface (`destinations:read`, `payments:refund`, `blog:publish`, etc.) |
| Création du premier admin | ✅ | `pnpm admin:create <email> <password> [name]` (`scripts/create-admin.ts`) |
| `requirePermission()` | ✅ | Helper dans `src/lib/auth-actions.ts` — utilisé par toutes les server actions admin |

Aucun durcissement supplémentaire n'est requis pour ce prompt. Le prompt suivant (« sécurité ») pourra auditer la rotation du `AUTH_SECRET`, la journalisation des échecs de login, le rate-limiting sur `/api/admin/login`, etc.

---

## 5. Modèles de données (Prisma)

Référence : `prisma/schema.prisma`.

| Modèle | Rôle | Champs clés | Écrans admin |
| --- | --- | --- | --- |
| `Destination` | Catalogue destinations (Sénégal + international) | `slug`, `region`, `summary`, `description`, `heroImageId`, `gallery[]`, `published`, `featured` | `admin/destinations` |
| `Offer` | Forfaits / séjours / circuits / Omra / Hajj / Billetterie | `kind`, `priceFCFA`, `durationDays`, `maxGuests`, `startDate`, `endDate`, `destinationId` | `admin/offres` |
| `Client` | Fiche client (CRM) liée aux réservations | `firstName`, `lastName`, `email` (unique), `phone`, `notes` | `admin/clients` |
| `ClientAccount` | Compte self-service (espace client) | email + hash + 2FA (cf. `client-auth.ts`) | (pas d'écran admin dédié — gestion via `admin/clients`) |
| `Reservation` | Demande de devis / réservation | `reference` (auto, `AT-2026-NNNNN`), `status`, `travelers`, `totalFCFA`, `clientId`, `offerId?`, `clientAccountId?` | `admin/reservations` |
| `VisaDossier` | Dossier visa + checklist dynamique | `reference`, `destination`, `type`, `status`, `checklistItems[]`, `documents[]` | `admin/visa` |
| `BlogPost` | Articles FR/EN | `slug`+`locale` unique, `excerpt`, `body`, `coverImageId`, `category`, `tags[]`, `readingTime`, `publishedAt`, `isFeatured`, `seoMeta` | `admin/blog` |
| `PageContent` | CMS bloc-ébased pour pages éditoriales | `slug`+`locale` unique, `title`, `subtitle`, `blocks[]` (JSON structuré), `seoMeta`, `isActive` | `admin/pages` |
| `Testimonial` | Témoignages clients | `author`, `content`, `rating`, `approved`, `featured`, `order` | `admin/temoignages` |
| `FAQItem` | FAQ catégorisée | `category`, `question`, `answer`, `order`, `published` | `admin/faq` |
| `GalleryItem` | Galerie photos | `imageId`, `caption`, `category`, `featured`, `order` | `admin/galerie` |
| `FlightSearch` + `FlightOffer` | Recherche de vols (billetterie, provider mock/kiwi) | IATA codes, dates, `provider`, `rawResults`, `status`, `quoteName/Phone/Message` | `admin/billetterie` |
| `Notification` | File d'attente communications sortantes | `channel` (email/sms/whatsapp), `templateId`, `status`, `providerMessageId`, `errorMessage` | `admin/communications` |
| `NewsletterCampaign` | Campagnes email newsletter | `subjectFr/En`, `bodyFr/En`, `audience`, `status` (draft/scheduled/sent), `scheduledAt`, compteurs | `admin/communications` |
| `AdminUser` | Comptes internes | `email`, `passwordHash`, `role`, `twoFactorEnabled`, `lastLoginAt` | `admin/users` |
| `SiteSettings` | Paramètres globaux de l'agence (singleton) | `whatsappNumber`, `phone`, `email`, `address`, `hours`, `social` | `admin/parametres` |
| `Media` | Index Cloudinary (pour médiathèque) | `publicId`, `folder`, `tags`, `bytes`, `width`, `height` | `admin/media` |
| `AuditLog` | Journal d'audit (200 dernières entrées affichées) | `actorId`, `action`, `entity`, `entityId`, `diff` (JSON), `ip`, `userAgent`, `createdAt` | `admin/audit` |

---

## 6. Pages admin et opérations CRUD

Source : `src/app/admin/(authed)/` + `src/lib/*-actions.ts`.

| Écran admin | Routes | Modèles | Opérations CRUD | Permissions requises |
| --- | --- | --- | --- | --- |
| Tableau de bord | `/admin` | agrégats multi-modèles | (lecture seule : KPIs, dernières réservations, alertes) | `dashboard:view` |
| Réservations | `/admin/reservations` (+ `[id]`) | `Reservation`, `Client` | list, read, update status, update notes, delete | `reservations:read/write/delete` |
| Dossiers visa | `/admin/visa` (+ `[id]`) | `VisaDossier` | list, create, read, update status, update checklist, delete | `visa:read/write/delete` |
| Clients (CRM) | `/admin/clients` | `Client`, `Reservation` | list, search, read, update, export CSV | `clients:read/write/export` |
| Destinations | `/admin/destinations` (+ `[id]`, `new`) | `Destination` | list, create, read, update, toggle published/featured, delete (+ cascade offers + Cloudinary cleanup) | `destinations:read/write/delete` |
| Offres | `/admin/offres` (+ `[id]`, `new`) | `Offer` | list, create, read, update, toggle published, delete (+ cascade Cloudinary) | `offers:read/write/delete` |
| Billetterie | `/admin/billetterie` (+ `[id]`) | `FlightSearch`, `FlightOffer` | list, read, contact client, archive | `flight:read/write` |
| Blog | `/admin/blog` (+ `[id]`, `new`) | `BlogPost` | list, create, read, update, publish/unpublish, feature, delete | `blog:read/write/publish/delete/featured` |
| Pages (CMS) | `/admin/pages` (+ `[id]`) | `PageContent` | list, create, read, update (JSON `blocks`), toggle active, delete, SEO meta | `page:read/write/delete` |
| Médiathèque | `/admin/media` | `Media`, Cloudinary | list, upload, delete | `media:read/write/delete` |
| Galerie | `/admin/galerie` | `GalleryItem` | list, create, read, update, toggle featured, reorder, delete | `gallery:read/write/delete/featured` |
| FAQ | `/admin/faq` | `FAQItem` | list, create, read, update, reorder, delete | `faq:read/write/delete/reorder` |
| Témoignages | `/admin/temoignages` | `Testimonial` | list, create, read, approve, feature, reorder, delete | `testimonials:read/write/approve/delete/reorder` |
| Communications | `/admin/communications` | `Notification`, `NewsletterCampaign` | list (logs), send test, schedule campaign, cancel | `communications:read/write/broadcast` |
| Paiements | `/admin/paiements` | `Reservation`, Stripe intents | list, read, refund | `payments:read`, `payments:refund` |
| Rapports | `/admin/rapports` | agrégats (CA, conversions, par destination) | read only | `reports:read` |
| Audit | `/admin/audit` | `AuditLog` | read only (200 dernières entrées) | `audit:read` |
| Utilisateurs | `/admin/users` | `AdminUser` | list, create, update role, deactivate | `users:read/write` |
| Paramètres | `/admin/parametres` | `SiteSettings`, `AdminUser` (self) | update site settings, update own password, toggle 2FA, mini-CMS identité agence | `settings:read/write` |

Toutes les server actions passent par `requirePermission()` (cf. `src/lib/auth-actions.ts`) — toute requête non autorisée renvoie une `RbacError`.

---

## 7. Matrice page publique ↔ écran admin

But : pour chaque prompt d'amélioration d'une page publique, vérifier que le back-office permet déjà d'éditer son contenu.

| Page publique | Route | Source du contenu | Écran admin correspondant | Couvert ? |
| --- | --- | --- | --- | --- |
| Accueil | `/` | `PageContent` (`home-hero`, `home-featured`) + agrégat offres/destinations en avant | `admin/pages` (slugs `home-*`) | ✅ |
| Destinations (liste) | `/destinations` | Prisma `Destination` filtrées `published=true` | `admin/destinations` | ✅ |
| Destination (détail) | `/destinations/[slug]` | Prisma `Destination` + `Offer[]` liés | `admin/destinations` + `admin/offres` | ✅ |
| Offres (liste) | `/offres` | Prisma `Offer` filtrées `published=true` | `admin/offres` | ✅ |
| Offre (détail) | `/offres/[slug]` | Prisma `Offer` + destination | `admin/offres` | ✅ |
| Billetterie | `/billetterie` | UI de recherche + provider mock/Kiwi + persistance `FlightSearch`/`FlightOffer` | `admin/billetterie` | ✅ |
| Services | `/services` | `PageContent` (slug `services`, locale fr/en) | `admin/pages` | ✅ |
| À propos | `/a-propos` | `PageContent` (slug `about`) | `admin/pages` | ✅ |
| Blog (liste) | `/blog` | Prisma `BlogPost` publiés | `admin/blog` | ✅ |
| Blog (article) | `/blog/[slug]` | Prisma `BlogPost` par slug | `admin/blog` | ✅ |
| FAQ | `/faq` | Prisma `FAQItem` publiés | `admin/faq` | ✅ |
| Galerie | `/galerie` | Prisma `GalleryItem` | `admin/galerie` | ✅ |
| Témoignages | `/temoignages` | Prisma `Testimonial` approuvés + featured | `admin/temoignages` | ✅ |
| Contact (formulaire) | `/contact` | Form → `Reservation` (status `NOUVELLE`) | `admin/reservations` | ✅ |
| Recherche | `/recherche` | Agrège destinations + offres + blog via Prisma full-text | (pas d'écran admin dédié — lecture seule OK) | ✅ par construction |
| Paiement | `/paiement/[slug]` | Stripe Checkout session | `admin/paiements` (lecture/refund) | ✅ |
| Espace client | `/espace-client/*` | `ClientAccount` + ses `Reservation`/`VisaDossier` | (self-service, pas un écran admin) | ✅ |
| CGV | `/cgv` | Contenu statique (juridique obligatoire) | — | ⬜ hors-périmètre |
| Mentions légales | `/mentions-legales` | Contenu statique (juridique obligatoire) | — | ⬜ hors-périmètre |

**Constat** : **toutes les pages publiques dynamiques ont un écran admin dédié**. Aucun contenu public n'est « orphelin » (c.-à-d. en dur dans le code sans back-office). Les pages juridiques sont volontairement statiques.

---

## 8. Recommandations pour les prompts suivants

À titre indicatif (les prompts suivants préciseront leurs cibles) :

1. **Amélioration Accueil** → ne touche pas le code, édite `PageContent` `home-hero` / `home-featured` via `admin/pages`.
2. **Amélioration Blog** → pour des évolutions structurelles (catégories, auteurs, etc.), utiliser `admin/blog`.
3. **Amélioration Galerie / Témoignages / FAQ** → utiliser les écrans existants ; si nouveau champ, ajouter via `schema.prisma` + migration.
4. **Toute nouvelle section** → vérifier qu'elle a un modèle Prisma et un écran admin **avant** d'écrire la page publique.

---

## 9. Ce que le prompt 0 a touché

| Fichier | Changement | Raison |
| --- | --- | --- |
| `src/app/globals.css` | Ajout `--color-sand-warm: #fffaec` sous `@theme` | Promouvoir la couleur hex du hero en token réutilisable |
| `src/components/site/page-hero.tsx` | Gradient inline → `var(--color-sand)` + `var(--color-sand-warm)` | Aligner sur la règle « pas de hex en dur dans les composants » |
| `docs/admin-audit.md` | Création du présent document | Livrable explicite du prompt 0 |

**Aucune autre modification** (UI publique, admin, schéma Prisma, auth, RBAC, skills : inchangés).

---

_Maintenu par l'équipe Assirik Tours — dernière mise à jour : 2026-09-01._
