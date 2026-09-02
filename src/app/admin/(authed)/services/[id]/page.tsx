import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, "services:write")) {
    return (
      <p className="rounded-lg bg-sunrise-coral/10 border border-sunrise-coral/30 px-4 py-3 text-sm text-sunrise-coral">
        Accès refusé.
      </p>
    );
  }
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p>
          <Link href="/admin/services" className="text-sm font-semibold text-ocean hover:text-navy">
            ← Tous les services
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
          {service.title}
        </h1>
        <p className="mt-1 text-xs text-silver">
          Slug&nbsp;: <code className="font-mono">{service.slug}</code> ·{" "}
          Créé le{" "}
          {new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(service.createdAt)}{" "}
          · Modifié le{" "}
          {new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(service.updatedAt)}
        </p>
      </header>
      <ServiceForm
        mode="edit"
        initial={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          shortDescription: service.shortDescription,
          longDescription: service.longDescription ?? "",
          category: service.category,
          icon: service.icon ?? "",
          imageId: service.imageId ?? "",
          priceFromFCFA: service.priceFromFCFA,
          priceNote: service.priceNote ?? "",
          order: service.order,
          isActive: service.isActive,
          isFeatured: service.isFeatured,
          ctaLabel: service.ctaLabel ?? "",
          ctaHref: service.ctaHref ?? "",
        }}
      />
    </div>
  );
}
