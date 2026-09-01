import Link from "next/link";
import type { GalleryItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { deliveryUrl } from "@/lib/cloudinary-url";
import { REGION_LABELS_GALLERY } from "@/lib/validators/gallery";
import { AdminToggleGalleryActiveButton } from "./toggle-gallery-active-button";
import { AdminToggleGalleryFeaturedButton } from "./toggle-gallery-featured-button";
import { AdminDeleteGalleryButton } from "./delete-gallery-button";
import { AdminReorderGallery } from "./reorder-gallery";

const PAGE_SIZE = 60;

type SearchParams = {
  q?: string;
  region?: string;
  status?: string;
  featured?: string;
};

export default async function AdminGalleryListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const region = sp.region && sp.region in REGION_LABELS_GALLERY ? sp.region : "";
  const status = sp.status === "active" || sp.status === "inactive" ? sp.status : "";
  const featured = sp.featured === "yes" || sp.featured === "no" ? sp.featured : "";

  const session = await getSession();
  if (!session) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Session expirée.
      </p>
    );
  }
  if (!can(session.role, "gallery:read")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }

  const canWrite = can(session.role, "gallery:write");
  const canDelete = can(session.role, "gallery:delete");
  const canFeatured = can(session.role, "gallery:featured");

  const where = {
    ...(region ? { region: region as GalleryItem["region"] } : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(featured === "yes" ? { isFeatured: true } : {}),
    ...(featured === "no" ? { isFeatured: false } : {}),
    ...(q
      ? {
          OR: [
            { altText: { contains: q, mode: "insensitive" as const } },
            { captionFr: { contains: q, mode: "insensitive" as const } },
            { captionEn: { contains: q, mode: "insensitive" as const } },
            { location: { contains: q, mode: "insensitive" as const } },
            { cloudinaryId: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total, reorderItems] = await Promise.all([
    prisma.galleryItem.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
    }),
    prisma.galleryItem.count({ where }),
    canFeatured
      ? prisma.galleryItem.findMany({
          orderBy: [{ order: "asc" }],
          select: { id: true, altText: true, cloudinaryId: true },
        })
      : Promise.resolve([] as Array<{ id: string; altText: string; cloudinaryId: string }>),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">Galerie</h1>
          <p className="mt-1 text-graphite">
            {items.length} affichées · {total} correspondent aux filtres.
          </p>
        </div>
        {canWrite ? (
          <div className="flex gap-2">
            <Link
              href="/admin/galerie/upload"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sand-deep bg-sand px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-sand-deep"
            >
              Upload en masse
            </Link>
            <Link
              href="/admin/galerie/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-navy"
            >
              <span aria-hidden>+</span> Ajouter une photo
            </Link>
          </div>
        ) : null}
      </header>

      <form className="grid gap-3 rounded-xl border border-sand-deep bg-sand p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Recherche
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Alt, légende, lieu, public_id…"
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Région
          </span>
          <select
            name="region"
            defaultValue={region}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Toutes</option>
            {Object.entries(REGION_LABELS_GALLERY).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            Statut
          </span>
          <select
            name="status"
            defaultValue={status}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Tous</option>
            <option value="active">Actives</option>
            <option value="inactive">Inactives</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-graphite">
            À la une
          </span>
          <select
            name="featured"
            defaultValue={featured}
            className="min-h-11 w-full rounded-md border border-sand-deep bg-sand-deep/40 px-3 py-2 text-base text-navy md:text-sm"
          >
            <option value="">Toutes</option>
            <option value="yes">À la une</option>
            <option value="no">Standard</option>
          </select>
        </label>
        <div className="flex items-end gap-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-sand transition-colors hover:bg-navy"
          >
            Filtrer
          </button>
          <Link
            href="/admin/galerie"
            className="inline-flex min-h-11 items-center rounded-md border border-sand-deep px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-navy"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-sand-deep bg-sand p-10 text-center md:p-12">
          <p className="text-graphite">Aucune photo ne correspond aux filtres.</p>
          {canWrite ? (
            <Link
              href="/admin/galerie/new"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-ocean hover:text-navy"
            >
              Ajouter la première <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>
      ) : (
        <div
          className="masonry gap-3"
          style={{
            columnCount: 2,
            columnGap: "0.75rem",
          }}
        >
          {items.map((item) => {
            const thumbUrl = item.cloudinaryId.startsWith("local:")
              ? item.cloudinaryId.slice("local:".length)
              : deliveryUrl(item.cloudinaryId, { width: 480, crop: "fit" });
            return (
              <div
                key={item.id}
                className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-sand-deep bg-sand-deep/40"
                style={{ display: "inline-block", width: "100%" }}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={item.altText}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                  {/* Hover overlay with quick actions */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-navy/95 via-navy/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center justify-end gap-1.5 p-2">
                      <AdminToggleGalleryActiveButton
                        id={item.id}
                        isActive={item.isActive}
                      />
                      <AdminToggleGalleryFeaturedButton
                        id={item.id}
                        isFeatured={item.isFeatured}
                        disabled={!canFeatured}
                      />
                    </div>
                    <div className="space-y-2 p-3 text-sand">
                      <p className="line-clamp-2 text-xs font-semibold">
                        {item.captionFr || item.altText}
                      </p>
                      {item.location ? (
                        <p className="text-[0.65rem] text-mist/80">{item.location}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Link
                          href={`/admin/galerie/${item.id}`}
                          className="rounded-md bg-white/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider hover:bg-white/25"
                        >
                          Éditer
                        </Link>
                        {canDelete ? (
                          <AdminDeleteGalleryButton
                            id={item.id}
                            name={item.captionFr || item.altText || item.cloudinaryId}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-graphite">
                  <span className="font-mono">#{item.order}</span>
                  {item.region ? (
                    <span className="rounded-full bg-sky/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ocean">
                      {REGION_LABELS_GALLERY[item.region]}
                    </span>
                  ) : null}
                  {item.isFeatured ? (
                    <span className="rounded-full bg-sunrise-orange/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sunrise-amber">
                      ★ Featured
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canFeatured && reorderItems.length > 1 && (
        <details className="group rounded-xl border border-sand-deep bg-sand p-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="font-display font-semibold text-navy">
              Réorganiser l&apos;ordre
            </span>
            <span className="text-sm text-silver">Super-admin uniquement</span>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="ml-auto text-graphite transition-transform group-open:rotate-180 motion-reduce:transition-none"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="p-3 pt-0">
            <AdminReorderGallery
              items={reorderItems.map((it) => ({
                id: it.id,
                label: it.altText || it.cloudinaryId,
              }))}
            />
          </div>
        </details>
      )}

      <style>{`
        @media (min-width: 768px) {
          .masonry { column-count: 3 !important; }
        }
        @media (min-width: 1280px) {
          .masonry { column-count: 4 !important; }
        }
      `}</style>
    </div>
  );
}
