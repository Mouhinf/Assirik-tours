import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { TestimonialSubmitForm } from "@/components/site/testimonial-submit-form";
import { getLocaleCookie } from "@/lib/i18n-actions";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleCookie();
  return {
    title:
      locale === "en"
        ? "Leave a review | Assirik Tours"
        : "Laisser un avis | Assirik Tours",
    description:
      locale === "en"
        ? "Share your travel experience with Assirik Tours. Every review is read by our team before publication."
        : "Partagez votre expérience de voyage avec Assirik Tours. Chaque témoignage est relu par notre équipe avant publication.",
    robots: { index: false, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage({
  searchParams,
}: {
  searchParams: Promise<{ tripSlug?: string; tripKind?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocaleCookie();
  const requestedSlug = sp.tripSlug?.trim() || "";
  const requestedKind = sp.tripKind === "offer" ? "offer" : "destination";

  // Build the list of trip options the user can link their review to.
  // Capped to 80 items to keep the <select> light — the trip filter on
  // /temoignages already supports arbitrary tripSlug values.
  const [destRows, offerRows] = await Promise.all([
    prisma.destination.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { homeOrder: "asc" },
      take: 40,
    }),
    prisma.offer.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: [{ createdAt: "desc" }],
      take: 40,
    }),
  ]);

  const trips = [
    ...destRows.map((d) => ({ slug: d.slug, title: d.title, kind: "destination" as const })),
    ...offerRows.map((o) => ({ slug: o.slug, title: o.title, kind: "offer" as const })),
  ];

  // Pre-fill the "trip" field if the URL asked for a specific one.
  let defaultTripSlug: string | undefined;
  let defaultTripTitle: string | undefined;
  if (requestedSlug) {
    const hit = trips.find((tr) => tr.slug === requestedSlug);
    if (hit && hit.kind === requestedKind) {
      defaultTripSlug = hit.slug;
      defaultTripTitle = hit.title;
    }
  }

  return (
    <>
      <PageHero
        eyebrow={locale === "en" ? "Reviews" : "Témoignages"}
        title={locale === "en" ? "Leave a review" : "Laisser un avis"}
        description={
          locale === "en"
            ? "Tell us how your trip went. Short, honest, useful for the next traveller."
            : "Parlez-nous de votre voyage. Court, honnête, utile au prochain voyageur."
        }
      />

      <section className="container-narrow max-w-3xl pb-20">
        <TestimonialSubmitForm
          locale={locale}
          trips={trips}
          defaultTripSlug={defaultTripSlug}
          defaultTripTitle={defaultTripTitle}
        />
      </section>
    </>
  );
}
