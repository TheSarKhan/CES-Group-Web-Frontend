"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SUB_NAV } from "@/i18n/nav";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { CloseIcon, MenuIcon } from "../Icons";
import { SubLogo } from "./SubLogo";
import { useSwitcher } from "./SwitchContext";
import styles from "./SubHeader.module.css";

type Props = { name: string; groupUrl: string; siblings: { name: string; url: string }[]; hasProjects?: boolean; lang?: Lang };

export function SubHeader({ name, groupUrl, siblings, hasProjects = true, lang = "az" }: Props) {
  const switcher = useSwitcher();
  const t = getUi(lang).sub;
  const switchLinks =
    switcher && switcher.langs.length > 1 ? (
      <div className={styles.langs} role="group" aria-label={getUi(lang).header.language}>
        {switcher.langs.map((l) => (
          <Link key={l} href={localePath(l, switcher.path)} hrefLang={l} lang={l} aria-current={l === lang ? "true" : undefined} onClick={() => setOpen(false)}>
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
    ) : null;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);

  // Yuxarıda şəffaf, aşağıda tünd fon. Başlığın altındakı bölmə tünddürsə yazılar açıq rəngə keçir
  useEffect(() => {
    const SAMPLE_Y = 40;
    const update = () => {
      setScrolled(window.scrollY > 20);
      let dark = false;
      document.querySelectorAll<HTMLElement>("[data-header-theme]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= SAMPLE_Y && r.bottom >= SAMPLE_Y) dark = el.dataset.headerTheme === "dark";
      });
      setOnDark(dark);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // Səhifə dəyişəndə bölmələr yenidən yoxlanır
  }, [pathname]);

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

  const light = scrolled || onDark;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${light ? styles.light : ""}`}>
      <div className={styles.bar}>
        <SubLogo name={name} tone={light ? "light" : "dark"} lang={lang} />
        <button type="button" className={styles.burger} aria-label={t.openMenu} aria-expanded={open} aria-controls="sub-menu" onClick={() => setOpen(true)}>
          <MenuIcon size={26} />
        </button>
      </div>

      <div id="sub-menu" className={styles.menu} hidden={!open} role="dialog" aria-modal="true" aria-label={t.menu}>
        <button type="button" className={styles.close} aria-label={t.closeMenu} onClick={() => setOpen(false)}>
          <CloseIcon size={28} />
        </button>
        <nav className={styles.links} aria-label={t.mainMenu}>
          {SUB_NAV.filter((n) => hasProjects || n.href !== "/layihelerimiz").map((item) => (
            <Link key={item.href} href={localePath(lang, item.href)} onClick={() => setOpen(false)}>
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>
        {switchLinks}
        <nav className={styles.group} aria-label={t.groupCompanies}>
          <a href={groupUrl}>CES Group ↗</a>
          {siblings.map((s) => (
            <a key={s.url} href={s.url}>
              {s.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
