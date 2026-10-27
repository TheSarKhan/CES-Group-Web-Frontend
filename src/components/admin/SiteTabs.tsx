"use client";

import Link from "next/link";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

/** Sayt daxilində bölmələr arası keçid; yalnız icazəsi olan bölmələr göstərilir */
export function SiteTabs({ code, current }: { code: string; current: "home" | "submissions" | "content" | "redirects" | "stats" | "notifications" }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const tabs = [
    { id: "home", href: `/sites/${code}`, label: "Ümumi", show: true },
    { id: "submissions", href: `/sites/${code}/submissions`, label: "Müraciətlər", show: can("SUBMISSIONS", "VIEW", code) },
    { id: "content", href: `/sites/${code}/content`, label: "Məzmun", show: code !== "equipment" && (can("FAQ", "VIEW", code) || can("PAGES", "VIEW", code) || can("PROJECTS", "VIEW", code)) },
    { id: "redirects", href: `/sites/${code}/redirects`, label: "Yönləndirmələr", show: can("REDIRECTS", "VIEW", code) },
    { id: "stats", href: `/sites/${code}/stats`, label: "Statistika", show: can("STATISTICS", "VIEW", code) },
    { id: "notifications", href: `/sites/${code}/notifications`, label: "Bildirişlər", show: can("NOTIFICATIONS", "VIEW", code) },
  ].filter((t) => t.show);
  return (
    <nav className={styles.tabs} aria-label={`${site?.name ?? code} bölmələri`} style={{ marginBottom: 24 }}>
      {tabs.map((t) => (
        <Link key={t.id} href={t.href} className={styles.tab} aria-selected={t.id === current} style={{ textDecoration: "none" }}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
