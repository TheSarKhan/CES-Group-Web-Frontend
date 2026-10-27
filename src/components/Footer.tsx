import Link from "next/link";
import { companies, footerNav, site } from "@/content/site";
import { CookieSettingsButton } from "./Analytics";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo />
            <p>Memarlıq, tikinti, texnika icarəsi və kənd təsərrüfatı. Dörd şirkət, bir qrup.</p>
          </div>
          <nav aria-label="Şirkətlər" className={styles.col}>
            <span className={styles.heading}>Şirkətlər</span>
            {companies.map((c) => (
              <Link key={c.id} href={`/sirketler/${c.id}`}>
                {c.shortName}
              </Link>
            ))}
          </nav>
          <nav aria-label="Səhifələr" className={styles.col}>
            <span className={styles.heading}>Səhifələr</span>
            {footerNav.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className={styles.col}>
            <span className={styles.heading}>Əlaqə</span>
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
          <span>© {new Date().getFullYear()} CES Group. Bütün hüquqlar qorunur.</span>
          <div className={styles.legal}>
            <Link href="/mexfilik-siyaseti">Məxfilik siyasəti</Link>
            <Link href="/istifade-sertleri">İstifadə şərtləri</Link>
            <CookieSettingsButton className={styles.cookieBtn} />
          </div>
        </div>
      </div>
    </footer>
  );
}
