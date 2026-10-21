import Link from "next/link";
import Image from "next/image";
import type { SubSite } from "@/content/subsites";
import { Reveal } from "./Reveal";
import { ServicesGrid } from "./ServicesGrid";
import styles from "./Sections.module.css";

export function About({ site }: { site: SubSite }) {
  return (
    <section id="haqqimizda" className={styles.about}>
      <Reveal>
        <h2 className={`h2 ${styles.heading}`}>Haqqımızda</h2>
      </Reveal>
      {site.about.map((p, i) => (
        <Reveal key={i} delay={(i + 1) * 120}>
          <p className={styles.aboutText}>{p}</p>
        </Reveal>
      ))}
    </section>
  );
}

export function Stats({ site }: { site: SubSite }) {
  return (
    <section className={styles.stats}>
      <Reveal>
        <h2 className={`h2 ${styles.heading}`}>Göstəricilərimiz</h2>
      </Reveal>
      <div className={styles.statsGrid}>
        {site.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 120}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{s.value}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Cta({ site }: { site: SubSite }) {
  return (
    <section className={styles.cta} data-header-theme="dark">
      <Image src={site.poster} alt="" fill sizes="100vw" quality={70} className={styles.ctaImg} />
      <div className={styles.ctaShade} aria-hidden="true" />
      <div className={styles.ctaBody}>
        <h2 className="h2">{site.cta.title}</h2>
        <p>{site.cta.text}</p>
        <Link href="/elaqe" className="btn btn-gold">
          ƏLAQƏ
        </Link>
      </div>
    </section>
  );
}

export function ServicesSection({ site }: { site: SubSite }) {
  return (
    <section id="xidmetlerimiz" className={styles.services}>
      <Reveal>
        <h2 className={`h2 ${styles.heading} ${styles.servicesTitle}`}>Xidmətlərimiz</h2>
      </Reveal>
      <ServicesGrid services={site.services} />
      <div className={styles.more}>
        <Link href="/xidmetlerimiz">Ətraflı →</Link>
      </div>
    </section>
  );
}
