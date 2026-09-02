import Link from "next/link";
import { BlogPostCard } from "@/components/blog/post-card";
import { whatsappLink } from "@/lib/whatsapp";
import type { BlogPost } from "@/lib/blog";

/**
 * "Visa en priorité" rail — shown near the top of the blog index when:
 *   - no category/tag filter is active (so it never fights the chips), AND
 *   - at least one published visa-category post exists.
 *
 * Rationale: visa is the #1 friction point for Senegalese travellers
 * (confirmed by the Mamadou Sow testimonial quoted on the home page) and
 * the highest-SEO-value category in the editorial calendar. We highlight
 * it as a discrete band rather than inflating it into the featured slot,
 * which keeps the editorial hierarchy honest.
 */
export function BlogVisaRail({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  // Take up to 3 visa posts; the rest is collapsed under a "more" link.
  const visible = posts.slice(0, 3);

  return (
    <section
      aria-labelledby="blog-visa-rail-title"
      className="mb-12 rounded-2xl border border-sand-deep bg-sand/60 p-6 md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-navy">
            <svg
              viewBox="0 0 24 24"
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Visa en priorité
          </p>
          <h2
            id="blog-visa-rail-title"
            className="mt-2 font-display text-2xl md:text-3xl font-semibold text-navy text-balance"
          >
            Guides visa pour voyager sans stress
          </h2>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-graphite leading-relaxed">
            Checklists, délais, pièges fréquents : tout ce qu&rsquo;on a appris en
            déposant des dossiers Schengen, Omra et visas affaires pour nos
            clients depuis 2009.
          </p>
        </div>
        <Link
          href="/blog?category=visa"
          className="inline-flex min-h-11 items-center rounded-full border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-navy"
        >
          Tous les articles visa <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <BlogPostCard
            key={p.id}
            slug={p.slug}
            title={p.title}
            excerpt={p.excerpt}
            category={p.category}
            tags={p.tags}
            publishedAt={p.publishedAt}
            readingTime={p.readingTime}
            coverImageId={p.coverImageId}
          />
        ))}
      </div>

      {/* Soft secondary CTA — keeps WhatsApp (already on the site) available
          in the visa section without hijacking it. */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-sand-deep/60 pt-5">
        <p className="text-sm text-graphite">
          Vous avez un dossier visa en cours&nbsp;?
        </p>
        <Link
          href="/contact?service=assistance-visa&objet=demande-visa"
          className="inline-flex min-h-11 items-center rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-navy"
        >
          Demander un devis visa
        </Link>
        <Link
          href={whatsappLink(
            "Bonjour Assirik Tours, j'aimerais démarrer un dossier visa.",
          )}
          className="inline-flex min-h-11 items-center rounded-full border border-sand-deep bg-sand px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-navy"
        >
          WhatsApp visa
        </Link>
      </div>
    </section>
  );
}
