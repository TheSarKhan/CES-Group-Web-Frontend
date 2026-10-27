import Link from "next/link";
import { getCompanies, getSiteSettings } from "@/content/loaders";
import { FOOTER_NAV } from "@/i18n/nav";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { CookieSettingsButton } from "./Analytics";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export async function Footer({ lang = "az" }: { lang?: Lang }) {
  const [site, companies] = await Promise.all([getSiteSettings(lang), getCompanies(lang)]);
  const t = getUi(lang);
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo lang={lang} />
            <p>{t.footer.tagline}</p>
          </div>
          <nav aria-label={t.footer.companies} className={styles.col}>
            <span className={styles.heading}>{t.footer.companies}</span>
            {companies.map((c) => (
              <Link key={c.id} href={localePath(lang, `/sirketler/${c.id}`)}>
                {c.shortName}
              </Link>
            ))}
          </nav>
          <nav aria-label={t.footer.pages} className={styles.col}>
            <span className={styles.heading}>{t.footer.pages}</span>
            {FOOTER_NAV.map((n) => (
              <Link key={n.href} href={localePath(lang, n.href)}>
                {t.nav[n.key]}
              </Link>
            ))}
          </nav>
          <div className={styles.col}>
            <span className={styles.heading}>{t.footer.contact}</span>
            <span>{site.address}</span>
            <span>{site.email}</span>
            <span>{site.phone}</span>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <div className={styles.social}>
              {site.social.map((s) => (
                <a key={s.label} href={s.href}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} CES Group. {t.footer.rights}</span>
          <div className={styles.legal}>
            <Link href={localePath(lang, "/mexfilik-siyaseti")}>{t.footer.privacy}</Link>
            <Link href={localePath(lang, "/istifade-sertleri")}>{t.footer.terms}</Link>
            <CookieSettingsButton className={styles.cookieBtn} lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}
