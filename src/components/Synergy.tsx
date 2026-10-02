import { steps } from "@/content/site";
import { ArrowRight } from "./Icons";
import styles from "./Synergy.module.css";

export function Synergy() {
  return (
    <section className={`section ${styles.wrap}`} aria-labelledby="synergy-title">
      <div className="container">
        <div className="section-head">
          <h2 id="synergy-title" className={`h2 ${styles.title}`}>
            Bir tərəfdaş. Layihənin bütün mərhələləri.
          </h2>
          <p className={`lead ${styles.text}`}>
            Eskizdən təhvilə qədər hər mərhələ qrup daxilində icra olunur. Sifarişçi bir neçə podratçı ilə deyil, bir komanda ilə
            işləyir.
          </p>
        </div>

        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={`${styles.rule} ${i === 0 ? styles.ruleOn : ""}`} aria-hidden="true" />
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <span className={styles.company}>{s.company}</span>
              <p className={styles.stepText}>{s.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.farmart}>
          <p className="lead">
            <strong>Farmart</strong> qrupun kənd təsərrüfatı istiqamətidir.
          </p>
          <a href="https://farmart.az" className="link-arrow">
            farmart.az <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
