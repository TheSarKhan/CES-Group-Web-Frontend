import { Waves } from "./Waves";
import styles from "./PageHero.module.css";

export function PageHero({ title, lead }: { title: string; lead: string }) {
  return (
    <section className={styles.hero}>
      <Waves tone="dark" />
      <div className={`container ${styles.inner}`}>
        <h1 className="h1">{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </div>
    </section>
  );
}
