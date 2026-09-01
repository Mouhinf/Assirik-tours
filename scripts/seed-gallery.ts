/**
 * Seed for the GalleryItem table — scans `public/photos/gallery/` and
 * uploads each asset to Cloudinary (preferred) or falls back to a local
 * public path when Cloudinary isn't configured.
 *
 * - Captions are left empty (admin fills them in via the back-office).
 * - `altText` is derived from the filename (slug → phrase).
 * - `order` matches the iteration index.
 * - `isActive` defaults to true so the public grid lights up immediately.
 *
 * Idempotent: re-running upserts on `cloudinaryId`. Local-fallback rows
 * use a sentinel `cloudinaryId` prefixed with `local:` and the path.
 *
 * Usage:
 *   pnpm tsx scripts/seed-gallery.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

const GALLERY_DIR = path.join(process.cwd(), "public", "photos", "gallery");
const LOCAL_PREFIX = "local:";
const DEFAULT_TAGS: Record<string, string[]> = {
  artisanat: ["culture", "artisanat"],
  famille: ["voyageurs", "plage"],
  gastronomie: ["gastronomie", "thieboudienne"],
  musique: ["culture", "musique"],
  soleil: ["coucher-soleil", "nature"],
};

type SeedSummary = {
  filename: string;
  cloudinaryId: string;
  width: number | null;
  height: number | null;
  mode: "cloudinary" | "local";
};

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function deriveAltText(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  const cleaned = base
    .replace(/^[a-z0-9]+-/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!cleaned) return "Photographie de voyage Assirik Tours";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function deriveLocation(filename: string): string | null {
  if (filename.startsWith("artisanat")) return "Sénégal";
  if (filename.startsWith("famille")) return "Saly-Portudal, Sénégal";
  if (filename.startsWith("gastronomie")) return "Sénégal";
  if (filename.startsWith("musique")) return "Sénégal";
  if (filename.startsWith("soleil")) return "Saly-Portudal, Sénégal";
  return null;
}

async function listImages(): Promise<string[]> {
  try {
    const entries = await fs.readdir(GALLERY_DIR);
    return entries
      .filter((name) => /\.(jpe?g|png|webp|avif)$/i.test(name))
      .sort();
  } catch {
    return [];
  }
}

async function uploadOne(filePath: string, baseName: string) {
  return new Promise<{
    public_id: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: "assirik-tours/gallery",
        public_id: `gallery-${baseName}`,
        overwrite: false,
        unique_filename: true,
        resource_type: "image",
      },
      (err, res) => {
        if (err || !res) {
          reject(err ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          public_id: res.public_id,
          width: res.width,
          height: res.height,
        });
      },
    );
  });
}

async function probeLocal(filePath: string): Promise<{ width: number | null; height: number | null }> {
  // We don't depend on sharp — width/height stay null when we can't probe.
  // The admin form lets editors fill them manually if needed.
  return { width: null, height: null };
}

async function main() {
  const files = await listImages();
  if (files.length === 0) {
    console.warn(`No images found under ${GALLERY_DIR}. Skipping.`);
    return;
  }

  const useCloudinary = cloudinaryConfigured();
  if (useCloudinary) {
    configureCloudinary();
    console.log("[seed-gallery] Cloudinary configured — uploading assets.");
  } else {
    console.warn(
      "[seed-gallery] Cloudinary NOT configured — using local-fallback mode.",
    );
    console.warn(
      "  Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env.local for remote uploads.",
    );
  }

  const summaries: SeedSummary[] = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const baseName = filename.replace(/\.[^.]+$/, "");
    const filePath = path.join(GALLERY_DIR, filename);

    let cloudinaryId: string;
    let width: number | null = null;
    let height: number | null = null;
    let mode: "cloudinary" | "local";

    if (useCloudinary) {
      try {
        const up = await uploadOne(filePath, baseName);
        cloudinaryId = up.public_id;
        width = up.width;
        height = up.height;
        mode = "cloudinary";
      } catch (e) {
        console.error(`  ✗ ${filename}: Cloudinary upload failed, falling back to local.`, e);
        cloudinaryId = `${LOCAL_PREFIX}/photos/gallery/${filename}`;
        const probed = await probeLocal(filePath);
        width = probed.width;
        height = probed.height;
        mode = "local";
      }
    } else {
      cloudinaryId = `${LOCAL_PREFIX}/photos/gallery/${filename}`;
      const probed = await probeLocal(filePath);
      width = probed.width;
      height = probed.height;
      mode = "local";
    }

    const altText = deriveAltText(filename);
    const tags = DEFAULT_TAGS[baseName] ?? [];
    const location = deriveLocation(filename);

    const row = await prisma.galleryItem.upsert({
      where: { cloudinaryId },
      create: {
        cloudinaryId,
        altText,
        location,
        tags,
        order: i,
        isActive: true,
        isFeatured: false,
        width,
        height,
      },
      update: {
        altText,
        location,
        tags,
        width,
        height,
      },
    });

    summaries.push({ filename, cloudinaryId, width, height, mode });
    console.log(`  ✓ ${filename} → ${cloudinaryId} (${mode}) #${row.order}`);
  }

  console.log(
    `\n[seed-gallery] Done. ${summaries.length} item(s) upserted.`,
  );
  console.log(
    "[seed-gallery] NOTE: local files in public/photos/gallery/ are NOT deleted — wait for the public page to render them from DB before removing the originals.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
