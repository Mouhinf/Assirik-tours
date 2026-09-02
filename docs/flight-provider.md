# Billetterie aérienne — interface provider

Ce document décrit comment le module `/billetterie` est branché sur un
fournisseur de vols externe, et comment **brancher un nouveau provider**
(Duffel, Amadeus, Kiwi, etc.) sans toucher au front ni à la base.

## Vue d'ensemble

```
┌─────────────────────┐    action server     ┌──────────────────────────┐
│ /billetterie (front)│ ───────────────────► │ flight-actions.ts        │
│  FlightSearchEngine │ ◄─────────────────── │  searchFlightsAction()   │
└─────────────────────┘    FlightOffer[]     └──────────────┬───────────┘
                                                            │
                                                            ▼
                                            ┌───────────────────────────┐
                                            │ flight-providers/index.ts │
                                            │  getFlightProvider()      │
                                            └──────────────┬────────────┘
                                                           │  factory
                                            ┌──────────────┴────────────┐
                                            ▼                           ▼
                                  ┌─────────────────┐         ┌──────────────────┐
                                  │ mockProvider    │         │ kiwiProvider     │
                                  │ (offline)       │         │ (Tequila API)    │
                                  └─────────────────┘         └──────────────────┘
```

Le front ne connaît **jamais** le provider actif : il appelle
`searchFlightsAction()` et consomme une liste typée d'offres.
Pour basculer de provider, on modifie `FLIGHT_PROVIDER` dans
`.env.local` et on redémarre l'app — **aucune ligne de UI ne change**.

## Variables d'environnement

| Var                | Rôle                                                        |
| ------------------ | ----------------------------------------------------------- |
| `FLIGHT_PROVIDER`  | Provider actif : `mock` \| `kiwi`. Vide → auto (1er configuré). |
| `KIWI_API_KEY`     | Requis pour activer `kiwi`. Sans clé → fallback automatique vers `mock`. |

Pour ajouter un nouveau provider (ex. `duffel`), créer ses propres
vars (ex. `DUFFEL_API_TOKEN`) et l'ajouter à la matrice de la section
*Ajouter un provider* ci-dessous.

## Précedence de sélection

Le factory `getFlightProvider()` applique ces règles dans l'ordre :

1. `FLIGHT_PROVIDER=kiwi` **et** `KIWI_API_KEY` non vide → **kiwi**.
2. `FLIGHT_PROVIDER` non défini **et** `KIWI_API_KEY` non vide → **kiwi**
   (auto-détection).
3. Sinon → **mock** (toujours disponible, offline, données déterministes).

Le mock est **toujours** le fallback par défaut. Même avec un autre provider
configuré, vous pouvez forcer le mode démo en mettant `FLIGHT_PROVIDER=mock`.

## Interface `FlightProvider`

Fichier : `src/lib/flight-providers/provider.ts`

```ts
import type {
  FlightOfferResult,
  FlightProviderInfo,
  FlightSearchInput,
} from "./types";

export interface FlightProvider {
  readonly name: string;          // ex. "mock", "kiwi", "duffel"
  searchFlights(
    input: FlightSearchInput,
  ): Promise<FlightOfferResult[]>;
  info(): FlightProviderInfo;     // { name, configured }
}
```

### Types partagés (`src/lib/flight-providers/types.ts`)

| Type                  | Champs principaux                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `CabinClass`          | `"ECONOMY" \| "PREMIUM_ECONOMY" \| "BUSINESS" \| "FIRST"`                                          |
| `FlightSearchInput`   | `origin`, `destination` (IATA 3 lettres), `departDate: Date`, `returnDate?: Date`, `passengers: 1-9`, `cabinClass`, `currency?` (défaut `"XOF"`) |
| `FlightSegment`       | `carrier`, `flightNumber?`, `departAt` / `arriveAt` ISO, `origin` / `destination`, `durationMinutes` |
| `FlightLeg`           | `segments[]`, `totalDurationMinutes`, `stopCount`                                                 |
| `FlightOfferResult`   | `providerOfferId`, `provider`, `priceAmount`, `priceCurrency`, `outbound`, `inbound?`, `passengers`, `cabinClass`, `expiresAt`, `bookingUrl?` |

**Important** : chaque provider doit mapper sa propre réponse vers
`FlightOfferResult`. Aucune fuite de structure interne ne doit remonter
au front — sinon le couplage devient impossible à défaire.

## Stockage en base

Toute recherche est persistée dans `FlightSearch` + `FlightOffer`
(un par offre retournée). Le `provider` est stocké sur les deux tables
pour permettre l'audit a posteriori.

Les devis reçus via le formulaire public créent **deux écritures** :

1. La `FlightSearch` est mise à jour : `status: "QUOTE_REQUESTED"`,
   `quoteName`, `quotePhone`, `quoteMessage`, `userEmail`.
2. Une **`Reservation`** est créée dans le module principal avec :
   - `tags: ["Billetterie", "flight:<searchId>"]` — permet de filtrer
     depuis `/admin/reservations?tag=Billetterie`.
   - `clientId` via upsert (même logique que les devis d'offres).
   - `totalFCFA: 0` — l'agent finalise après devis manuel.
   - `notes` : bloc préformaté (trajet, dates, passagers, classe, offre).
   - `status: "NOUVELLE"`.

Un audit entry (`flight.quote.request`) et une notification
(`notifyAgency({ templateId: "flight.quote_requested" })`) sont aussi
déclenchés. Toujours best-effort, jamais bloquants.

## Côté admin : `/admin/billetterie`

L'écran `/admin/billetterie` regroupe désormais :

1. **Provider actif** (lecture seule) — provider sélectionné, statut
   mock/réel, variable d'environnement utilisée, et indicateur visuel
   pour chaque provider *configuré* vs *non configuré*.
2. **Notes internes** (éditable) — bloc texte + email/téléphone
   d'override, persistés dans la table singleton `FlightConfig`.
3. **Derniers devis Billetterie** — 5 dernières réservations taguées
   `Billetterie`, avec lien vers `/admin/reservations?tag=Billetterie`.
4. **Recherches récentes** — table existante, conservée telle quelle.

`getProviderStatus()` (dans `flight-providers/index.ts`) est la source
de vérité pour le panneau provider. Étendre `PROVIDER_CANDIDATES` rend
automatiquement le nouveau provider visible côté admin.

## Ajouter un provider (exemple : Duffel)

1. **Créer l'implémentation** dans
   `src/lib/flight-providers/duffel.ts` :

   ```ts
   import "server-only";
   import type { FlightProvider } from "./provider";
   import type {
     FlightOfferResult,
     FlightSearchInput,
     FlightProviderInfo,
   } from "./types";

   export const duffelProvider: FlightProvider = {
     name: "duffel",
     info(): FlightProviderInfo {
       return {
         name: "duffel",
         configured: Boolean(process.env.DUFFEL_API_TOKEN),
       };
     },
     async searchFlights(input: FlightSearchInput): Promise<FlightOfferResult[]> {
       // 1. POST https://api.duffel.com/air/offer_requests avec search input
       // 2. Mapper chaque Duffel offer vers FlightOfferResult
       // 3. Respecter expiresAt (Duffel donne ~30 min) et bookingUrl
       // 4. Throw une Error explicite si quota dépassé / token invalide
       //    (le front affichera le message tel quel).
     },
   };
   ```

2. **Enregistrer le provider dans le factory** :

   ```ts
   // src/lib/flight-providers/index.ts
   import { duffelProvider } from "./duffel";

   export function getFlightProvider(): FlightProvider {
     if (_provider) return _provider;
     const explicit = (process.env.FLIGHT_PROVIDER ?? "").toLowerCase();
     const hasKiwi = Boolean(process.env.KIWI_API_KEY);
     const hasDuffel = Boolean(process.env.DUFFEL_API_TOKEN);

     if ((explicit === "duffel" || (!explicit && hasDuffel)) && hasDuffel) {
       _provider = duffelProvider;
     } else if ((explicit === "kiwi" || (!explicit && hasKiwi)) && hasKiwi) {
       _provider = kiwiProvider;
     } else {
       _provider = mockProvider;
     }
     return _provider;
   }
   ```

3. **Étendre `PROVIDER_CANDIDATES`** pour que le panneau admin le
   détecte automatiquement :

   ```ts
   {
     key: "duffel",
     name: "Duffel",
     envVars: ["DUFFEL_API_TOKEN"],
     description: "API Duffel — vols NDC. Nécessite un compte Duffel + facturation séparée.",
   },
   ```

4. **Définir l'env var** dans `.env.local` :

   ```bash
   FLIGHT_PROVIDER=duffel
   DUFFEL_API_TOKEN=duffel_test_…
   ```

5. **Tester** : relancer `pnpm dev`, ouvrir `/billetterie`, vérifier
   que la bannière mock disparaît et qu'une recherche réelle remonte
   des offres.

## Tests de fumée

Avant de considérer un provider comme "prêt prod" :

- [ ] Une recherche aller-simple remonte ≥ 1 offre cohérente.
- [ ] Une recherche aller-retour avec escale remonte 1+ offre à 2 segments.
- [ ] Une recherche invalide (aéroport inconnu) renvoie une erreur
      lisible côté UI.
- [ ] `expiresAt` est bien dans le futur — sinon l'offre ne doit jamais
      être présentée.
- [ ] Le mapping `priceCurrency` couvre `XOF`, `EUR`, `USD` au minimum.
- [ ] Un timeout API affiche un message clair (pas de stack trace).
- [ ] Aucun secret (`API_TOKEN`, `API_KEY`) n'apparaît dans
      `getProviderStatus()` ou dans les logs navigateur.

## Checklist pour ne pas régresser le front

Quand vous touchez à `flight-providers/` :

- Ne jamais casser le type `FlightOfferResult` (front s'appuie dessus).
- Garder le mock comme **fallback toujours disponible** — c'est ce qui
  permet à la page `/billetterie` de fonctionner en preview/démo sans
  credentials.
- Préserver le `provider` stocké sur `FlightSearch` et `FlightOffer`
  pour les rapports historiques (ne pas écraser).
- Si une nouvelle classe est supportée par le provider, l'ajouter à
  `CABIN_CLASSES` dans `flight-actions.ts` (parseCabinClass).
- Tout champ exposé au front doit être sérialisable en JSON (les
  offres sont passées au composant client — pas de Date non stringifiée).
