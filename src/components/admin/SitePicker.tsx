"use client";

import Link from "next/link";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

/** Girişdən sonrakı ilk ekran: istifadəçinin icazəsi olan saytlar kart kimi göstərilir */
export function SitePicker() {
  const { me } = useAdmin();
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Saytlar</h1>
          <p className={styles.sub}>İdarə etmək istədiyiniz saytı seçin.</p>
        </div>
      </div>
      {me.sites.length === 0 ? (
        <p className={styles.muted}>Hələ heç bir sayta giriş icazəniz yoxdur. Super Admin ilə əlaqə saxlayın.</p>
      ) : (
        <div className={styles.cards}>
          {me.sites.map((s) => (
            <Link key={s.code} href={`/sites/${s.code}`} className={styles.card}>
              <span className={styles.cardTitle}>{s.name}</span>
              <span className={styles.cardMeta}>{s.domain}</span>
              <span className={styles.cardTag}>{Object.keys(s.modules).length} modul</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
