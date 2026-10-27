"use client";

import { useEffect, useState } from "react";
import { getUi } from "@/i18n/ui";
import type { Lang } from "@/lib/i18n";
import styles from "./BackToTop.module.css";

export function BackToTop({ lang = "az" }: { lang?: Lang }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShow(window.scrollY > 800));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button type="button" aria-label={getUi(lang).sub.backToTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`${styles.btn} ${show ? styles.show : ""}`}>
      ↑
    </button>
  );
}
