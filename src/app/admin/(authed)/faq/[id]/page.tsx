import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaqForm } from "@/components/admin/faq-form";
import {
  FAQ_CATEGORY_LABELS_FR,
  FAQ_CATEGORY_LABELS_EN,
} from "@/lib/validators/faq";
import { requirePagePermission } from "@/lib/page-permissions";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("faq:write");
  const { id } = await params;
  const row = await prisma.faqItem.findUnique({ where: { id } });
  if (!row) notFound();

  const labels =
    row.locale === "en" ? FAQ_CATEGORY_LABELS_EN : FAQ_CATEGORY_LABELS_FR;

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-navy">
          Éditer la question FAQ
        </h1>
        <p className="mt-1 text-graphite">
          {labels[row.category as keyof typeof labels]} ·{" "}
          {row.locale.toUpperCase()}
        </p>
      </header>

      <FaqForm
        mode="edit"
        initial={{
          id: row.id,
          locale: row.locale as "fr" | "en",
          category: row.category as
            | "general"
            | "payment"
            | "visa"
            | "flight"
            | "omra"
            | "services",
          question: row.question,
          answer: row.answer,
          order: row.order,
          isActive: row.isActive,
        }}
      />
    </div>
  );
}
