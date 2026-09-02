import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const all = await p.blogPost.findMany({
    select: {
      slug: true,
      locale: true,
      title: true,
      category: true,
      tags: true,
      publishedAt: true,
      isFeatured: true,
      excerpt: true,
    },
    orderBy: { publishedAt: "desc" },
  });
  console.log(`Total: ${all.length}`);
  for (const r of all) {
    console.log(`  [${r.locale}] ${r.publishedAt ? "✓" : "·"} ${r.category ?? "—"} /${r.slug} — ${r.title}`);
    console.log(`     excerpt: ${r.excerpt.slice(0, 100)}...`);
  }
  // Counts per category
  const counts: Record<string, number> = {};
  for (const r of all) {
    if (!r.publishedAt) continue;
    counts[r.category ?? "—"] = (counts[r.category ?? "—"] ?? 0) + 1;
  }
  console.log("Published counts per category:", counts);
  await p.$disconnect();
}
main();
