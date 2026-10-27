import { getStats } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import type { Lang } from "@/lib/i18n";
import styles from "./Stats.module.css";

export async function Stats({ title, lang = "az" }: { title?: string; lang?: Lang }) {
  const stats = await getStats(lang);
  title ??= getUi(lang).stats.title;
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
