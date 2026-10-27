import type { Metadata } from "next";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { pageMetadata } from "@/lib/seo";
import { abs, graph, itemList, pageNodes } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { CharTitle } from "@/components/subsite/CharTitle";
import { ServicesGrid } from "@/components/subsite/ServicesGrid";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  const labels = site.services.map((s) => s.label.toLocaleLowerCase("az")).join(", ");
  return pageMetadata({
    title: "Xidmətlərimiz",
    description: `${site.name} xidmətləri: ${labels}.`,
    path: "/xidmetlerimiz",
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
  });
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
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "CollectionPage",
            base: site.url,
            path: "/xidmetlerimiz",
            name: "Xidmətlərimiz",
            description: site.description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Xidmətlərimiz", path: "/xidmetlerimiz" },
            ],
            extra: { mainEntity: itemList(site.services.map((s) => ({ name: s.label, url: abs(`/xidmetlerimiz/${s.slug}`, site.url) }))) },
          }),
        )}
      />
    </section>
  );
}
