"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { subNav } from "@/content/subsites";
import { CloseIcon, MenuIcon } from "../Icons";
import { SubLogo } from "./SubLogo";
import styles from "./SubHeader.module.css";

type Props = { name: string; groupUrl: string; siblings: { name: string; url: string }[] };

export function SubHeader({ name, groupUrl, siblings }: Props) {
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
        <SubLogo name={name} tone={light ? "light" : "dark"} />
        <button type="button" className={styles.burger} aria-label="Menyunu aç" aria-expanded={open} aria-controls="sub-menu" onClick={() => setOpen(true)}>
          <MenuIcon size={26} />
        </button>
      </div>

      <div id="sub-menu" className={styles.menu} hidden={!open} role="dialog" aria-modal="true" aria-label="Menyu">
        <button type="button" className={styles.close} aria-label="Menyunu bağla" onClick={() => setOpen(false)}>
          <CloseIcon size={28} />
        </button>
        <nav className={styles.links} aria-label="Əsas menyu">
          {subNav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <nav className={styles.group} aria-label="CES Group şirkətləri">
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
