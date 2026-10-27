import Link from "next/link";
import Image from "next/image";
import { isTbd, type SubSite } from "@/content/subsites";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { Reveal } from "./Reveal";
import { ServicesGrid } from "./ServicesGrid";
import styles from "./Sections.module.css";

export function About({ site, lang = "az" }: { site: SubSite; lang?: Lang }) {
  return (
    <section id="haqqimizda" className={styles.about}>
      <Reveal>
        <h2 className={`h2 ${styles.heading}`}>{getUi(lang).sub.about}</h2>
      </Reveal>
      {site.about.map((p, i) => (
        <Reveal key={i} delay={(i + 1) * 120}>
          <p className={styles.aboutText}>{p}</p>
        </Reveal>
      ))}
    </section>
  );
}

export function Stats({ site, lang = "az" }: { site: SubSite; lang?: Lang }) {
  // Real dəyəri yazılmayan göstəricilər (`[00+]`) saytda görünmür
  const stats = site.stats.filter((s) => !isTbd(s.value));
  if (stats.length === 0) return null;
  return (
    <section className={styles.stats}>
      <Reveal>
        <h2 className={`h2 ${styles.heading}`}>{getUi(lang).sub.stats}</h2>
      </Reveal>
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 120}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{s.value}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Cta({ site, lang = "az" }: { site: SubSite; lang?: Lang }) {
  return (
    <section className={styles.cta} data-header-theme="dark">
      <Image src={site.poster} alt="" fill sizes="100vw" quality={70} className={styles.ctaImg} />
      <div className={styles.ctaShade} aria-hidden="true" />
      <div className={styles.ctaBody}>
        <h2 className="h2">{site.cta.title}</h2>
        <p>{site.cta.text}</p>
        <Link href={localePath(lang, "/elaqe")} className="btn btn-gold">
          {getUi(lang).sub.ctaButton}
        </Link>
      </div>
    </section>
  );
}

export function ServicesSection({ site, lang = "az" }: { site: SubSite; lang?: Lang }) {
  return (
    <section id="xidmetlerimiz" className={styles.services}>
      <Reveal>
        <h2 className={`h2 ${styles.heading} ${styles.servicesTitle}`}>{getUi(lang).sub.services}</h2>
      </Reveal>
      <ServicesGrid services={site.services} lang={lang} />
      <div className={styles.more}>
        <Link href={localePath(lang, "/xidmetlerimiz")}>{getUi(lang).sub.more}</Link>
      </div>
    </section>
  );
}
