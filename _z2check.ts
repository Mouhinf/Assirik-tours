import { PrismaClient } from "@prisma/client";
async function main() {
  const p = new PrismaClient();
  const rows = await p.pageContent.findMany({
    where: { slug: { in: ["about", "services"] } },
    select: { slug: true, locale: true, title: true, isActive: true },
  });
  console.log(JSON.stringify(rows, null, 2));
  await p.$disconnect();
}
main();
