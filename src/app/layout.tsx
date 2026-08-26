import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
  ],
  authors: [{ name: "Assirik Tours" }],
  creator: "Assirik Tours",
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: "/",
    siteName: "Assirik Tours",
    title: "Assirik Tours — Agence de voyages à Dakar",
    description:
      "Vols, visas et séjours sur mesure depuis Dakar. Sénégal, Omra, Maroc, Turquie, Dubaï, Europe.",
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
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand text-anthracite font-body">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFab />
      </body>
    </html>
  );
}