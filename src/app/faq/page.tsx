import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { FaqAccordion, type PublicFaq } from "@/components/site/faq-accordion";
import { getLocaleCookie } from "@/lib/i18n-actions";
import { t } from "@/lib/i18n";
import { FAQ_CATEGORIES, type FaqCategory } from "@/lib/validators/faq";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleCookie();
  const title = t("faq.page_title", locale);
  const description = t("faq.page_description", locale);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  const locale = await getLocaleCookie();

  const faqs = await prisma.faqItem.findMany({
    where: { isActive: true, locale },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const publicFaqs: PublicFaq[] = faqs
    .map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category as FaqCategory,
      order: f.order,
    }))
    .sort(
      (a, b) =>
        FAQ_CATEGORIES.indexOf(a.category) -
          FAQ_CATEGORIES.indexOf(b.category) || a.order - b.order,
    );

  const categoryLabels = Object.fromEntries(
    FAQ_CATEGORIES.map((category) => [
      category,
      t(`faq.categories.${category}`, locale),
    ]),
  ) as Record<FaqCategory, string>;

  const faqsLd = buildFaqJsonLd(
    publicFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  );

  return (
    <>
      {faqsLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqsLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <PageHero
        eyebrow={t("faq.hero_eyebrow", locale)}
        title={t("faq.hero_title", locale)}
        description={t("faq.hero_description", locale)}
      />

      <section id="all" className="container-narrow py-10 md:py-14">
        <FaqAccordion
          faqs={publicFaqs}
          categoryLabels={categoryLabels}
          categoriesLabel={t("faq.categories_label", locale)}
          allCategoriesLabel={t("faq.all_categories", locale)}
          searchLabel={t("faq.search_label", locale)}
          searchPlaceholder={t("faq.search_placeholder", locale)}
          clearFiltersLabel={t("faq.clear_filters", locale)}
          noResultsLabel={t("faq.no_results", locale)}
          countLabels={{
            zero: t("faq.items_count_zero", locale),
            one: t("faq.items_count_one", locale),
            many: t("faq.items_count_many", locale),
          }}
        />

        <aside className="mt-12 overflow-hidden rounded-xl bg-navy p-7 text-sand md:p-10">
          <h2 className="font-display text-2xl font-semibold text-sand">
            {t("faq.contact_cta", locale)}
          </h2>
          <p className="mt-3 max-w-2xl text-mist/90 leading-relaxed">
            {t("faq.contact_description", locale)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-sunrise-orange px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-sunrise-yellow"
            >
              {t("faq.contact_button", locale)}
            </Link>
            <a
              href={`https://wa.me/221775495314?text=${encodeURIComponent(
                t("faq.whatsapp_message", locale),
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-mist/30 bg-sand px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-sunrise-yellow"
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 11.5a8 8 0 01-11.8 7L4 20l1.4-4A8 8 0 1120 11.5z" />
                <path d="M9 8.5c.4 3 2 4.5 5 5" />
              </svg>
              {t("faq.whatsapp_button", locale)}
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
