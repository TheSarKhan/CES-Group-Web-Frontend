import { getStats } from "@/content/loaders";
import styles from "./Stats.module.css";

export async function Stats({ title = "Rəqəmlərlə CES Group" }: { title?: string }) {
  const stats = await getStats();
  return (
    <section className={`section ${styles.stats}`} aria-labelledby="stats-title">
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
