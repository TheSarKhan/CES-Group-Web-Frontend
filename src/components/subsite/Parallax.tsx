"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import anim from "./Anim.module.css";
import styles from "./DetailHero.module.css";

/** Şəkil scroll-da yavaş sürüşür. Yalnız masaüstündə və hərəkət azaldılmayıbsa. */
export function Parallax({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;
    if (!window.matchMedia("(min-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!visible) return;
        el.style.transform = `translate3d(0, ${Math.min(window.scrollY, hero.offsetHeight) * 0.15}px, 0)`;
      });
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(hero);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={styles.parallax}>
      <div className={`${styles.fill} ${anim.zoom}`}>
        <Image src={src} alt={alt} fill sizes="100vw" quality={75} priority className={styles.cover} />
      </div>
    </div>
  );
}
