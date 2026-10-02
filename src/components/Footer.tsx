import Link from "next/link";
import { companies, nav, site } from "@/content/site";
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
              <a key={c.id} href={c.url}>
                {c.name}
              </a>
            ))}
          </nav>
          <nav aria-label="Səhifələr" className={styles.col}>
            <span className={styles.heading}>Səhifələr</span>
            {nav.map((n) => (
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
            <a href="#">Məxfilik siyasəti</a>
            <a href="#">İstifadə şərtləri</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
