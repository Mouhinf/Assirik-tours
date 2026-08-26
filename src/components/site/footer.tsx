import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-mist mt-20">
      <div className="container-narrow py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo className="brightness-0 invert-0" />
          <p className="mt-4 text-sm leading-relaxed text-mist/80 max-w-xs">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">
            Découvrir
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {siteConfig.navigation.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-mist/80 hover:text-sunrise-yellow transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-mist/80">
            <li>
              <a
                href={`tel:${siteConfig.phones.landlineTel}`}
                className="hover:text-sunrise-yellow transition-colors"
              >
                {siteConfig.phones.landline}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${siteConfig.phones.whatsappTel.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sunrise-yellow transition-colors"
              >
                WhatsApp · {siteConfig.phones.whatsapp}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-sunrise-yellow transition-colors break-all"
              >
                {siteConfig.email}
              </a>
            </li>
            <li className="text-mist/70 pt-2 leading-relaxed">
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}, {siteConfig.address.city}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">
            Horaires
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-mist/80">
            <li>{siteConfig.hours.weekdays}</li>
            <li>{siteConfig.hours.saturday}</li>
            <li className="text-mist/60">{siteConfig.hours.sunday}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-narrow py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-mist/60">
          <p>
            © {year} {siteConfig.name}. Tous droits réservés.
          </p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-sand transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-sand transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}