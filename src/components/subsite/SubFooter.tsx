import Link from "next/link";
import { site as group } from "@/content/site";
import { subNav, type SubSite } from "@/content/subsites";
import { tel } from "@/lib/tel";
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
          {subNav.map((n) => (
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
          <a href={`mailto:${group.email}`} className={styles.link}>
            {group.email}
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} {site.name}. Bütün hüquqlar qorunur.</span>
        <a href={groupUrl}>CES Group-un şirkətidir</a>
      </div>
    </footer>
  );
}
