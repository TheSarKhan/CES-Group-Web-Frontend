"use client";

import { useEffect, useRef } from "react";
import { getUi } from "@/i18n/ui";
import type { Lang } from "@/lib/i18n";
import { afterLoad, prefersLightMedia } from "@/lib/media";
import styles from "./SubHero.module.css";

export function SubHero({ title, video, poster, lang = "az" }: { title: string; video: string; poster: string; lang?: Lang }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Mobil brauzerlərdə `muted` atributu bəzən DOM-a düşmür və autoplay bloklanır.
  // "Hərəkəti azalt" və ya trafikə qənaət seçilibsə video oynamır, yalnız poster qalır.
  // Video səhifə tam yükləndikdən sonra başlayır ki, ilk açılış (LCP) yavaşlamasın.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || prefersLightMedia()) return;
    return afterLoad(() => {
      el.muted = true;
      el.preload = "auto";
      void el.play().catch(() => undefined);
    }, 800);
  }, []);

  return (
    <section className={styles.hero} data-header-theme="dark">
      <video ref={ref} className={styles.video} poster={poster} loop muted playsInline preload="none" aria-hidden="true" tabIndex={-1}>
        <source src={`${video}-m.mp4`} media="(max-width: 767px)" type="video/mp4" />
        <source src={`${video}.mp4`} type="video/mp4" />
      </video>
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        <a href="#haqqimizda" className="btn btn-gold">
          {getUi(lang).sub.heroMore}
        </a>
      </div>
    </section>
  );
}
