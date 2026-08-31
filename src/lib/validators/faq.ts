/**
 * Manual validators for the FaqItem entity.
 *
 * Same reasoning as src/lib/validators/testimonial.ts: this project does
 * not use zod (yet); we provide equivalent runtime checks so callers get
 * the same shape without an extra dependency. The phase brief §4
 * specified zod — if it gets added later, swap these for schemas.
 */

export type FaqLocale = "fr" | "en";

export type FaqCategory =
  | "general"
  | "payment"
  | "visa"
  | "flight"
  | "omra"
  | "services";

export const FAQ_CATEGORIES: FaqCategory[] = [
  "general",
  "payment",
  "visa",
  "flight",
  "omra",
  "services",
];

export type FaqInput = {
  locale: FaqLocale;
  category: FaqCategory;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
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
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : null;
}

/**
 * Very small inline Markdown subset — **bold**, _italic_, [link](url),
 * unordered lists `-`, line breaks. No tables, no images. Strips
 * everything else to plain text so we don't ship a heavy sanitiser.
 */
export function renderInlineMarkdown(input: string): string {
  // Escape HTML first
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let html = escape(input);

  // Headings (### only — small subset)
  html = html.replace(/^### (.+)$/gm, "<h3 class=\"text-base font-semibold mt-3 mb-1\">$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 class=\"text-lg font-semibold mt-4 mb-2\">$1</h2>");

  // Bold and italic — order matters: bold first.
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^\\])\*(?!\s)([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");

  // Links [label](url) — only http/https or relative
  html = html.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g,
    (_match, label: string, url: string) =>
      `<a href="${url}" class="text-ocean hover:text-navy underline break-words" rel="noopener noreferrer">${label}</a>`,
  );

  // Unordered lists — lines beginning with '- '
  const lines = html.split("\n");
  let out: string[] = [];
  let inList = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      if (!inList) {
        out.push("<ul class=\"list-disc pl-6 space-y-1 my-2\">");
        inList = true;
      }
      out.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      if (trimmed === "") {
        out.push("");
      } else {
        out.push(line);
      }
    }
  }
  if (inList) out.push("</ul>");
  html = out.join("\n");

  // Paragraphs from blank-line separated blocks (last pass — keep simple)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (
        block.startsWith("<h2") ||
        block.startsWith("<h3") ||
        block.startsWith("<ul")
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

export function parseFaqForm(form: FormData): ValidationResult<FaqInput> {
  const localeRaw = str(form.get("locale"));
  const categoryRaw = str(form.get("category"));
  const question = str(form.get("question"));
  const answer = str(form.get("answer"));
  const orderRaw = intOpt(form.get("order")) ?? 0;
  const isActive = form.get("isActive") === "on";

  if (localeRaw !== "fr" && localeRaw !== "en") {
    return { ok: false, error: "Langue invalide (fr ou en)." };
  }
  if (!FAQ_CATEGORIES.includes(categoryRaw as FaqCategory)) {
    return { ok: false, error: "Catégorie invalide." };
  }
  if (question.length < 5 || question.length > 200) {
    return { ok: false, error: "La question doit faire entre 5 et 200 caractères." };
  }
  if (answer.length < 20 || answer.length > 3000) {
    return { ok: false, error: "La réponse doit faire entre 20 et 3000 caractères." };
  }
  if (orderRaw < 0) {
    return { ok: false, error: "L'ordre doit être ≥ 0." };
  }

  return {
    ok: true,
    data: {
      locale: localeRaw as FaqLocale,
      category: categoryRaw as FaqCategory,
      question,
      answer,
      order: orderRaw,
      isActive,
    },
  };
}

export function toFaqData(input: FaqInput) {
  return {
    locale: input.locale,
    category: input.category,
    question: input.question,
    answer: input.answer,
    order: input.order,
    isActive: input.isActive,
  };
}

/** Lightweight category label map (server renderable). */
export const FAQ_CATEGORY_LABELS_FR: Record<FaqCategory, string> = {
  general: "Général",
  payment: "Paiement",
  visa: "Visa",
  flight: "Vols",
  omra: "Omra & Hajj",
  services: "Services",
};

export const FAQ_CATEGORY_LABELS_EN: Record<FaqCategory, string> = {
  general: "General",
  payment: "Payment",
  visa: "Visa",
  flight: "Flights",
  omra: "Umrah & Hajj",
  services: "Services",
};
