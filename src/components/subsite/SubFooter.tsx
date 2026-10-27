import Link from "next/link";
import { site as group } from "@/content/site";
import { navFor, type SubSite } from "@/content/subsites";
import { tel } from "@/lib/tel";
import { CookieSettingsButton } from "../Analytics";
import { SubLogo } from "./SubLogo";
import styles from "./SubFooter.module.css";



export function SubFooter({ site, groupUrl, siblings }: { site: SubSite; groupUrl: string; siblings: { name: string; url: string }[] }) {
  return (
    <footer className={styles.footer} data-header-theme="dark">
      <div className={styles.grid}>
        <div className={styles.cell}>
          <SubLogo name={site.name} />
          <p className={styles.muted}>{site.description}</p>
        </div>
        <nav className={styles.cell} aria-label="Səhifələr">
          <span className={styles.heading}>Səhifələr</span>
          {navFor(site).map((n) => (
            <Link key={n.href} href={n.href} className={styles.link}>
              {n.label}
            </Link>
          ))}
        </nav>
        <nav className={styles.cell} aria-label="CES Group şirkətləri">
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
          <span className={styles.heading}>Əlaqə</span>
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
        <span>© {new Date().getFullYear()} {site.name}. Bütün hüquqlar qorunur.</span>
        <span className={styles.legal}>
          <a href={`${groupUrl}/mexfilik-siyaseti`}>Məxfilik siyasəti</a>
          <a href={`${groupUrl}/istifade-sertleri`}>İstifadə şərtləri</a>
          <CookieSettingsButton className={styles.cookieBtn} />
          <a href={groupUrl}>CES Group-un şirkətidir</a>
        </span>
      </div>
    </footer>
  );
}
