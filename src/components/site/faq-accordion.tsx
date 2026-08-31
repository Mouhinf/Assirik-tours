"use client";

import { useId, useMemo, useState } from "react";
import { FaqCategoryIcon } from "@/components/faq-category-icon";
import {
  FAQ_CATEGORIES,
  renderInlineMarkdown,
  type FaqCategory,
} from "@/lib/validators/faq";

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order: number;
};

type CountLabels = {
  zero: string;
  one: string;
  many: string;
};

function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

function formatCount(count: number, labels: CountLabels) {
  if (count === 0) return labels.zero;
  if (count === 1) return labels.one;
  return labels.many.replace("{count}", String(count));
}

/** Searchable, single-expansion FAQ grouped in the agency's editorial order. */
export function FaqAccordion({
  faqs,
  categoryLabels,
  categoriesLabel,
  allCategoriesLabel,
  searchLabel,
  searchPlaceholder,
  clearFiltersLabel,
  noResultsLabel,
  countLabels,
}: {
  faqs: PublicFaq[];
  categoryLabels: Record<FaqCategory, string>;
  categoriesLabel: string;
  allCategoriesLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearFiltersLabel: string;
  noResultsLabel: string;
  countLabels: CountLabels;
}) {
  const resultsId = useId();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">(
    "all",
  );
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<FaqCategory, number>> = {};
    for (const faq of faqs) {
      counts[faq.category] = (counts[faq.category] ?? 0) + 1;
    }
    return counts;
  }, [faqs]);

  const availableCategories = FAQ_CATEGORIES.filter(
    (category) => (categoryCounts[category] ?? 0) > 0,
  );

  const filtered = useMemo(() => {
    const normalizedQuery = searchable(query.trim());
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        searchable(`${faq.question} ${faq.answer}`).includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, faqs, query]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<FaqCategory, PublicFaq[]>> = {};
    for (const faq of filtered) {
      (groups[faq.category] ??= []).push(faq);
    }
    for (const items of Object.values(groups)) {
      items.sort((a, b) => a.order - b.order);
    }
    return groups;
  }, [filtered]);

  const visibleCategories = FAQ_CATEGORIES.filter(
    (category) => (grouped[category]?.length ?? 0) > 0,
  );

  function chooseCategory(category: FaqCategory | "all") {
    setActiveCategory(category);
    const first =
      category === "all"
        ? faqs[0]
        : faqs.find((faq) => faq.category === category);
    setOpenId(first?.id ?? null);
  }

  function clearFilters() {
    setQuery("");
    chooseCategory("all");
  }

  return (
    <div className="space-y-7">
      <div className="space-y-5 border-y border-sand-deep py-5">
        <label className="block max-w-2xl">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-graphite">
            {searchLabel}
          </span>
          <span className="relative block">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-controls={resultsId}
              className="min-h-12 w-full rounded-lg border border-sand-deep bg-sand-deep/35 py-2.5 pl-11 pr-4 text-base text-navy outline-none transition-colors placeholder:text-silver focus:border-ocean focus:bg-sand"
            />
          </span>
        </label>

        {availableCategories.length > 0 ? (
          <fieldset className="min-w-0">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-graphite">
              {categoriesLabel}
            </legend>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max gap-2">
                <CategoryFilter
                  active={activeCategory === "all"}
                  label={allCategoriesLabel}
                  count={faqs.length}
                  controls={resultsId}
                  onClick={() => chooseCategory("all")}
                />
                {availableCategories.map((category) => (
                  <CategoryFilter
                    key={category}
                    category={category}
                    active={activeCategory === category}
                    label={categoryLabels[category]}
                    count={categoryCounts[category] ?? 0}
                    controls={resultsId}
                    onClick={() => chooseCategory(category)}
                  />
                ))}
              </div>
            </div>
          </fieldset>
        ) : null}
      </div>

      <div className="flex min-h-6 items-center justify-between gap-4">
        <p className="text-sm text-graphite" aria-live="polite" aria-atomic="true">
          {formatCount(filtered.length, countLabels)}
        </p>
        {query || activeCategory !== "all" ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline decoration-ocean/30 underline-offset-4 hover:text-navy"
          >
            {clearFiltersLabel}
          </button>
        ) : null}
      </div>

      <div id={resultsId}>
        {filtered.length === 0 ? (
          <div
            role="status"
            className="rounded-xl border border-sand-deep bg-sand-deep/25 px-6 py-10 text-center"
          >
            <p className="text-graphite">{noResultsLabel}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-ocean underline decoration-ocean/30 underline-offset-4 hover:text-navy"
            >
              {clearFiltersLabel}
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((category) => {
              const items = grouped[category] ?? [];
              return (
                <section
                  key={category}
                  id={`cat-${category}`}
                  aria-labelledby={`cat-${category}-title`}
                  className="scroll-mt-28 space-y-3"
                >
                  <header className="flex items-center gap-3 border-b border-sand-deep pb-3">
                    <FaqCategoryIcon
                      category={category}
                      size={20}
                      className="shrink-0 text-ocean"
                    />
                    <h2
                      id={`cat-${category}-title`}
                      className="font-display text-xl font-semibold text-navy"
                    >
                      {categoryLabels[category]}
                    </h2>
                    <span className="ml-auto text-sm tabular-nums text-silver">
                      {formatCount(items.length, countLabels)}
                    </span>
                  </header>
                  <div className="space-y-2">
                    {items.map((faq) => (
                      <FaqRow
                        key={faq.id}
                        faq={faq}
                        open={openId === faq.id}
                        onToggle={() =>
                          setOpenId(openId === faq.id ? null : faq.id)
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryFilter({
  category,
  active,
  label,
  count,
  controls,
  onClick,
}: {
  category?: FaqCategory;
  active: boolean;
  label: string;
  count: number;
  controls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-controls={controls}
      className={
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors " +
        (active
          ? "border-ocean bg-ocean text-sand"
          : "border-sand-deep bg-sand text-graphite hover:border-sky hover:text-navy")
      }
    >
      {category ? (
        <FaqCategoryIcon category={category} size={16} className="shrink-0" />
      ) : null}
      <span>{label}</span>
      <span
        className={
          "tabular-nums " + (active ? "text-mist" : "text-silver")
        }
      >
        {count}
      </span>
    </button>
  );
}

function FaqRow({
  faq,
  open,
  onToggle,
}: {
  faq: PublicFaq;
  open: boolean;
  onToggle: () => void;
}) {
  const triggerId = `faq-trigger-${faq.id}`;
  const panelId = `faq-panel-${faq.id}`;

  return (
    <article
      className={
        "overflow-hidden rounded-xl border bg-sand transition-colors " +
        (open ? "border-sky" : "border-sand-deep")
      }
    >
      <h3>
        <button
          id={triggerId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-h-14 w-full items-center gap-4 px-4 py-3.5 text-left md:px-5"
        >
          <span className="min-w-0 flex-1 font-display text-base font-semibold leading-snug text-navy md:text-lg">
            {faq.question}
          </span>
          <span
            aria-hidden
            className={
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 motion-reduce:transition-none " +
              (open
                ? "rotate-180 border-ocean bg-ocean text-sand"
                : "border-sand-deep bg-sand-deep/50 text-graphite")
            }
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className="border-t border-sand-deep bg-sand-deep/20 px-4 py-4 md:px-5"
      >
        <div
          className="max-w-[68ch] break-words text-base leading-relaxed text-graphite"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(faq.answer) }}
        />
      </div>
    </article>
  );
}
