/**
 * Seed a real demo destination with an actual Cloudinary-hosted image
 * (from Cloudinary's public demo cloud) so the user can see the admin
 * "destination avec image" flow working without uploading anything.
 *
 * The destination is created with `published: false` so it doesn't show
 * up on the public site, but it WILL appear in /admin/destinations.
 *
 * Run: pnpm tsx scripts/seed-demo-destination.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Public image from Cloudinary demo account — fetched and re-uploaded to
// the Assirik cloud so we control delivery + format transforms.
const DEMO_SOURCE =
  "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg";

async function main() {
  console.log("=== Seeding demo destination ===");

  // 1. Fetch the demo image and re-upload to Assirik cloud
  console.log("→ Downloading demo image…");
  const response = await fetch(DEMO_SOURCE);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`  ${buffer.length} bytes downloaded`);

  console.log("→ Uploading to Assirik cloudinary account…");
  const upload = await new Promise<{
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "assirik-tours/destinations",
        public_id: `demo-goree`,
        overwrite: false,
        unique_filename: false,
      },
      (err, result) => {
        if (err || !result) reject(err ?? new Error("upload failed"));
        else
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
          });
      },
    );
    stream.end(buffer);
  });
  console.log(`  ✓ Uploaded as: ${upload.public_id}`);
  console.log(`    ${upload.width}×${upload.height}`);

  // 2. Create the destination (draft = not visible publicly)
  console.log("→ Creating destination…");
  const dest = await prisma.destination.upsert({
    where: { slug: "demo-goree" },
    create: {
      slug: "demo-goree",
      title: "Démo — Île de Gorée",
      region: "DAKAR",
      summary:
        "Destination de démonstration pour valider le flow admin + Cloudinary. Vous pouvez la supprimer.",
      description: null,
      heroImageId: upload.public_id,
      gallery: [],
      published: false,
      featured: false,
    },
    update: {
      heroImageId: upload.public_id,
    },
  });
  console.log(`  ✓ Destination: ${dest.title}`);
  console.log(`    id      : ${dest.id}`);
  console.log(`    slug    : ${dest.slug}`);
  console.log(`    image   : ${dest.heroImageId}`);

  console.log("\n✅ Démo créée.");
  console.log(`\nVérifier dans l'admin : https://assirik-tours.vercel.app/admin/destinations`);
  console.log(`Ou en local            : http://localhost:3000/admin/destinations`);
  console.log(`\nImage Cloudinary : https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800,c_limit/${upload.public_id}`);

  console.log(`\nPour nettoyer plus tard :`);
  console.log(`  pnpm tsx scripts/test-admin-flow.ts   # vérifie le flow`);
  console.log(`  ou via /admin/destinations            # bouton supprimer (à venir)`);
}

main()
  .catch((e) => {
    console.error("❌ Échec:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());