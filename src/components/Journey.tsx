import Link from "next/link";
import { getAbout, getCompanies, getJourney } from "@/content/loaders";
import type { Company, JourneyStep } from "@/content/site";
import { ArrowRight, EyeIcon, HandshakeIcon, MedalIcon, ShieldIcon } from "./Icons";
import { JourneyStepper, type StepData } from "./JourneyStepper";
import styles from "./Journey.module.css";

const stepsOf = (journey: JourneyStep[], companies: Company[]): StepData[] =>
  journey.map((j) => {
    const c = companies.find((x) => x.id === j.id)!;
    return { ...j, name: c.shortName, field: c.field, description: c.description, url: c.url, image: c.image, imageAlt: c.imageAlt, focus: c.focus };
  });

const valueIcons = [ShieldIcon, HandshakeIcon, EyeIcon, MedalIcon];

/** Ana səhifənin tanıtım bölməsi: qrupun şirkətləri layihənin mərhələləri kimi və dəyərlər. */
export async function Journey() {
  const [about, companies, journey] = await Promise.all([getAbout(), getCompanies(), getJourney()]);
  const steps = stepsOf(journey, companies);
  return (
    <section id="qrup" className={`section ${styles.wrap}`} aria-labelledby="journey-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="journey-title" className="h2">
            Bir tərəfdaş. Layihənin bütün mərhələləri.
          </h2>
          <div className={styles.side}>
            <p className="lead">
              Memarlıq, tikinti, texnika icarəsi və kənd təsərrüfatı: dörd şirkət eskizdən təhvilə qədər bir komanda kimi işləyir.
              Sifarişçi bir neçə podratçı ilə deyil, tək məsuliyyətlə işləyir.
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

        <JourneyStepper steps={steps} />

        <ul className={styles.values}>
          {about.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length];
            return (
              <li key={v.title} className={styles.value}>
                <span className={styles.valueIcon}>
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueText}>{v.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
