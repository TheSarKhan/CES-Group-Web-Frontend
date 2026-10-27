"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

/** Sayt kökü: yan menyu artıq bütün modulları göstərir, ona görə saytın ilk əlçatan bölməsinə yönləndirir (əvvəl statistika) */
export function SiteHome({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const router = useRouter();
  const site = me.sites.find((s) => s.code === code);

  const target = !site
    ? null
    : can("STATISTICS", "VIEW", code)
      ? `/sites/${code}/stats`
      : can("SUBMISSIONS", "VIEW", code)
        ? `/sites/${code}/submissions`
        : code === "equipment"
          ? can("FLEET", "VIEW", code)
            ? `/sites/${code}/m/fleet`
            : null
          : can("PAGES", "VIEW", code) || can("FAQ", "VIEW", code) || can("PROJECTS", "VIEW", code)
            ? `/sites/${code}/content`
            : can("MEDIA", "VIEW", code)
              ? `/sites/${code}/media`
              : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (!site) {
    return (
      <>
        <h1 className={styles.h1}>Sayt tapılmadı</h1>
        <p className={styles.sub}>Bu sayt mövcud deyil və ya ona giriş icazəniz yoxdur.</p>
        <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
          Ümumi icmal
        </Link>
      </>
    );
  }
  return target ? <p className={styles.loading}>Yüklənir…</p> : <p className={styles.muted}>{site.name} üçün sizə açıq modul yoxdur. Super Admin ilə əlaqə saxlayın.</p>;
}
