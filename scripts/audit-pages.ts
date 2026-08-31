/**
 * Puppeteer-based SEO & a11y audit for the live site.
 * Lightweight alternative to full Lighthouse — covers the same essentials
 * without Chrome throttling/network simulation.
 */
import puppeteer from "puppeteer";

const PAGES = [
  { path: "/", name: "Accueil" },
  { path: "/destinations", name: "Destinations" },
  { path: "/offres", name: "Offres" },
  { path: "/services", name: "Services" },
  { path: "/contact", name: "Contact" },
  { path: "/mentions-legales", name: "Mentions légales" },
  { path: "/cgv", name: "CGV" },
  { path: "/temoignages", name: "Témoignages" },
  { path: "/faq", name: "FAQ" },
];

async function auditPage(page, url, name) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Wait a bit for hydration
  await new Promise((r) => setTimeout(r, 1500));

  // tsx/esbuild names nested browser callbacks with this helper. Puppeteer
  // serializes the callback without the module prelude, so expose the tiny
  // helper in the page realm before evaluating the audit function.
  await page.evaluate("globalThis.__name = (target, value) => target;");

  const result = await page.evaluate(() => {
    const find = (sel) => document.querySelector(sel);
    const findAll = (sel) => Array.from(document.querySelectorAll(sel));

    // Basic SEO
    const title = document.title;
    const metaDesc = find('meta[name="description"]')?.getAttribute("content") ?? "";
    const canonical = find('link[rel="canonical"]')?.getAttribute("href") ?? "";
    const viewport = find('meta[name="viewport"]')?.getAttribute("content") ?? "";
    const ogTitle = find('meta[property="og:title"]')?.getAttribute("content") ?? "";
    const ogImage = find('meta[property="og:image"]')?.getAttribute("content") ?? "";

    // Headings
    const h1s = findAll("h1");
    const h1Count = h1s.length;
    const h1Text = h1s[0]?.innerText ?? "";

    // Structured data
    const jsonLdScripts = findAll('script[type="application/ld+json"]');
    const jsonLdTypes = jsonLdScripts.map((s) => {
      try {
        const data = JSON.parse(s.textContent ?? "{}");
        return data["@type"] ?? "unknown";
      } catch {
        return "invalid";
      }
    });

    // Images
    const imgs = findAll("img");
    const imgsWithAlt = imgs.filter((i) => i.hasAttribute("alt")).length;
    const imgsWithoutAlt = imgs.length - imgsWithAlt;

    // Accessibility
    const htmlEl = document.documentElement;
    const lang = htmlEl.getAttribute("lang") ?? "";
    const linksWithoutText = findAll("a").filter((a) => {
      const txt = (a.innerText ?? "").trim();
      const aria = a.getAttribute("aria-label") ?? "";
      return !txt && !aria && !a.querySelector("img");
    }).length;

    return {
      title,
      titleLen: title.length,
      metaDesc,
      metaDescLen: metaDesc.length,
      canonical,
      viewport: viewport.includes("width=device-width"),
      ogTitle,
      ogImage,
      h1Count,
      h1Text: h1Text.slice(0, 80),
      jsonLdTypes,
      imgs: imgs.length,
      imgsWithoutAlt,
      lang,
      linksWithoutText,
    };
  });

  const score = computeScore(result);
  return { name, url, ...result, score };
}

function computeScore(r) {
  let s = 100;
  const issues = [];
  if (!r.title) { s -= 20; issues.push("no title"); }
  if (r.titleLen < 30 || r.titleLen > 70) { s -= 5; issues.push(`title len ${r.titleLen}`); }
  if (!r.metaDesc) { s -= 15; issues.push("no meta desc"); }
  if (r.metaDescLen < 70 || r.metaDescLen > 200) { s -= 5; issues.push(`desc len ${r.metaDescLen}`); }
  if (!r.viewport) { s -= 10; issues.push("no viewport meta"); }
  if (r.h1Count !== 1) { s -= 10; issues.push(`${r.h1Count} h1`); }
  if (r.imgsWithoutAlt > 0) { s -= 5 * r.imgsWithoutAlt; issues.push(`${r.imgsWithoutAlt} img no alt`); }
  if (!r.lang) { s -= 5; issues.push("no lang attr"); }
  if (r.linksWithoutText > 0) { s -= 3 * r.linksWithoutText; issues.push(`${r.linksWithoutText} links no text`); }
  if (r.jsonLdTypes.length === 0) { s -= 10; issues.push("no JSON-LD"); }
  return { score: Math.max(0, s), issues };
}

const BASE = process.env.AUDIT_BASE_URL ?? "https://assirik-tours.vercel.app";

async function main() {
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
const results = [];

console.log("=== Puppeteer SEO + a11y audit ===\n");

for (const p of PAGES) {
  const url = `${BASE}${p.path}`;
  try {
    const r = await auditPage(page, url, p.name);
    results.push(r);
    console.log(`✓ ${p.path.padEnd(25)} score=${r.score.score} | title=${r.titleLen}c | h1=${r.h1Count} | jsonld=${r.jsonLdTypes.length}`);
  } catch (e) {
    console.log(`✗ ${p.path.padEnd(25)} FAILED: ${(e as Error).message}`);
    results.push({ name: p.name, url, error: (e as Error).message, score: { score: 0, issues: ["load failed"] } });
  }
}

console.log("\n=== Summary ===");
const totalScore = Math.round(results.reduce((acc, r) => acc + (r.score?.score ?? 0), 0) / results.length);
console.log(`Average score: ${totalScore}/100`);

console.log("\n=== Issues found per page ===");
for (const r of results) {
  if (r.score?.issues?.length) {
    console.log(`${r.url}:`);
    r.score.issues.forEach((i) => console.log(`  - ${i}`));
  }
}

await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
