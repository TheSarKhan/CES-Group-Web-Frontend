import Image from "next/image";
import { projects } from "@/content/site";
import styles from "./Projects.module.css";

export function Projects() {
  return (
    <section id="layiheler" className={styles.projects} aria-labelledby="projects-title">
      <div className="container">
        <div className={`section-head ${styles.head}`}>
          <h2 id="projects-title" className="h2">
            Seçilmiş layihələr
          </h2>
        </div>
        <ul className={styles.grid}>
          {projects.map((p, i) => (
            <li key={p.title} className={`${styles.tile} ${i === 0 ? styles.big : ""}`}>
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
