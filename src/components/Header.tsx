"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/i18n/nav";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { Logo } from "./Logo";
import { CloseIcon, MenuIcon } from "./Icons";
import styles from "./Header.module.css";

/** Dil seçici: səhifənin yolu (dilsiz) və açıq olduğu dillər. Bir dil varsa göstərilmir. */
export type LangSwitch = { path: string; langs: Lang[] };

export function Header({ overlay = false, lang = "az", switcher }: { overlay?: boolean; lang?: Lang; switcher?: LangSwitch }) {
  const t = getUi(lang);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Aşağı scroll edəndə navbar fon alır və bir az kiçilir
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const raf = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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

  const isActive = (href: string) => (href === localePath(lang, "/") ? pathname === href : !href.includes("#") && pathname.startsWith(href));
  const langs = switcher && switcher.langs.length > 1 ? switcher.langs : null;
  const switchLinks = langs && switcher && (
    <ul className={styles.langs} aria-label={t.header.language}>
      {langs.map((l) => (
        <li key={l}>
          <Link href={localePath(l, switcher.path)} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined} className={styles.lang}>
            {l.toUpperCase()}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.bar}`}>
        <Logo lang={lang} />
        <nav className={styles.nav} aria-label={t.header.mainMenu}>
          {NAV.map((item) => (
            <Link key={item.href} href={localePath(lang, item.href)} className={styles.navLink} aria-current={isActive(localePath(lang, item.href)) ? "page" : undefined}>
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          {switchLinks}
          <Link href={localePath(lang, "/elaqe")} className={`btn btn-gold ${styles.cta}`}>
            {t.header.contactCta}
          </Link>
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`${styles.panel} ${open ? styles.panelOpen : ""}`} hidden={!open}>
        <nav className="container" aria-label={t.header.mobileMenu}>
          <ul className={styles.mList}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={localePath(lang, item.href)} className={styles.mLink} onClick={() => setOpen(false)}>
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
          {switchLinks}
          <Link href={localePath(lang, "/elaqe")} className="btn btn-gold" style={{ width: "100%" }} onClick={() => setOpen(false)}>
            {t.header.contactCta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
