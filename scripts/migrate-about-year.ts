/**
 * One-shot migration: replace "2008" → "2009" and "depuis 2008" → "depuis 2009"
 * inside the `about` PageContent blocks (FR + EN).
 *
 * This reconciles the founding year with the prompt direction.
 *
 * Run with: `pnpm tsx scripts/migrate-about-year.ts`
 */
import { prisma } from "../src/lib/prisma";

function migrateBlocks(blocks: unknown): { blocks: unknown[]; changed: boolean } {
  let changed = false;
  const arr = Array.isArray(blocks) ? blocks : [];
  const next = arr.map((b) => {
    if (!b || typeof b !== "object") return b;
    const obj = b as Record<string, unknown>;
    const props = (obj.props ?? {}) as Record<string, unknown>;
    let nextProps: Record<string, unknown> = { ...props };
    // Stats items
    if (Array.isArray(nextProps.items)) {
      nextProps = {
        ...nextProps,
        items: (nextProps.items as Array<Record<string, unknown>>).map((it) => {
          if (typeof it.value === "string" && it.value === "2008") {
            changed = true;
            return { ...it, value: "2009" };
          }
          return it;
        }),
      };
    }
    // Hero subtitle (and any other string field)
    for (const k of ["subtitle", "title", "body", "left", "right"]) {
      const v = nextProps[k];
      if (typeof v === "string") {
        const replaced = v
          .replace(/Installés à Dakar depuis 2008/g, "Installés à Dakar depuis 2009")
          .replace(/née à Fass Delorme en 2008/g, "née à Fass Delorme en 2009")
          .replace(/depuis 2008/g, "depuis 2009")
          .replace(/\b2008\b/g, "2009");
        if (replaced !== v) {
          changed = true;
          nextProps[k] = replaced;
        }
      }
    }
    return { ...obj, props: nextProps };
  });
  return { blocks: next, changed };
}

async function main() {
  for (const locale of ["fr", "en"] as const) {
    const row = await prisma.pageContent.findUnique({
      where: { slug_locale: { slug: "about", locale } },
    });
    if (!row) continue;
    const { blocks, changed } = migrateBlocks(row.blocks);
    if (changed) {
      await prisma.pageContent.update({
        where: { id: row.id },
        data: { blocks: blocks as never },
      });
      console.log(`↻ about/${locale} (year migrated to 2009)`);
    } else {
      console.log(`· about/${locale} (no 2008 found — already up to date)`);
    }
  }
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
