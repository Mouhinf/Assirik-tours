# Assirik Tours

Site web public + back-office de l'agence de voyages **Assirik Tours**, basée à Dakar (Sénégal).

> Phase 2 livrée : site public complet + back-office complet (réservations, offres, visa, CRM, paiements, rapports, audit, RBAC + 2FA, mini-CMS, paiement Stripe, génération PDF, multilingue FR/EN).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS v4** (config via `@theme` dans `globals.css`)
- **Prisma + PostgreSQL** (Neon / Supabase / Vercel Postgres)
- **Cloudinary** pour les médias
- **Auth admin** : JWT cookie (jose) + bcrypt + RBAC (3 rôles) + 2FA TOTP
- **Auth client** : JWT cookie séparé, dashboard `/espace-client`
- **Paiement carte** : Stripe (mode test par défaut)
- **PDF** : `pdf-lib` (voucher de réservation)
- **WhatsApp** : lien `wa.me` (zéro infrastructure — voir `src/lib/whatsapp.ts`)
- **i18n** : sélecteur FR/EN via cookie + dictionnaire JSON

## Démarrer

```bash
pnpm install
cp .env.example .env.local
# Renseignez DATABASE_URL, AUTH_SECRET (openssl rand -hex 32), Cloudinary, optionnellement Stripe

pnpm prisma migrate dev
pnpm tsx scripts/create-admin.ts <email> <password> "<Nom>"
pnpm tsx scripts/seed.ts   # ajoute destinations/offres d'exemple

pnpm dev
```

Site sur http://localhost:3000 · admin sur http://localhost:3000/admin.

## Structure

```
prisma/
  schema.prisma          # Schéma DB (Destinations, Offres, Réservations, VisaDossier,
                         #   Client, AdminUser, ClientAccount, TwoFactorCode,
                         #   AuditLog, SiteSetting, Testimonial)
messages/                # i18n FR + EN
public/
  photos/                # Visuels générés (destinations / blog / équipe / OG)
  favicon.svg, logo.svg, og-default.svg
src/
  app/                   # Routes (App Router)
    page.tsx             # Accueil
    destinations/[slug]/ # Fiches destination (dynamique, photos, offres liées)
    offres/[slug]/       # Fiches offre (prix, réservation)
    recherche/           # Moteur de recherche filtrable
    paiement/[slug]/     # Tunnel de paiement carte (Stripe Checkout)
    blog/[slug]/         # Articles
    galerie/                # Galerie photos
    espace-client/       # Auth + dashboard client + upload pièces visa
    admin/(authed)/      # Back-office (auth JWT + 2FA)
      destinations/      # CRUD
      offres/            # CRUD
      reservations/      # Pipeline
      visa/              # Dossiers visa + checklist
      clients/           # CRM + export CSV
      paiements/         # Tableau encaissé / en attente
      rapports/          # CA, conversions, pipeline
      communications/    # Templates newsletters/SMS/WhatsApp
      users/             # Comptes admin + RBAC
      audit/             # Audit log
      media/             # Médiathèque Cloudinary
      parametres/        # Mon compte + 2FA + mini-CMS agence
    api/paiement/checkout/  # Endpoint Stripe Checkout
  components/
    brand/               # Logo SVG, wave-divider
    site/                # nav, footer, page-hero, search, whatsapp-fab, lang-switcher
    admin/               # formulaires admin, 2FA, settings, visa
    blog/                # cartes article
    client/              # header / login / uploader visa
  lib/
    site-config.ts       # Constantes agence (nom, contact, navigation)
    site-settings.ts     # Settings éditables en base (whatsapp, adresse…)
    whatsapp.ts          # Liens wa.me pré-remplis
    cloudinary.ts        # Upload + delete (server-only)
    cloudinary-url.ts    # Builder d'URL client-safe
    photos.ts            # Résolveur Cloudinary ↔ fallback local
    regions.ts           # Labels FR / EN des régions et types d'offre
    i18n.ts              # Dictionnaire + fonction `t(key, locale)`
    auth.ts / auth-actions.ts / client-auth.ts / client-auth-actions.ts
    rbac.ts              # Matrice SUPER_ADMIN / AGENT / COMPTABLE
    audit.ts             # Helper de log d'audit
    totp.ts              # TOTP maison (RFC 6238) sans dépendance
    pdf.ts               # Génération voucher via pdf-lib
    stripe.ts            # Singleton Stripe (server-only)
    blog.ts              # Source de données des articles (Phase 1 : TS)
```

## Design tokens

Voir `DESIGN.md` pour la liste. Toutes les couleurs et rayons sont déclarés dans `src/app/globals.css` sous `@theme`.

| Token | Hex | Usage |
| --- | --- | --- |
| `navy` | `#12406B` | Texte, headers |
| `ocean` | `#1D6FB8` | CTA, liens, marque |
| `sky` | `#4FA8DA` | Accents, hover |
| `sunrise-orange` | `#F5A73B` | Accents chaleureux |
| `sunrise-yellow` | `#FFCE54` | Highlights |
| `sand` | `#F7F5F0` | Fond principal |
| `anthracite` | `#20242B` | Texte corps |

## Polices

- **Titres** : Sora (Google Fonts, libre) — géométrique confiante.
- **Corps** : Manrope (Google Fonts, libre) — lisible sans être Inter.

## Commandes utiles

```bash
pnpm dev                 # Serveur de développement
pnpm build               # Build de production (Prisma generate en prebuild)
pnpm start               # Lancer le build de prod
pnpm lint                # ESLint
pnpm tsc --noEmit        # Type-check

pnpm db:generate         # Générer le client Prisma
pnpm db:migrate          # Créer / ajouter une migration
pnpm db:push             # Push le schema sans migration (dev rapide)
pnpm db:studio           # Inspecter la DB dans le navigateur

pnpm admin:create <email> <password> [name]
                        # Créer un admin super-admin (CLI)
pnpm seed                # Peupler la DB avec des destinations/offres d'exemple

bash scripts/audit-unlighthouse.sh
                        # Audit Lighthouse via Unlighthouse contre le site prod
```

## Espace admin (`/admin`)

Authentification JWT + cookie httpOnly. Trois rôles :
- **SUPER_ADMIN** — toutes les permissions.
- **AGENT** — réservations, destinations, offres, visa, clients.
- **COMPTABLE** — surfaces financières en lecture.

2FA TOTP disponible pour les super-admins (Google Authenticator / 1Password / Authy).

Pages admin :
- `/admin` — Tableau de bord
- `/admin/reservations` — Pipeline
- `/admin/visa` — Dossiers visa + checklist dynamique
- `/admin/clients` — CRM + recherche + export CSV
- `/admin/paiements` — Vue d'ensemble financière
- `/admin/destinations` — CRUD
- `/admin/offres` — CRUD
- `/admin/media` — Médiathèque Cloudinary
- `/admin/communications` — Templates email/SMS/WhatsApp
- `/admin/rapports` — CA, conversions, CA par destination
- `/admin/audit` — Audit log (200 dernières entrées)
- `/admin/users` — Comptes internes + matrice RBAC
- `/admin/parametres` — Mon compte + 2FA + mini-CMS agence

## Espace client (`/espace-client`)

Authentification séparée (cookie `ass_client_session`). Pages :
- `/espace-client` — Connexion
- `/espace-client/dashboard` — Liste réservations + dossiers visa
- `/espace-client/visa/[id]` — Upload des pièces du dossier visa
- `/espace-client/reservations/[id]/voucher.pdf` — Téléchargement du voucher PDF

## Intégrations actives

| Service | Statut | Config |
| --- | --- | --- |
| WhatsApp | ✅ actif (lien `wa.me`) | `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Cloudinary | ✅ actif | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Stripe (carte) | ✅ en mode test | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Wave | ⏳ Phase 3 | À câbler |
| Orange Money | ⏳ Phase 3 | À câbler |

## CI

- `.github/workflows/ci.yml` — lint + type-check + build + Prisma push (PostgreSQL de service).
- `.github/workflows/unlighthouse.yml` — audit Lighthouse après chaque build réussi.

## Documentation

- `DESIGN.md` — Design system (tokens, typo, motifs, anti-patterns).
- `docs/GUIDE-OPERATEUR.md` — Manuel pour l'équipe Assirik (utilisation quotidienne du back-office).
- `docs/MARKETING-BRIEF.md` — Positionnement, audience, SEO.
- `docs/SKILLS.md` — Quand invoquer ui-ux-pro-max, impeccable, etc.
