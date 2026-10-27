import Image from "next/image";
import Link from "next/link";
import { getProjectsOrNone } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { ArrowRight, ArrowUpRight } from "./Icons";
import styles from "./Projects.module.css";

export async function Projects({ lang = "az" }: { lang?: Lang }) {
  const projects = await getProjectsOrNone(lang);
  const t = getUi(lang).projectsSection;
  // Seçilmiş dildə tərcümə olunmuş layihə yoxdursa bölmə göstərilmir
  if (projects.length === 0) return null;
  return (
    <section id="layiheler" className={styles.projects} aria-labelledby="projects-title">
      <div className="container">
        <div className={`section-head ${styles.head}`}>
          <h2 id="projects-title" className="h2">
            {t.title}
          </h2>
          <Link href={localePath(lang, "/layiheler")} className={`link-arrow ${styles.all}`}>
            {t.all} <ArrowRight />
          </Link>
        </div>
        <ul className={styles.grid}>
          {projects.map((p, i) => (
            <li key={p.slug} className={`${styles.tile} ${i === 0 ? styles.big : ""}`}>
              <Link href={localePath(lang, `/layiheler/${p.slug}`)} className={styles.link} aria-label={t.detailsAria(p.title)}>
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
