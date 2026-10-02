"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { companies, type CompanyId } from "@/content/site";
import { ArrowUpRight } from "./Icons";
import styles from "./Hero.module.css";

const POSITIONS = ["top", "right", "bottom", "left"] as const;
const DESKTOP_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export function Hero() {
  const [active, setActive] = useState<CompanyId | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [warm, setWarm] = useState(false);
  const videos = useRef<Partial<Record<CompanyId, HTMLVideoElement | null>>>({});

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    // Videolar səhifə yükləndikdən sonra fonda yüklənir ki, ilk açılışı yavaşlatmasın
    const t = window.setTimeout(() => setWarm(true), 1500);
    return () => {
      mq.removeEventListener("change", update);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    for (const [id, el] of Object.entries(videos.current)) {
      if (!el) continue;
      if (id === active) {
        el.muted = true;
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    }
  }, [active]);

  return (
    <section id="sirketler" className={styles.hero} aria-label="CES Group şirkətləri">
      {/* Masaüstü: X ilə bölünmüş tam ekran hero */}
      <div className={styles.x} data-active={active ?? undefined}>
        {companies.map((c, i) => (
          <div key={c.id} className={`${styles.layer} ${styles[POSITIONS[i]]} ${styles.photo}`} data-on={active === c.id || undefined}>
            <Image src={c.image} alt="" fill priority sizes="100vw" className={styles.img} />
            <div className={styles.dim} />
          </div>
        ))}

        {desktop &&
          companies.map((c) => (
            <video
              key={c.id}
              ref={(el) => {
                videos.current[c.id] = el;
              }}
              className={styles.video}
              data-on={active === c.id || undefined}
              poster={c.image}
              muted
              loop
              playsInline
              preload={warm || active === c.id ? "auto" : "none"}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={`${c.video}.mp4`} type="video/mp4" />
              <source src={`${c.video}.webm`} type="video/webm" />
            </video>
          ))}

        <div className={styles.videoDim} aria-hidden="true" />

        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100" y2="100" vectorEffect="non-scaling-stroke" />
          <line x1="100" y1="0" x2="0" y2="100" vectorEffect="non-scaling-stroke" />
        </svg>

        {companies.map((c, i) => (
          <div
            key={c.id}
            className={`${styles.label} ${styles[`label_${POSITIONS[i]}`]}`}
            data-dim={(active && active !== c.id) || undefined}
            aria-hidden="true"
          >
            <span className={styles.name}>{c.name}</span>
            <span className={styles.field}>{c.field}</span>
            <span className={styles.go}>
              Sayta keç <ArrowUpRight size={14} />
            </span>
          </div>
        ))}

        {companies.map((c, i) => (
          <a
            key={c.id}
            href={c.url}
            className={`${styles.layer} ${styles[POSITIONS[i]]} ${styles.hit}`}
            aria-label={`${c.name} — ${c.field}. Sayta keç`}
            onPointerEnter={() => setActive(c.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(c.id)}
            onBlur={() => setActive(null)}
          />
        ))}

        <div className={styles.diamond}>
          <div className={styles.diamondInner}>
            <h1 className={styles.brand}>
              CES<span>Group</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Mobil, planşet və toxunma ekranları: kartlar */}
      <div className={styles.cards}>
        <div className="container">
          <h1 className={styles.mTitle}>CES Group</h1>
          <ul className={styles.grid}>
            {companies.map((c) => (
              <li key={c.id}>
                <a href={c.url} className={styles.card}>
                  <Image src={c.image} alt={c.imageAlt} fill sizes="(max-width: 599px) 100vw, 50vw" className={styles.cardImg} />
                  <span className={styles.panel}>
                    <span className={styles.panelText}>
                      <span className={styles.panelName}>{c.name}</span>
                      <span className={styles.panelField}>{c.field}</span>
                    </span>
                    <ArrowUpRight size={18} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
