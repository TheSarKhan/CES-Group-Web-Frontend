import Link from "next/link";
import { Waves } from "./Waves";
import { ArrowRight } from "./Icons";
import styles from "./Intro.module.css";

export function Intro() {
  return (
    <section className={`section ${styles.intro}`}>
      <Waves />
      <div className={`container ${styles.grid}`}>
        <h2 className="h1">
          Layihələndiririk.
          <br />
          Tikirik.
          <br />
          <span className="gold-text">Təmin edirik.</span>
        </h2>
        <div className={styles.side}>
          <p className="lead">
            CES Group memarlıq, tikinti, ağır texnika icarəsi və kənd təsərrüfatı sahələrində fəaliyyət göstərən dörd şirkəti bir
            araya gətirir.
          </p>
          <div className={styles.actions}>
            <Link href="/haqqimizda" className="btn btn-dark">
              Qrup haqqında <ArrowRight />
            </Link>
            <Link href="/elaqe" className="link-underline">
              Bizimlə əlaqə
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
