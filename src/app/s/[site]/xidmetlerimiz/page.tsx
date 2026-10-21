import type { Metadata } from "next";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { CharTitle } from "@/components/subsite/CharTitle";
import { ServicesGrid } from "@/components/subsite/ServicesGrid";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return { title: "Xidmətlərimiz", description: `${site.name} xidmətləri.`, alternates: { canonical: "/xidmetlerimiz" } };
}

export default async function ServicesPage(props: SubSiteParams) {
  const site = await getSubSite(props);
  return (
    <section className={styles.list}>
      <Breadcrumb items={[{ label: "Ana səhifə", href: "/" }, { label: "Xidmətlərimiz" }]} />
      <div className={styles.head}>
        <CharTitle text="Xidmətlərimiz" step={45} className={styles.title} />
        <p className={`${styles.lead} ${anim.in}`} style={{ animationDelay: "600ms" }}>
          {site.description}
        </p>
      </div>
      <ServicesGrid services={site.services} />
    </section>
  );
}
