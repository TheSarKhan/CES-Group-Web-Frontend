import Link from "next/link";
import { getAbout, getCompanies, getJourney } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
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
export async function Journey({ lang = "az" }: { lang?: Lang }) {
  const [about, companies, journey] = await Promise.all([getAbout(lang), getCompanies(lang), getJourney(lang)]);
  const t = getUi(lang).journey;
  const steps = stepsOf(journey, companies);
  return (
    <section id="qrup" className={`section ${styles.wrap}`} aria-labelledby="journey-title">
      <div className="container">
        <div className={styles.head}>
          <h2 id="journey-title" className="h2">
            {t.title}
          </h2>
          <div className={styles.side}>
            <p className="lead">{t.lead}</p>
            <div className={styles.actions}>
              <Link href={localePath(lang, "/haqqimizda")} className="btn btn-dark">
                {t.aboutGroup} <ArrowRight />
              </Link>
              <Link href={localePath(lang, "/elaqe")} className="link-underline">
                {t.contactUs}
              </Link>
            </div>
          </div>
        </div>

        <JourneyStepper steps={steps} lang={lang} />

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
