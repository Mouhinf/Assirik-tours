# Assirik Tours — Design system

> Source of truth for the visual language. Updated as the project evolves.
> When editing UI, run `node .agents/skills/impeccable/scripts/context.mjs --target <file>` to load the matching surface brief and design floor.

## Brand identity

- **Name**: Assirik Tours (agency in Dakar, Senegal)
- **Tagline**: Agence de voyages à Dakar
- **Voice**: reassuring, concrete, locally grounded. No "AI-slop" exuberance.
- **Inspiration**: Senegalese warmth (sunrise) + institutional trust (ocean + navy).

### Logo
Inline SVG, two variants (light / dark). Three layered marks:
1. Rising sun (yellow → orange radial gradient).
2. Stair-stepped skyline (alternating navy / ocean blue).
3. Stylised wave (ocean blue → sky blue gradient).

See `src/components/brand/logo.tsx` and `public/logo.svg` (fallback).

## Color tokens

All tokens live as Tailwind v4 theme variables in `src/app/globals.css` under `@theme`.

| Token | Hex | Use |
| --- | --- | --- |
| `navy` | `#12406B` | Primary text, headlines, footer background |
| `ocean` | `#1D6FB8` | CTA, links, brand accent |
| `sky` | `#4FA8DA` | Hover, secondary accent |
| `mist` | `#D9ECF7` | Surfaces, borders on dark |
| `sunrise-orange` | `#F5A73B` | Warm accent, promos, eyebrows |
| `sunrise-yellow` | `#FFCE54` | Highlights, hover states |
| `sunrise-coral` | `#D4651F` | Destructive warnings, sunrise coral |
| `sand` | `#F7F5F0` | Default page background (Senegalese sand) |
| `sand-deep` | `#EDE8DE` | Card borders, hover surfaces |
| `anthracite` | `#20242B` | Body text default |
| `graphite` | `#4A5159` | Secondary text |
| `silver` | `#6B7280` | Disabled / placeholder |

Always reference tokens through Tailwind classes (`bg-sand`, `text-navy`, etc.), never raw hex in components.

## Typography

| Family | Role | Source |
| --- | --- | --- |
| **Sora** | Display / headings | Google Fonts, weight 400–800 |
| **Manrope** | Body / UI | Google Fonts, weight 300–800 |

Both are loaded via `next/font` in `src/app/layout.tsx` and exposed as CSS variables.

Heading weight default: 600. Letter spacing on display: `-0.02em`. Use `text-balance` for hero / large headlines, `text-pretty` for body.

## Spacing & radius

- Page gutter: `container-narrow` (max 72rem, 1.25rem → 2rem padding).
- Card radius: `--radius-xl` (1.5rem) for hero blocks, `--radius-lg` (1rem) for standard cards.
- Button radius: `rounded-full` for primary CTAs, `rounded-lg` for secondary.

## Shadows

Three pre-defined shadows:
- `--shadow-soft` — rest state for cards.
- `--shadow-lift` — hover / elevation.
- `--shadow-glow` — focus / interactive surface.

## Motifs

- **Wave divider** (`src/components/brand/wave-divider.tsx`) — used between sections, never as clipart.
- **Sunburst** — use sparingly in hero accents.

## Anti-patterns (don't do this)

- ❌ Generic purple-blue gradient hero.
- ❌ Card-in-card stacks (`rounded-2xl shadow-lg p-6` everywhere).
- ❌ Icon-on-every-heading (always a small pictogram above the title).
- ❌ Inter / Plus Jakarta Sans / Space Grotesk for headings (overused = generic).
- ❌ AI-generated stock photography (we use the agency's curated shots under `/public/photos/`).
- ❌ Emojis as icons (use inline SVG — Lucide-style 1.8-stroke).
- ❌ `text-slate-500` / `text-zinc-700` raw Tailwind colors — use our semantic tokens.

## Surface briefs

Each public page has a short brief in `.impeccable/` (see `node .agents/skills/impeccable/scripts/context.mjs --target src/app/<page>.tsx`). When a brief is missing for a page, treat the page as a new surface and load `reference/new-work.md` before designing.

## Accessibility baseline

- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text. Verified for the palette (`graphite`, `silver` bumped from default Tailwind to maintain AA).
- Visible focus rings (`:focus-visible` outlined in navy).
- All interactive elements ≥ 44×44 px.
- `prefers-reduced-motion` respected in transitions.
- One `<h1>` per page; semantic landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`).
