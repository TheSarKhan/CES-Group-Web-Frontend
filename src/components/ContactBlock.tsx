import Link from "next/link";
import { getSiteSettings } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { ArrowRight } from "./Icons";
import { tel } from "@/lib/tel";
import styles from "./ContactBlock.module.css";

export async function ContactBlock({ lang = "az" }: { lang?: Lang }) {
  const t = getUi(lang).contactBlock;
  return (
    <section className={`section ${styles.wrap}`} aria-labelledby="contact-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <h2 id="contact-title" className="h2">
            {t.title}
          </h2>
          <p className="lead">{t.lead}</p>
          <Link href={localePath(lang, "/elaqe")} className="btn btn-gold">
            {getUi(lang).common.sendRequest} <ArrowRight />
          </Link>
        </div>
        <GroupContacts lang={lang} />
      </div>
    </section>
  );
}

/** Bütün şirkətlər üçün ortaq əlaqə məlumatı */
export async function GroupContacts({ lang = "az" }: { lang?: Lang }) {
  const site = await getSiteSettings(lang);
  const t = getUi(lang).contactBlock;
  return (
    <ul className={styles.list}>
      <li className={styles.row}>
        <span className={styles.name}>{t.address}</span>
        <span className={styles.value}>{site.address}</span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>{t.hours}</span>
        <span className={styles.value}>{site.hours.label}</span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>{t.phone}</span>
        <span className={styles.links}>
          <a href={tel(site.phone)}>{site.phone}</a>
        </span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>{t.whatsapp}</span>
        <span className={styles.links}>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            {site.phone}
          </a>
        </span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>{t.email}</span>
        <span className={styles.links}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </span>
      </li>
    </ul>
  );
}
