/**
 * Manual validators for the BlogPost entity.
 *
 * Same approach as the other validators in this project: no Zod dependency,
 * equivalent runtime checks. Swap for Zod schemas later if/when added.
 */

export type BlogLocale = "fr" | "en";

export const BLOG_LOCALES: BlogLocale[] = ["fr", "en"];

export type BlogCategory =
  | "guides-pratiques"
  | "destinations"
  | "visa"
  | "omra"
  | "actualites";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "guides-pratiques",
  "destinations",
  "visa",
  "omra",
  "actualites",
];

export const BLOG_CATEGORY_LABELS_FR: Record<BlogCategory, string> = {
  "guides-pratiques": "Guides pratiques",
  destinations: "Destinations",
  visa: "Visa",
  omra: "Omra & Hajj",
  actualites: "Actualités",
};

export const BLOG_CATEGORY_LABELS_EN: Record<BlogCategory, string> = {
  "guides-pratiques": "Practical guides",
  destinations: "Destinations",
  visa: "Visa",
  omra: "Umrah & Hajj",
  actualites: "News",
};

export type SeoMeta = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string[];
};

export type BlogInput = {
  slug: string;
  locale: BlogLocale;
  title: string;
  excerpt: string;
  body: string;
  coverImageId: string;
  category: BlogCategory | null;
  tags: string[];
  readingTime: number | null;
  seoMeta: SeoMeta;
};

export type ValidationOk<T> = { ok: true; data: T };
export type ValidationFail = { ok: false; error: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationFail;

function str(v: FormDataEntryValue | null): string {
  return v == null ? "" : String(v).trim();
}

function intOpt(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function parseTags(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

function parseKeywords(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);
}

const FORBIDDEN_BODY_PATTERNS = [/<script\b/i, /<iframe\b/i, /javascript:/i, /onerror\s*=/i];

export function parseBlogForm(form: FormData): ValidationResult<BlogInput> {
  const slugRaw = str(form.get("slug"));
  const localeRaw = str(form.get("locale"));
  const title = str(form.get("title"));
  const excerpt = str(form.get("excerpt")).slice(0, 280);
  const body = str(form.get("body"));
  const coverImageId = str(form.get("coverImageId"));
  const categoryRaw = str(form.get("category"));
  const category = (BLOG_CATEGORIES as string[]).includes(categoryRaw)
    ? (categoryRaw as BlogCategory)
    : null;
  const tags = parseTags(form.get("tags"));
  const readingTime = intOpt(form.get("readingTime"));

  const seoTitle = str(form.get("seoTitle")).slice(0, 60);
  const seoDescription = str(form.get("seoDescription")).slice(0, 160);
  const seoOgImage = str(form.get("seoOgImage"));
  const seoKeywords = parseKeywords(form.get("seoKeywords"));

  // Single tag/keyword length check
  for (const tag of tags) {
    if (tag.length > 30) return { ok: false, error: `Tag trop long : "${tag}"` };
  }
  for (const kw of seoKeywords) {
    if (kw.length > 50) return { ok: false, error: `Mot-clé SEO trop long : "${kw}"` };
  }

  if (!title || title.length < 5) {
    return { ok: false, error: "Le titre doit faire au moins 5 caractères." };
  }
  if (title.length > 200) {
    return { ok: false, error: "Le titre ne peut pas dépasser 200 caractères." };
  }
  if (!excerpt || excerpt.length < 20) {
    return { ok: false, error: "L'extrait doit faire au moins 20 caractères." };
  }
  if (excerpt.length > 280) {
    return { ok: false, error: "L'extrait ne peut pas dépasser 280 caractères." };
  }
  if (!body || body.length < 50) {
    return { ok: false, error: "Le contenu doit faire au moins 50 caractères." };
  }
  if (body.length > 50_000) {
    return { ok: false, error: "Le contenu ne peut pas dépasser 50 000 caractères." };
  }
  for (const pat of FORBIDDEN_BODY_PATTERNS) {
    if (pat.test(body)) {
      return { ok: false, error: `Le contenu contient un motif interdit (${pat}).` };
    }
  }
  if (!BLOG_LOCALES.includes(localeRaw as BlogLocale)) {
    return { ok: false, error: "Langue invalide (fr ou en)." };
  }
  if (!coverImageId) {
    return { ok: false, error: "L'image de couverture est requise." };
  }
  if (tags.length > 10) {
    return { ok: false, error: "Maximum 10 tags par article." };
  }
  if (seoTitle.length > 60) {
    return { ok: false, error: "Le titre SEO ne peut pas dépasser 60 caractères." };
  }
  if (seoDescription.length > 160) {
    return { ok: false, error: "La description SEO ne peut pas dépasser 160 caractères." };
  }

  const slug = slugify(slugRaw || title);
  if (slug.length < 3) {
    return { ok: false, error: "Le slug doit faire au moins 3 caractères." };
  }

  return {
    ok: true,
    data: {
      slug,
      locale: localeRaw as BlogLocale,
      title,
      excerpt,
      body,
      coverImageId,
      category,
      tags,
      readingTime,
      seoMeta: {
        title: seoTitle,
        description: seoDescription,
        ogImage: seoOgImage,
        keywords: seoKeywords,
      },
    },
  };
}

/** Derive a reasonable reading time in minutes from the body length. */
export function calculateReadingTime(body: string): number {
  const wordsPerMinute = 220; // French average
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

/** Render a small inline Markdown subset (paragraphs + bullet lists) for the
 * admin split-view preview. Mirrors src/lib/validators/faq.ts. */
export function renderBlogBody(input: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const lines = input.split(/\n/);
  const out: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("# ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2 class="font-display text-2xl font-semibold text-navy mt-6 mb-3">${escape(line.slice(2))}</h2>`);
    } else if (line.startsWith("## ")) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3 class="font-display text-xl font-semibold text-navy mt-5 mb-2">${escape(line.slice(3))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        out.push('<ul class="list-disc pl-6 space-y-1.5 my-3 text-graphite">');
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.slice(2))}</li>`);
    } else if (line === "") {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("");
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p class="text-graphite leading-relaxed my-3">${inlineFormat(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function inlineFormat(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  let html = escape(text);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^\\])\*(?!\s)([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = html.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,
    (_m, label: string, url: string) =>
      `<a href="${url}" class="text-ocean hover:text-navy underline break-words" rel="noopener noreferrer">${label}</a>`,
  );
  return html;
}

export function toBlogData(input: BlogInput) {
  const seoMetaPayload: Record<string, unknown> = {
    title: input.seoMeta.title,
    description: input.seoMeta.description,
    ogImage: input.seoMeta.ogImage,
    keywords: input.seoMeta.keywords,
  };
  return {
    slug: input.slug,
    locale: input.locale,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    coverImageId: input.coverImageId,
    category: input.category,
    tags: input.tags,
    readingTime: input.readingTime ?? calculateReadingTime(input.body),
    seoMeta: seoMetaPayload as never,
  };
}

export type BlogPostSeoMeta = {
  title: string;
  description: string;
  ogImage: string;
  keywords: string[];
};

export function readSeoMeta(value: unknown): BlogPostSeoMeta {
  if (!value || typeof value !== "object") {
    return { title: "", description: "", ogImage: "", keywords: [] };
  }
  const v = value as Record<string, unknown>;
  return {
    title: typeof v.title === "string" ? v.title : "",
    description: typeof v.description === "string" ? v.description : "",
    ogImage: typeof v.ogImage === "string" ? v.ogImage : "",
    keywords: Array.isArray(v.keywords)
      ? (v.keywords as unknown[]).filter((k): k is string => typeof k === "string")
      : [],
  };
}
