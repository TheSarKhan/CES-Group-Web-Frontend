"use client";

import { useEffect, useRef } from "react";
import styles from "./SubHero.module.css";

export function SubHero({ title, video, poster }: { title: string; video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Mobil brauzerlərdə `muted` atributu bəzən DOM-a düşmür və autoplay bloklanır.
  // "Hərəkəti azalt" seçilibsə video oynamır, yalnız poster qalır.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.muted = true;
    void el.play().catch(() => undefined);
  }, []);

  return (
    <section className={styles.hero} data-header-theme="dark">
      <video ref={ref} className={styles.video} poster={poster} autoPlay loop muted playsInline preload="auto" aria-hidden="true" tabIndex={-1}>
        <source src={`${video}.mp4`} type="video/mp4" />
        <source src={`${video}.webm`} type="video/webm" />
      </video>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <a href="#haqqimizda" className="btn btn-gold">
          ƏTRAFLI →
        </a>
      </div>
    </section>
  );
}
