/**
 * Validator for the `blocks` JSON column on PageContent.
 *
 * Each block has its own shape; this module returns a typed array of
 * `Block` (imported from `@/lib/page-blocks`) or a clear error message.
 */
import {
  type BlockType,
  type BlockHeroProps,
  type BlockTextProps,
  type BlockTwoColumnProps,
  type BlockStatsProps,
  type BlockTeamGridProps,
  type BlockServiceListProps,
  type BlockImageProps,
  type BlockCtaBannerProps,
  type BlockRichTextProps,
} from "@/lib/page-blocks";

export type ValidationOk<T> = { ok: true; data: T };
export type ValidationFail = { ok: false; error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationFail;

const ALLOWED_TYPES: BlockType[] = [
  "hero",
  "text",
  "two-column",
  "stats",
  "team-grid",
  "service-list",
  "image",
  "cta-banner",
  "rich-text",
];

function fail<T>(error: string): ValidationResult<T> {
  return { ok: false, error };
}

function str(v: unknown, max = 1000): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
}

function checkCta(v: unknown): { label: string; href: string } | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const label = typeof o.label === "string" ? o.label : "";
  const href = typeof o.href === "string" ? o.href : "";
  if (!label || !href) return null;
  if (label.length > 80 || href.length > 500) return null;
  return { label, href };
}

function checkStats(v: unknown): BlockStatsProps["items"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => {
      if (!it || typeof it !== "object") return null;
      const o = it as Record<string, unknown>;
      const value = typeof o.value === "string" ? o.value.slice(0, 40) : "";
      const label = typeof o.label === "string" ? o.label.slice(0, 80) : "";
      if (!value || !label) return null;
      return { value, label };
    })
    .filter((x): x is { value: string; label: string } => x !== null)
    .slice(0, 12);
}

function checkTeam(v: unknown): BlockTeamGridProps["members"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const o = m as Record<string, unknown>;
      const name = typeof o.name === "string" ? o.name.slice(0, 80) : "";
      const role = typeof o.role === "string" ? o.role.slice(0, 80) : "";
      if (!name) return null;
      const photoId =
        typeof o.photoId === "string" && o.photoId.length > 0
          ? o.photoId.slice(0, 200)
          : undefined;
      const bio =
        typeof o.bio === "string" && o.bio.length > 0
          ? o.bio.slice(0, 500)
          : undefined;
      return { name, role, photoId, bio };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 24);
}

function checkServiceList(v: unknown): BlockServiceListProps["services"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const o = s as Record<string, unknown>;
      const title = typeof o.title === "string" ? o.title.slice(0, 80) : "";
      const description =
        typeof o.description === "string" ? o.description.slice(0, 500) : "";
      if (!title || !description) return null;
      const icon =
        typeof o.icon === "string" && o.icon.length > 0
          ? o.icon.slice(0, 40)
          : undefined;
      const priceFrom =
        typeof o.priceFrom === "number" &&
        Number.isFinite(o.priceFrom) &&
        o.priceFrom > 0
          ? o.priceFrom
          : undefined;
      return { title, description, icon, priceFrom };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .slice(0, 20);
}

function checkBlock(input: unknown): ValidationResult<unknown> {
  if (!input || typeof input !== "object") return fail("Bloc invalide.");
  const obj = input as Record<string, unknown>;
  const type = typeof obj.type === "string" ? obj.type : "";
  const props = obj.props;

  if (!ALLOWED_TYPES.includes(type as BlockType)) {
    return fail(`Type de bloc inconnu : "${type}".`);
  }
  if (!props || typeof props !== "object") {
    return fail(`Le bloc "${type}" doit avoir des propriétés.`);
  }
  const p = props as Record<string, unknown>;

  switch (type as BlockType) {
    case "hero": {
      const title = str(p.title, 120);
      if (title.length < 1) return fail("Le titre du hero est requis.");
      const subtitle = typeof p.subtitle === "string" ? p.subtitle.slice(0, 280) : undefined;
      const imageId =
        typeof p.imageId === "string" && p.imageId.length > 0
          ? p.imageId.slice(0, 200)
          : undefined;
      const cta = checkCta(p.cta) ?? undefined;
      const result: BlockHeroProps = { title, subtitle, imageId, cta };
      return { ok: true, data: { type, props: result } };
    }
    case "text": {
      const body = typeof p.body === "string" ? p.body.slice(0, 10_000) : "";
      if (body.length < 1) return fail("Le bloc texte est vide.");
      const align =
        p.align === "center" ? "center" : "left";
      const result: BlockTextProps = { body, align };
      return { ok: true, data: { type, props: result } };
    }
    case "two-column": {
      const left = typeof p.left === "string" ? p.left.slice(0, 5_000) : "";
      const right = typeof p.right === "string" ? p.right.slice(0, 5_000) : "";
      if (!left && !right) return fail("Le bloc deux-colonnes est vide.");
      const result: BlockTwoColumnProps = { left, right };
      return { ok: true, data: { type, props: result } };
    }
    case "stats": {
      const items = checkStats(p.items);
      if (items.length === 0) return fail("Ajoutez au moins un indicateur.");
      const result: BlockStatsProps = { items };
      return { ok: true, data: { type, props: result } };
    }
    case "team-grid": {
      const members = checkTeam(p.members);
      if (members.length === 0) return fail("Ajoutez au moins un membre.");
      const result: BlockTeamGridProps = { members };
      return { ok: true, data: { type, props: result } };
    }
    case "service-list": {
      const services = checkServiceList(p.services);
      if (services.length === 0) return fail("Ajoutez au moins un service.");
      const result: BlockServiceListProps = { services };
      return { ok: true, data: { type, props: result } };
    }
    case "image": {
      const imageId = typeof p.imageId === "string" ? p.imageId.slice(0, 200) : "";
      const alt = typeof p.alt === "string" ? p.alt.slice(0, 200) : "";
      if (!imageId) return fail("L'imageId est requis.");
      if (alt.length < 3) return fail("Le texte alternatif (≥ 3 caractères) est requis.");
      const caption =
        typeof p.caption === "string" && p.caption.length > 0
          ? p.caption.slice(0, 280)
          : undefined;
      const result: BlockImageProps = { imageId, alt, caption };
      return { ok: true, data: { type, props: result } };
    }
    case "cta-banner": {
      const title = str(p.title, 120);
      if (title.length < 1) return fail("Le titre du bandeau est requis.");
      const description =
        typeof p.description === "string" && p.description.length > 0
          ? p.description.slice(0, 280)
          : undefined;
      const cta = checkCta(p.cta);
      if (!cta) return fail("Le CTA doit avoir un label et un href.");
      const result: BlockCtaBannerProps = { title, description, cta };
      return { ok: true, data: { type, props: result } };
    }
    case "rich-text": {
      const html = typeof p.html === "string" ? p.html.slice(0, 20_000) : "";
      if (html.length < 1) return fail("Le contenu HTML est vide.");
      // Reject obviously dangerous tags (sanitisation is also done at render).
      if (/<script\b|<iframe\b|javascript:/i.test(html)) {
        return fail("Le HTML contient un motif interdit.");
      }
      const result: BlockRichTextProps = { html };
      return { ok: true, data: { type, props: result } };
    }
  }
}

export function parseBlocks(input: unknown): ValidationResult<unknown[]> {
  if (!Array.isArray(input)) {
    return fail("Les blocs doivent être un tableau.");
  }
  if (input.length > 50) return fail("Trop de blocs (max 50).");
  const out: unknown[] = [];
  for (let i = 0; i < input.length; i++) {
    const r = checkBlock(input[i]);
    if (!r.ok) return fail(`Bloc #${i + 1} (${(input[i] as { type?: string })?.type ?? "?"}) : ${r.error}`);
    out.push(r.data);
  }
  return { ok: true, data: out };
}

export type SeoMetaInput = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string[];
};

export function parseSeoMeta(input: unknown): SeoMetaInput {
  const empty: SeoMetaInput = { title: "", description: "", ogImage: "", keywords: [] };
  if (!input || typeof input !== "object") return empty;
  const o = input as Record<string, unknown>;
  return {
    title: typeof o.title === "string" ? o.title.slice(0, 60) : "",
    description: typeof o.description === "string" ? o.description.slice(0, 160) : "",
    ogImage: typeof o.ogImage === "string" ? o.ogImage.slice(0, 200) : "",
    keywords: Array.isArray(o.keywords)
      ? (o.keywords as unknown[])
          .filter((k): k is string => typeof k === "string")
          .map((k) => k.slice(0, 50))
          .slice(0, 15)
      : [],
  };
}

export function readSeoMeta(value: unknown): SeoMetaInput {
  return parseSeoMeta(value);
}
