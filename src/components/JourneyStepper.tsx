"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BuildIcon, CheckIcon, CraneIcon, DesignIcon, WheatIcon, ArrowUpRight } from "./Icons";
import styles from "./Journey.module.css";

export type StepData = {
  id: string;
  icon: "design" | "build" | "crane" | "wheat";
  points: string[];
  name: string;
  field: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  focus?: string;
};

const ICONS = { design: DesignIcon, build: BuildIcon, crane: CraneIcon, wheat: WheatIcon };
const DURATION = 6500;

/**
 * Solda addımlar (ikonlu, bir-birinə xətlə bağlı), sağda aktiv şirkətin şəkli, təsviri və xidmətləri.
 * Addım kliklə seçilir və ya özü növbə ilə keçir. Üzərinə gələndə, fokusda və ekrandan çıxanda dayanır.
 */
export function JourneyStepper({ steps }: { steps: StepData[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(rq.matches);
    update();
    rq.addEventListener("change", update);
    return () => rq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = inView && !paused && !reduced;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % steps.length), DURATION);
    return () => window.clearTimeout(t);
  }, [running, active, steps.length]);

  const cur = steps[active];

  return (
    <div
      ref={root}
      className={styles.stepper}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ol className={styles.list}>
        {steps.map((s, i) => {
          const Icon = ICONS[s.icon];
          const on = i === active;
          return (
            <li key={s.id} className={styles.item} data-on={on || undefined} data-done={i < active || undefined}>
              <button type="button" className={styles.btn} aria-current={on || undefined} onClick={() => setActive(i)}>
                <span className={styles.node}>
                  <Icon size={24} />
                </span>
                <span className={styles.text}>
                  <span className={styles.company}>{s.name}</span>
                  <span className={styles.desc}>{s.field}</span>
                </span>
              </button>
              {on && running && <span key={active} className={styles.progress} style={{ animationDuration: `${DURATION}ms` }} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className={styles.panel} aria-live="polite">
        {steps.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt={i === active ? s.imageAlt : ""}
            fill
            sizes="(max-width: 1023px) 100vw, 58vw"
            quality={80}
            className={`${styles.img} ${i === active ? styles.imgOn : ""}`}
            style={s.focus ? { objectPosition: s.focus } : undefined}
          />
        ))}
        <span className={styles.shade} aria-hidden="true" />
        <div key={cur.id} className={styles.card}>
          <h3 className={styles.cardName}>{cur.name}</h3>
          <p className={styles.cardText}>{cur.description}</p>
          <ul className={styles.points}>
            {cur.points.map((p) => (
              <li key={p}>
                <CheckIcon size={16} />
                {p}
              </li>
            ))}
          </ul>
          <a href={cur.url} className={`btn btn-gold ${styles.go}`}>
            Sayta keç <ArrowUpRight />
          </a>
        </div>
      </div>
    </div>
  );
}
