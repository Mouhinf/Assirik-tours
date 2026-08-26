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
pnpm prisma studio       # Inspecter la DB
pnpm prisma migrate dev  # Appliquer les migrations
```

## Roadmap Phase 1 → Phase 2

Voir `TODO` interne (à venir) ou les commentaires "Phase 2" dans chaque page.