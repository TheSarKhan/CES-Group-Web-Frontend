"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SubProject } from "@/content/subsites";
import { Reveal } from "./Reveal";
import anim from "./Anim.module.css";
import styles from "./ProjectsSlider.module.css";

const DURATION = 6000;
const pad = (n: number) => String(n).padStart(2, "0");

/** Ana səhifədəki layihələr slayderi: böyük kart, sağ kənarda növbəti layihənin önizləməsi və sayğac. */
export function ProjectsSlider({ projects }: { projects: SubProject[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = projects.length;

  // Avtomatik keçid (üzərinə gələndə və ya hərəkət azaldılıbsa işləmir)
  useEffect(() => {
    if (total < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % total), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, total]);

  if (total === 0) return null;

  const active = projects[index];
  const nextIdx = (index + 1) % total;
  const next = projects[nextIdx];

  return (
    <section className={styles.section}>
      <Reveal>
        <h2 className={`h2 ${styles.heading}`}>Layihələrimiz</h2>
      </Reveal>

      <div className={styles.layout} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className={styles.stage}>
          <Link href={`/layihelerimiz/${active.slug}`} className={styles.main} data-header-theme="dark">
            {/* Slaydlar üst-üstə durur, yalnız opacity dəyişir: şəkil yenidən yüklənmir */}
            {projects.map((p, i) => (
              <span key={p.slug} aria-hidden={i !== index} className={`${styles.slide} ${i === index ? styles.slideOn : ""}`}>
                <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 65vw, 80vw" quality={70} priority={i === 0} className={styles.img} />
              </span>
            ))}
            <span className={styles.shade} aria-hidden="true" />
            <span key={`t-${active.slug}`} className={`${styles.caption} ${anim.in}`}>
              <span className={styles.captionKind}>Layihə</span>
              <span className={styles.captionTitle}>{active.title}</span>
            </span>
            {total > 1 && (
              <span className={styles.track} aria-hidden="true">
                {!paused && <span key={index} className={styles.bar} style={{ animationDuration: `${DURATION}ms` }} />}
              </span>
            )}
          </Link>

          {total > 1 && (
            <button type="button" className={styles.thumb} onClick={() => setIndex(nextIdx)} aria-label={`${next.title} göstər`}>
              <Image src={next.image} alt="" fill sizes="(min-width: 768px) 25vw, 30vw" quality={60} className={styles.img} />
            </button>
          )}
        </div>

        <div className={styles.side}>
          <p className={styles.count}>
            {pad(index + 1)}
            <span>/{pad(total)}</span>
          </p>
          <Link href="/layihelerimiz" className={styles.all}>
            Hamısına bax →
          </Link>
        </div>
      </div>
    </section>
  );
}
