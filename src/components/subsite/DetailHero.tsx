import { CharTitle } from "./CharTitle";
import { Parallax } from "./Parallax";
import anim from "./Anim.module.css";
import styles from "./DetailHero.module.css";

type Props = {
  image: string;
  alt: string;
  /** Başlığın üstündəki kiçik yazı: "Xidmət" / "Layihə" */
  kicker: string;
  title: string;
  links: { href: string; label: string }[];
};

/** Xidmət və layihə detal səhifələrinin üst hissəsi: parallax şəkil, hərf-hərf açılan başlıq, sürüşən yazı zolağı. */
export function DetailHero({ image, alt, kicker, title, links }: Props) {
  return (
    <>
      <section className={styles.hero} data-header-theme="dark">
        <Parallax src={image} alt={alt} />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.center}>
          <p className={`${styles.kicker} ${anim.in}`} style={{ animationDelay: "200ms" }}>
            <span aria-hidden="true" />
            {kicker}
          </p>
          <CharTitle text={title} delay={300} className={styles.title} />
        </div>
        <nav className={styles.subnav} aria-label="Bölmələr">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </section>

      <div className={styles.marqueeWrap} aria-hidden="true" data-header-theme="dark">
        <div className={anim.marquee}>
          {[0, 1].map((g) => (
            <div key={g} className={styles.marqueeGroup}>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className={styles.marqueeItem}>
                  <span>{title}</span>
                  <i />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
