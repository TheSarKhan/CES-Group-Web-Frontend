"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { companies, type CompanyId } from "@/content/site";
import { ArrowUpRight } from "./Icons";
import styles from "./Hero.module.css";

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
  // Panellər arasında keçəndə video sönüb-yanmasın deyə yalnız sıradan çıxanda sıfırlanır
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setActive(null);
  };

  return (
    <section id="sirketler" className={styles.hero} aria-label="CES Group şirkətləri">
      <h1 className="sr-only">CES Group</h1>
      <div
        ref={root}
        className={styles.row}
        data-active={active ?? undefined}
        style={{ "--n": companies.length } as CSSProperties}
        onPointerLeave={onLeave}
      >
        {/* Masaüstündə aktiv şirkətin videosu bütün sıra boyunca, mobildə öz panelində oynayır */}
        {companies.map((c, i) => (
          <video
            key={c.id}
            ref={(el) => {
              videos.current[c.id] = el;
            }}
            className={styles.video}
            style={{ "--i": i } as CSSProperties}
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

        {companies.map((c, i) => (
          <a
            key={c.id}
            href={c.url}
            className={styles.panel}
            data-on={active === c.id || undefined}
            aria-label={`${c.name} — ${c.field}. Sayta keç`}
            onPointerEnter={onEnter(c.id)}
            onFocus={() => setActive(c.id)}
            onBlur={() => setActive(null)}
          >
            {/* Panel dar olsa da şəkil 100svh hündürlüyündə (cover) göstərilir, ona görə sizes ENİNƏ görə yox, hündürlüyə görə verilir; əks halda 384px-lik şəkil böyüdülüb bulanır */}
            <Image src={c.image} alt="" fill priority quality={85} sizes="(max-width: 767px) 100vw, 180vh" className={styles.img} />
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.label} aria-hidden="true">
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.field}>{c.field}</span>
              <span className={styles.go}>
                Sayta keç <ArrowUpRight size={14} />
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
