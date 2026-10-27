"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { useCurrentSite } from "./Sidebar";
import { Avatar, useCrumbList } from "./ui";

/** Çörək qırıntısı (səhifələr özü bildirir), "Sayta bax" və istifadəçi işarəsi */
export function Topbar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { user } = useAdmin();
  const crumbs = useCrumbList();
  const site = useCurrentSite();
  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.burger} aria-label="Menyunu aç" aria-expanded={menuOpen} onClick={onMenu}>
        <Menu size={22} />
      </button>
      <nav className={styles.crumbs} aria-label="Səhifə yolu">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={`${c.label}-${i}`} style={{ display: "contents" }}>
              {i > 0 && (
                <span className={styles.crumbSep} aria-hidden="true">
                  /
                </span>
              )}
              {c.href && !last ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{c.label}</span>
              )}
            </span>
          );
        })}
      </nav>
      <div className={styles.topActions}>
        {site && (
          <a href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
            <span>Sayta bax</span>
            <ExternalLink size={16} />
          </a>
        )}
        <Link href="/profile" aria-label="Profil" title={user.name}>
          <Avatar name={user.name} />
        </Link>
      </div>
    </header>
  );
}
