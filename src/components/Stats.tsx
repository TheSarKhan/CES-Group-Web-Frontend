import { stats } from "@/content/site";
import { Waves } from "./Waves";
import styles from "./Stats.module.css";

export function Stats({ title = "Rəqəmlərlə CES Group" }: { title?: string }) {
  return (
    <section className={`section ${styles.stats}`} aria-labelledby="stats-title">
      <Waves tone="dark" />
      <div className={`container ${styles.inner}`}>
        <h2 id="stats-title" className="h2">
          {title}
        </h2>
        <dl className={styles.grid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.item}>
              <dt className={styles.label}>{s.label}</dt>
              <dd className={styles.value}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
