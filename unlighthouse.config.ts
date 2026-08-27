import { defineConfig } from "unlighthouse";

export default defineConfig({
  site: "https://assiriktours.vercel.app",
  scanner: {
    device: "desktop",
    skipJavascript: false,
    samples: 3,
    routes: [
      "/",
      "/destinations",
      "/offres",
      "/services",
      "/billetterie",
      "/blog",
      "/galerie",
      "/faq",
      "/a-propos",
      "/contact",
      "/espace-client",
      "/mentions-legales",
      "/cgv",
    ],
  },
  ci: {
    budget: {
      performance: 90,
      accessibility: 90,
      "best-practices": 90,
      seo: 90,
    },
  },
});
