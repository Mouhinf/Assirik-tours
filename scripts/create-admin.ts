/**
 * One-off script to create the first super-admin.
 *
 * Usage:
 *   pnpm tsx scripts/create-admin.ts <email> <password> [name]
 *
 * Example:
 *   pnpm tsx scripts/create-admin.ts admin@assiriktours.sn 'S3cur3P@ss' 'Moussa Diop'
 *
 * Requires DATABASE_URL in the environment.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [, , emailArg, passwordArg, nameArg] = process.argv;
  if (!emailArg || !passwordArg) {
    console.error(
      "Usage: pnpm tsx scripts/create-admin.ts <email> <password> [name]",
    );
    process.exit(1);
  }

  const email = emailArg.toLowerCase();
  const password = passwordArg;
  const name = nameArg ?? email.split("@")[0];

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Compte déjà existant pour ${email} (rôle: ${existing.role})`);
    process.exit(0);
  }

  if (password.length < 10) {
    console.error("Mot de passe trop court (min 10 caractères).");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✓ Super-admin créé");
  console.log(`  email: ${user.email}`);
  console.log(`  name : ${user.name}`);
  console.log(`  role : ${user.role}`);
  console.log(`  id   : ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());