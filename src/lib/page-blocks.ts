/**
 * Block types for editorial pages (about, services, etc.).
 *
 * The `blocks` JSON column on `PageContent` stores an array of these.
 * Validation lives in `src/lib/validators/page-blocks.ts` (no Zod — same
 * approach as the rest of the project). The renderer is in
 * `src/components/site/page-block-renderer.tsx`.
 */

export type BlockHeroProps = {
  title: string;
  subtitle?: string;
  imageId?: string;
  cta?: { label: string; href: string };
};

export type BlockTextProps = {
  body: string; // markdown subset
  align?: "left" | "center";
};

export type BlockTwoColumnProps = {
  left: string; // markdown
  right: string; // markdown
};

export type BlockStatsProps = {
  items: Array<{ value: string; label: string }>;
};

export type BlockTeamGridProps = {
  members: Array<{
    name: string;
    role: string;
    photoId?: string;
    bio?: string;
  }>;
};

export type BlockServiceListProps = {
  services: Array<{
    title: string;
    description: string;
    icon?: string;
    priceFrom?: number;
  }>;
};

export type BlockImageProps = {
  imageId: string;
  alt: string;
  caption?: string;
};

export type BlockCtaBannerProps = {
  title: string;
  description?: string;
  cta: { label: string; href: string };
};

export type BlockRichTextProps = {
  html: string;
};

export type Block =
  | { type: "hero"; props: BlockHeroProps }
  | { type: "text"; props: BlockTextProps }
  | { type: "two-column"; props: BlockTwoColumnProps }
  | { type: "stats"; props: BlockStatsProps }
  | { type: "team-grid"; props: BlockTeamGridProps }
  | { type: "service-list"; props: BlockServiceListProps }
  | { type: "image"; props: BlockImageProps }
  | { type: "cta-banner"; props: BlockCtaBannerProps }
  | { type: "rich-text"; props: BlockRichTextProps };

export const BLOCK_TYPES = [
  "hero",
  "text",
  "two-column",
  "stats",
  "team-grid",
  "service-list",
  "image",
  "cta-banner",
  "rich-text",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_LABELS_FR: Record<BlockType, string> = {
  hero: "Hero",
  text: "Texte",
  "two-column": "Deux colonnes",
  stats: "Statistiques",
  "team-grid": "Équipe",
  "service-list": "Liste de services",
  image: "Image",
  "cta-banner": "Bandeau CTA",
  "rich-text": "Texte riche",
};

export const BLOCK_LABELS_EN: Record<BlockType, string> = {
  hero: "Hero",
  text: "Text",
  "two-column": "Two columns",
  stats: "Stats",
  "team-grid": "Team grid",
  "service-list": "Service list",
  image: "Image",
  "cta-banner": "CTA banner",
  "rich-text": "Rich text",
};

export function emptyBlock(type: BlockType): Block {
  switch (type) {
    case "hero":
      return { type, props: { title: "Nouveau hero", subtitle: "" } };
    case "text":
      return { type, props: { body: "Contenu à rédiger.", align: "left" } };
    case "two-column":
      return { type, props: { left: "Colonne gauche", right: "Colonne droite" } };
    case "stats":
      return { type, props: { items: [{ value: "0", label: "Indicateur" }] } };
    case "team-grid":
      return {
        type,
        props: {
          members: [
            { name: "Membre 1", role: "Rôle", bio: "" },
          ],
        },
      };
    case "service-list":
      return {
        type,
        props: {
          services: [
            { title: "Service 1", description: "Description", icon: "ticket" },
          ],
        },
      };
    case "image":
      return { type, props: { imageId: "", alt: "Image", caption: "" } };
    case "cta-banner":
      return {
        type,
        props: {
          title: "Prêt à partir ?",
          description: "",
          cta: { label: "Nous contacter", href: "/contact" },
        },
      };
    case "rich-text":
      return { type, props: { html: "<p>Contenu riche…</p>" } };
  }
}
