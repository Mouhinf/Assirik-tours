import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const row = await p.pageContent.findUnique({
    where: { slug_locale: { slug: "about", locale: "fr" } },
  });
  const blocks = (row?.blocks ?? []) as Array<Record<string, unknown>>;
  console.log(`Block count: ${blocks.length}`);
  for (const b of blocks) {
    console.log(" - type:", b.type);
  }
  await p.$disconnect();
}
main();
