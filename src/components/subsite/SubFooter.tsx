import Link from "next/link";
import { getSiteSettings } from "@/content/loaders";
import { type SubSite } from "@/content/subsites";
import { SUB_NAV } from "@/i18n/nav";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { tel } from "@/lib/tel";
import { CookieSettingsButton } from "../Analytics";
import { SubLogo } from "./SubLogo";
import styles from "./SubFooter.module.css";



export async function SubFooter({ site, groupUrl, siblings, lang = "az", groupLegalLang = "az" }: { site: SubSite; groupUrl: string; siblings: { name: string; url: string }[]; lang?: Lang; groupLegalLang?: Lang }) {
  const group = await getSiteSettings(lang);
  const t = getUi(lang).sub;
  return (
    <footer className={styles.footer} data-header-theme="dark">
      <div className={styles.grid}>
        <div className={styles.cell}>
          <SubLogo name={site.name} lang={lang} />
          <p className={styles.muted}>{site.description}</p>
        </div>
        <nav className={styles.cell} aria-label={t.pages}>
          <span className={styles.heading}>{t.pages}</span>
          {SUB_NAV.filter((n) => n.href !== "/layihelerimiz" || site.projects.length > 0).map((n) => (
            <Link key={n.href} href={localePath(lang, n.href)} className={styles.link}>
              {t.nav[n.key]}
            </Link>
          ))}
        </nav>
        <nav className={styles.cell} aria-label={t.groupCompanies}>
          <span className={styles.heading}>CES Group</span>
          <a href={groupUrl} className={styles.link}>
            cesgroup.az
          </a>
          {siblings.map((s) => (
            <a key={s.url} href={s.url} className={styles.link}>
              {s.name}
            </a>
          ))}
        </nav>
        <div className={styles.cell}>
          <span className={styles.heading}>{t.contact}</span>
          <span className={styles.muted}>{group.address}</span>
          <a href={tel(group.phone)} className={styles.link}>
            {group.phone}
          </a>
          <a href={group.whatsapp} className={styles.link} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={`mailto:${group.email}`} className={styles.link}>
            {group.email}
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} {site.name}. {t.rights}</span>
        <span className={styles.legal}>
          <a href={`${groupUrl}${localePath(groupLegalLang, "/mexfilik-siyaseti")}`}>{getUi(lang).footer.privacy}</a>
          <a href={`${groupUrl}${localePath(groupLegalLang, "/istifade-sertleri")}`}>{getUi(lang).footer.terms}</a>
          <CookieSettingsButton className={styles.cookieBtn} lang={lang} />
          <a href={groupUrl}>{t.groupCompany}</a>
        </span>
      </div>
    </footer>
  );
}
