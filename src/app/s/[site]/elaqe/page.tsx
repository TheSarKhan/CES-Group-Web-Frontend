import type { Metadata } from "next";
import { site as group } from "@/content/site";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { tel } from "@/lib/tel";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return { title: "Əlaqə", description: `${site.name} ilə əlaqə: müraciət forması, ünvan və telefon.`, alternates: { canonical: "/elaqe" } };
}

export default async function ContactPage(props: SubSiteParams) {
  const site = await getSubSite(props);
  const q = encodeURIComponent(group.mapQuery);

  return (
    <>
      <section className={styles.contactInfo} data-header-theme="dark">
        <div className={styles.breadcrumb}>
          <Breadcrumb light items={[{ label: "Ana səhifə", href: "/" }, { label: "Əlaqə" }]} />
        </div>
        <h1 className={`${styles.contactTitle} ${anim.in}`}>Əlaqə</h1>
        <div className={`${styles.contactLines} ${anim.in}`} style={{ animationDelay: "150ms" }}>
          <p>{group.address}</p>
          <p>
            <a href={tel(group.phone)}>{group.phone}</a>
          </p>
          <p>
            <a href={`mailto:${group.email}`}>{group.email}</a>
          </p>
        </div>
      </section>

      <section className={styles.light}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>Müraciət forması</h2>
          <ContactForm company={site.id} />
        </div>
      </section>

      <section className={styles.map}>
        <iframe title={`${site.name} ünvanı`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${q}&output=embed`} />
        <a className={styles.mapLink} href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
          <span>{group.mapQuery.split(",")[0]}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </section>
    </>
  );
}
