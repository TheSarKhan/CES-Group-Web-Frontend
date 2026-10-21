import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/site";
import { ArrowRight, ArrowUpRight } from "./Icons";
import styles from "./Projects.module.css";

export function Projects() {
  return (
    <section id="layiheler" className={styles.projects} aria-labelledby="projects-title">
      <div className="container">
        <div className={`section-head ${styles.head}`}>
          <h2 id="projects-title" className="h2">
            Seçilmiş layihələr
          </h2>
          <Link href="/layiheler" className={`link-arrow ${styles.all}`}>
            Bütün layihələr <ArrowRight />
          </Link>
        </div>
        <ul className={styles.grid}>
          {projects.map((p, i) => (
            <li key={p.slug} className={`${styles.tile} ${i === 0 ? styles.big : ""}`}>
              <Link href={`/layiheler/${p.slug}`} className={styles.link} aria-label={`${p.title} — ətraflı`}>
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes={i === 0 ? "(max-width: 639px) 100vw, 50vw" : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"}
                  className={styles.img}
                />
                <div className={styles.caption}>
                  <h3 className={styles.title}>{p.title}</h3>
                  <span className={styles.company}>{p.company}</span>
                </div>
                <span className={styles.go} aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
