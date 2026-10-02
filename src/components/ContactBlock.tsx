import Link from "next/link";
import { companies } from "@/content/site";
import { ArrowRight } from "./Icons";
import styles from "./ContactBlock.module.css";

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export function ContactBlock() {
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
        <CompanyContacts />
      </div>
    </section>
  );
}

export function CompanyContacts() {
  return (
    <ul className={styles.list}>
      {companies.map((c) => (
        <li key={c.id} className={styles.row}>
          <span className={styles.name}>{c.name}</span>
          <span className={styles.links}>
            {c.phone ? <a href={tel(c.phone)}>{c.phone}</a> : <span className={styles.todo}>[Telefon]</span>}
            {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <span className={styles.todo}>[E-poçt]</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
