import Link from "next/link";
import { getSiteSettings } from "@/content/loaders";
import { ArrowRight } from "./Icons";
import { tel } from "@/lib/tel";
import styles from "./ContactBlock.module.css";

export async function ContactBlock() {
  return (
    <section className={`section ${styles.wrap}`} aria-labelledby="contact-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <h2 id="contact-title" className="h2">
            Layihəniz var?
          </h2>
          <p className="lead">Müraciətinizi göndərin, sorğunuzu birbaşa aidiyyəti şirkətə yönləndirək.</p>
          <Link href="/elaqe" className="btn btn-gold">
            Müraciət göndər <ArrowRight />
          </Link>
        </div>
        <GroupContacts />
      </div>
    </section>
  );
}

/** Bütün şirkətlər üçün ortaq əlaqə məlumatı */
export async function GroupContacts() {
  const site = await getSiteSettings();
  return (
    <ul className={styles.list}>
      <li className={styles.row}>
        <span className={styles.name}>Ünvan</span>
        <span className={styles.value}>{site.address}</span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>İş saatları</span>
        <span className={styles.value}>{site.hours.label}</span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>Telefon</span>
        <span className={styles.links}>
          <a href={tel(site.phone)}>{site.phone}</a>
        </span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>WhatsApp</span>
        <span className={styles.links}>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
            {site.phone}
          </a>
        </span>
      </li>
      <li className={styles.row}>
        <span className={styles.name}>E-poçt</span>
        <span className={styles.links}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </span>
      </li>
    </ul>
  );
}
