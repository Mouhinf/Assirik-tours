# Assirik Tours

Site web public + back-office de l'agence de voyages **Assirik Tours**, basée à Dakar (Sénégal).

> Phase 1 MVP : site public + back-office minimum (réservations, offres, 1 rôle admin).
> Phase 2 : RBAC fin, multilingue, paiement en ligne, modules visa & CRM.

---

## Stack

- **Next.js 16** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS v4** (config via `@theme` dans `globals.css`)
- **Prisma + PostgreSQL** (Neon / Supabase)
- **Cloudinary** pour les médias
- **WhatsApp** via lien `wa.me` (zéro infrastructure — voir `src/lib/whatsapp.ts`)

## Démarrer

```bash
# Installer les dépendances
pnpm install

# Copier le fichier d'env et remplir les valeurs
cp .env.example .env.local

# Préparer la base (une fois DATABASE_URL configuré)
pnpm prisma migrate dev

# Lancer le serveur de dev
pnpm dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000).

## Structure

```
prisma/
  schema.prisma          # Schéma DB (Destinations, Offres, Réservations, …)
src/
  app/                   # Routes (App Router)
    layout.tsx           # Layout racine — nav + footer + WhatsApp FAB
    page.tsx             # Accueil
    destinations/        # Catalogue destinations
    offres/              # Offres & forfaits
    billetterie/         # Vols
    services/            # Visa, hôtel, transfert, …
    a-propos/            # Histoire & équipe
    blog/                # Guides pratiques
    galerie/             # Photos
    faq/                 # Questions fréquentes
    contact/             # Coordonnées + formulaire
    espace-client/       # Auth Phase 2
  components/
    brand/               # Logo, wave-divider (motif de marque)
    site/                # nav, footer, whatsApp-fab, page-hero
  lib/
    site-config.ts       # Source unique : nom, contact, navigation
    utils.ts             # cn(), formatFCFA(), helpers
    whatsapp.ts          # Construction des liens wa.me
    prisma.ts            # Client Prisma singleton
```

## Design tokens

Toutes les couleurs de la marque sont définies dans `src/app/globals.css` via `@theme`. Utiliser les classes Tailwind générées :

```tsx
<div className="bg-sand text-navy">
  <h2 className="text-ocean">Titre</h2>
  <span className="bg-sunrise-orange/15 text-sunrise-orange">Tag</span>
</div>
```

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

- **Titres** : Space Grotesk (Google Fonts, libre)
- **Corps** : Plus Jakarta Sans (Google Fonts, libre)

## Commandes utiles

```bash
pnpm dev                 # Serveur de développement
pnpm build               # Build de production
pnpm start               # Lancer le build de prod
pnpm lint                # ESLint

pnpm db:generate         # Générer le client Prisma
pnpm db:migrate          # Créer/ajouter une migration
pnpm db:push             # Push le schema sans migration (dev rapide)
pnpm db:studio           # Inspecter la DB dans le navigateur

pnpm admin:create <email> <password> [name]
                        # Créer le premier admin super-admin
pnpm seed                # Peupler la DB avec des destinations/offres d'exemple
```

## Espace admin (`/admin`)

Back-office accessible après authentification. Un seul rôle Phase 1 (`SUPER_ADMIN`) ; RBAC fin en Phase 2.

- `/admin` — Tableau de bord (KPIs, dernières réservations)
- `/admin/destinations` — CRUD complet des destinations, upload image principale + galerie
- `/admin/offres` — CRUD des offres/forfaits
- `/admin/reservations` — Liste des demandes reçues via le formulaire public
- `/admin/media` — Médiathèque (liste, suppression, copie des public_id Cloudinary)
- `/admin/parametres` — Infos agence + variables d'environnement attendues

Toutes les pages admin passent par `src/proxy.ts` (ex-middleware) qui redirige vers `/admin/login` si la session est absente.

## Roadmap Phase 1 → Phase 2

Voir `TODO` interne (à venir) ou les commentaires "Phase 2" dans chaque page.

## Phase 1 — déjà livré

- [x] Site public (11 sections)
- [x] Auth admin (JWT cookie, bcrypt)
- [x] CRUD destinations avec upload Cloudinary
- [x] CRUD offres avec upload Cloudinary
- [x] Médiathèque (liste + suppression)
- [x] Formulaire de contact → base de données (apparaît dans `/admin/reservations`)
- [x] WhatsApp FAB persistant (`wa.me/221775495314`)
- [x] Schéma Prisma + scripts create-admin + seed

## Phase 2 — à venir

- [ ] Multilingue FR/EN
- [ ] RBAC fin (3 rôles + 2FA super-admin)
- [ ] Paiement Wave / Orange Money / carte
- [ ] Suivi dossiers visa
- [ ] Génération PDF facture / voucher
- [ ] Notifications email automatiques
- [ ] Multiselect destinations ↔ offres
- [ ] UI Customizer (logo, palette, copy)