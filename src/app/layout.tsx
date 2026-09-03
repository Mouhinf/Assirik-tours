import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { getLocaleCookie } from "@/lib/i18n-actions";
import "./globals.css";

const display = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://assiriktours.sn",
  ),
  title: {
    default: "Assirik Tours — Agence de voyages à Dakar",
    template: "%s · Assirik Tours",
  },
  description:
    "Vols, visas et séjours sur mesure depuis Dakar. Sénégal, Omra, Maroc, Turquie, Dubaï, Europe. Une équipe de confiance au service de vos projets de voyage.",
  keywords: [
    "agence de voyage Dakar",
    "billetterie Sénégal",
    "visa Schengen Dakar",
    "Omra Sénégal",
    "séjour Casamance",
    "Lac Rose excursion",
    "île de Gorée",
  ],
  authors: [{ name: "Assirik Tours" }],
  creator: "Assirik Tours",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "/",
    siteName: "Assirik Tours",
    title: "Assirik Tours — Agence de voyages à Dakar",
    description:
      "Vols, visas et séjours sur mesure depuis Dakar. Sénégal, Omra, Maroc, Turquie, Dubaï, Europe.",
    images: [
      {
        url: "/photos/og/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Assirik Tours — Agence de voyages à Dakar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assirik Tours — Agence de voyages à Dakar",
    description:
      "Vols, visas et séjours sur mesure depuis Dakar. Sénégal, Omra, Maroc, Turquie, Dubaï, Europe.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
  themeColor: "#12406B",
  applicationName: "Assirik Tours",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocaleCookie();
  return (
    <html
      lang={locale === "en" ? "en" : "fr-SN"}
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand text-anthracite font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SiteNav locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
      </body>
    </html>
  );
}
