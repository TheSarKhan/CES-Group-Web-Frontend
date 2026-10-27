"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getUi } from "@/i18n/ui";
import type { Lang } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import styles from "./Gallery.module.css";

export function Gallery({ images, title, lang = "az" }: { images: string[]; title: string; lang?: Lang }) {
  const g = getUi(lang).sub.gallery;
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, images.length]);

  return (
    <>
      <div className={styles.grid}>
        {images.map((src, i) => (
          <Reveal key={src} delay={(i % 2) * 100}>
            <button type="button" className={styles.thumb} onClick={() => setOpen(i)} aria-label={g.image(title, i + 1)}>
              <Image src={src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" quality={70} className={styles.img} />
            </button>
          </Reveal>
        ))}
      </div>

      {open !== null && (
        <div className={styles.box} role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(null)}>
          <button type="button" className={styles.close} aria-label={g.close}>
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.nav} ${styles.prev}`}
                aria-label={g.prev}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open - 1 + images.length) % images.length);
                }}
              >
                ←
              </button>
              <button
                type="button"
                className={`${styles.nav} ${styles.next}`}
                aria-label={g.next}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((open + 1) % images.length);
                }}
              >
                →
              </button>
            </>
          )}
          <div className={styles.frame} onClick={(e) => e.stopPropagation()}>
            <Image src={images[open]} alt={g.image(title, open + 1)} fill sizes="100vw" quality={85} className={styles.full} />
          </div>
        </div>
      )}
    </>
  );
}
