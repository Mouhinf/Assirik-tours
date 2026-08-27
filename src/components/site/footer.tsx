import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const s = await getSiteSettings();

  return (
    <footer className="bg-navy text-mist mt-20">
      <div className="container-narrow py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo tone="dark" />
          <p className="mt-4 text-sm leading-relaxed text-mist/85 max-w-xs">
            {siteConfig.description}
          </p>
          <p className="mt-3 text-xs text-mist/60">{s.tagline}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">Découvrir</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {siteConfig.navigation.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-mist/85 hover:text-sunrise-yellow transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-mist/85">
            <li>
              <a href={`tel:${s.landline}`} className="hover:text-sunrise-yellow transition-colors">
                {s.landline}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${s.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-sunrise-yellow transition-colors"
              >
                WhatsApp · {s.whatsappNumber}
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="hover:text-sunrise-yellow transition-colors break-all">
                {s.email}
              </a>
            </li>
            <li className="text-mist/75 pt-2 leading-relaxed">
              {s.addressLine1}
              <br />
              {s.addressLine2}, {s.city}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-sand uppercase tracking-wider">Horaires</h3>
          <ul className="mt-4 space-y-2 text-sm text-mist/85">
            <li>{s.hoursWeekdays}</li>
            <li>{s.hoursSaturday}</li>
            <li className="text-mist/70">{s.hoursSunday}</li>
          </ul>
          <div className="mt-5 flex gap-3 text-mist/70">
            {s.socialFacebook ? <a href={s.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-sunrise-yellow"><FB /></a> : null}
            {s.socialInstagram ? <a href={s.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-sunrise-yellow"><IG /></a> : null}
            {s.socialLinkedin ? <a href={s.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-sunrise-yellow"><LI /></a> : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-narrow py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-mist/70">
          <p>© {year} {siteConfig.name}. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-sand transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-sand transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FB() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"/></svg>;
}
function IG() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>;
}
function LI() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.3 18.3v-7H6v7h2.3zM7.2 10a1.3 1.3 0 100-2.7 1.3 1.3 0 000 2.7zM18.3 18.3v-3.9c0-2.1-1.1-3-2.6-3-1.2 0-1.8.7-2.1 1.1v-.9h-2.3c0 .6 0 7 0 7h2.3v-3.9c0-.2 0-.4.1-.6.2-.4.6-.9 1.3-.9.9 0 1.3.7 1.3 1.7v3.7h2z"/></svg>;
}
