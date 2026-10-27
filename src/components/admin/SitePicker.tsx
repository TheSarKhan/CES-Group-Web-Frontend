"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { siteIcon } from "./Sidebar";
import { PageHeader, useCrumbs } from "./ui";

/** Statistika icazəsi olmayan istifadəçi üçün açılış ekranı: icazəsi olan saytlar kart kimi göstərilir */
export function SitePicker() {
  const { me } = useAdmin();
  useCrumbs([{ label: "Sayt seçin" }]);
  return (
    <>
      <PageHeader title="Sayt seçin" sub="İdarə etmək istədiyiniz saytı seçin." />
      {me.sites.length === 0 ? (
        <p className={styles.muted}>Hələ heç bir sayta giriş icazəniz yoxdur. Super Admin ilə əlaqə saxlayın.</p>
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {me.sites.map((s) => (
            <Link key={s.code} href={`/sites/${s.code}`} className={`${styles.card} ${styles.siteCard}`}>
              <span className={styles.siteCardIcon}>{siteIcon(s.code, 84)}</span>
              <span className={styles.cardTitle}>{s.name}</span>
              <span className={styles.cardMeta}>{s.domain}</span>
              <span className={styles.siteCardFoot}>
                Saytı idarə et <ArrowRight size={20} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
