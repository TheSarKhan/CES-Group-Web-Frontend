"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/site";
import { Logo } from "./Logo";
import { CloseIcon, MenuIcon } from "./Icons";
import styles from "./Header.module.css";

export function Header({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""}`}>
      <div className={`container ${styles.bar}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Əsas menyu">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link href="/elaqe" className={`btn btn-gold ${styles.cta}`}>
            Əlaqə saxla
          </Link>
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.panel} ${open ? styles.panelOpen : ""}`} hidden={!open}>
        <nav className="container" aria-label="Mobil menyu">
          <ul className={styles.mList}>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.mLink} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/elaqe" className="btn btn-gold" style={{ width: "100%" }} onClick={() => setOpen(false)}>
            Əlaqə saxla
          </Link>
        </nav>
      </div>
    </header>
  );
}
