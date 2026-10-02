"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { companies, type CompanyId } from "@/content/site";
import { ArrowUpRight } from "./Icons";
import styles from "./Hero.module.css";

const POSITIONS = ["top", "right", "bottom", "left"] as const;
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const CYCLE_MS = 4500;

export function Hero() {
  const [active, setActive] = useState<CompanyId | null>(null);
  const [hoverable, setHoverable] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);
  const [warm, setWarm] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<Partial<Record<CompanyId, HTMLVideoElement | null>>>({});

  useEffect(() => {
    const hq = window.matchMedia(HOVER_QUERY);
    const rq = window.matchMedia(REDUCED_QUERY);
    const update = () => {
      setHoverable(hq.matches);
      setReduced(rq.matches);
    };
    update();
    hq.addEventListener("change", update);
    rq.addEventListener("change", update);
    // Videolar səhifə yükləndikdən sonra fonda yüklənir ki, ilk açılışı yavaşlatmasın
    const t = window.setTimeout(() => setWarm(true), 1500);
    return () => {
      hq.removeEventListener("change", update);
      rq.removeEventListener("change", update);
      window.clearTimeout(t);
    };
  }, []);

  // Hero ekrandan çıxanda videolar dayanır
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Toxunma ekranlarında hover yoxdur — şirkətlər növbə ilə avtomatik aktivləşir
  useEffect(() => {
    if (hoverable || reduced || !inView) return;
    const first = window.setTimeout(() => setActive((cur) => cur ?? companies[0].id), 600);
    const t = window.setInterval(() => {
      setActive((cur) => {
        const i = companies.findIndex((c) => c.id === cur);
        return companies[(i + 1) % companies.length].id;
      });
    }, CYCLE_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [hoverable, reduced, inView]);

  useEffect(() => {
    for (const [id, el] of Object.entries(videos.current)) {
      if (!el) continue;
      if (id === active && inView) {
        el.muted = true;
        void el.play().catch(() => undefined);
      } else {
        el.pause();
      }
    }
  }, [active, inView]);

  const nextId = companies[(companies.findIndex((c) => c.id === active) + 1) % companies.length].id;
  const preload = (id: CompanyId) => {
    if (id === active) return "auto";
    // Mobildə trafikə qənaət üçün yalnız növbəti video əvvəlcədən yüklənir
    if (hoverable) return warm ? "auto" : "none";
    return warm && id === nextId ? "auto" : "none";
  };

  const onEnter = (id: CompanyId) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setActive(id);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setActive(null);
  };

  return (
    <section id="sirketler" className={styles.hero} aria-label="CES Group şirkətləri">
      <div ref={root} className={styles.x} data-active={active ?? undefined}>
        {companies.map((c, i) => (
          <div key={c.id} className={`${styles.layer} ${styles[POSITIONS[i]]} ${styles.photo}`} data-on={active === c.id || undefined}>
            <Image src={c.image} alt="" fill priority sizes="100vw" className={styles.img} />
            <div className={styles.dim} />
          </div>
        ))}

        {companies.map((c) => (
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
            preload={preload(c.id)}
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
            onPointerEnter={onEnter(c.id)}
            onPointerLeave={onLeave}
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
    </section>
  );
}
