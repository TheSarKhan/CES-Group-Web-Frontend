"use client";

import Link from "next/link";
import { ACTION_LABELS, MODULE_LABELS } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

/** Hazır olan modulların keçidləri. Qalanları növbəti mərhələlərdə əlavə olunacaq. */
const READY: Record<string, (code: string) => string> = {};

export function SiteHome({ code }: { code: string }) {
  const { me } = useAdmin();
  const site = me.sites.find((s) => s.code === code);

  if (!site) {
    return (
      <>
        <h1 className={styles.h1}>Sayt tapılmadı</h1>
        <p className={styles.sub}>Bu sayt mövcud deyil və ya ona giriş icazəniz yoxdur.</p>
        <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
          Saytlara qayıt
        </Link>
      </>
    );
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>
            {site.domain}. Dillər: {site.locales.toUpperCase().replaceAll(",", ", ")}
          </p>
        </div>
        <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
          Bütün saytlar
        </Link>
      </div>
      <div className={styles.cards}>
        {Object.entries(site.modules).map(([module, actions]) => {
          const href = READY[module]?.(site.code);
          const body = (
            <>
              <span className={styles.cardTitle}>{MODULE_LABELS[module] ?? module}</span>
              <span className={styles.cardMeta}>{actions.map((a) => ACTION_LABELS[a]).join(", ")}</span>
              {!href && <span className={styles.cardTag}>Tezliklə</span>}
            </>
          );
          return href ? (
            <Link key={module} href={href} className={styles.card}>
              {body}
            </Link>
          ) : (
            <div key={module} className={`${styles.card} ${styles.cardMuted}`}>
              {body}
            </div>
          );
        })}
      </div>
    </>
  );
}
