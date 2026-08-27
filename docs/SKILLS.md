# Skills installées & mode d'emploi

> Le projet exploite plusieurs skills (UI/UX, marketing, SEO). Cette doc explique quand et comment les invoquer.

## Inventaire

| Skill | Path | Usage |
| --- | --- | --- |
| `impeccable` | `.agents/skills/impeccable/` | Garde-fou anti-AI-slop. À invoquer à chaque livraison d'écran. |
| `ui-ux-pro-max` | `.agents/skills/ui-ux-pro-max/` | Design intelligence, choix de palettes / typo / composants. |
| `marketingskills` | via `skills-lock.json` | Copywriting, SEO on-page, CRO. |
| `open-seo` | via `skills-lock.json` | Audit Lighthouse / Unlighthouse, structured data. |
| `imagegen` | `/home/mouhammad/.codex/skills/.system/imagegen/` | Génération d'images bitmap (cf. `mmx image generate`). |

## Quand invoquer quoi

### Avant d'ajouter une nouvelle page

1. `node .agents/skills/impeccable/scripts/context.mjs --target src/app/<page>.tsx`
   → charge `PRODUCT.md`, `DESIGN.md`, le brief de surface correspondant et la référence native (web / ios / android).
2. `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<page type> <intent>" --domain <...>`
   → cherche les patterns adaptés.

### Avant de modifier une page existante

1. Charger le brief de surface existant (s'il y en a un dans `.impeccable/`).
2. Charger `reference/craft-floor.md` (`impeccable`) juste avant d'éditer.

### Avant une release

1. `/impeccable audit` ou `node .agents/skills/impeccable/scripts/audit.mjs src/app/<page>.tsx`
2. `npx unlighthouse-ci --site https://assiriktours.vercel.app` (scripté dans `scripts/audit-unlighthouse.sh`)
3. Corriger tout score < 90 sur les 4 axes (Performance / Accessibilité / SEO / Best Practices).

## Génération d'assets

- Pour les visuels destinations/blog : utiliser `mmx image generate` (CLI MiniMax) plutôt que les banques d'images génériques.
- Toujours générer en 1536×1024 (3:2) pour les destinations, 1280×720 (16:9) pour le blog.
- Stocker sous `/public/photos/<categorie>/<slug>.jpg`. Ne pas committer de PNG lourds.

## Hook Codex

Le hook post-édition dans `.codex/hooks.json` invoque automatiquement `node .agents/skills/impeccable/scripts/hook.mjs` après chaque modification de fichier UI. Les violations « AI slop » apparaissent dans le terminal.
