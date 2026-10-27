import type { Metadata } from "next";
import { subContext, type SubPageParams } from "@/lib/subsite";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { abs, graph, itemList, pageNodes } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { CharTitle } from "@/components/subsite/CharTitle";
import { SetSwitcher } from "@/components/subsite/SwitchContext";
import { ServicesGrid } from "@/components/subsite/ServicesGrid";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

const load = ({ params }: SubPageParams) => subContext(params, { kind: "services" }, "/xidmetlerimiz");

export async function generateMetadata(props: SubPageParams): Promise<Metadata> {
  const { site, lang, langs, t } = await load(props);
  const labels = site.services.map((s) => s.label.toLocaleLowerCase(lang)).join(", ");
  return pageMetadata({
    title: t.sub.services,
    description: t.sub.servicesDescription(site.name, labels),
    path: "/xidmetlerimiz",
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
    lang,
    langs,
  });
}

export default async function ServicesPage(props: SubPageParams) {
  const { site, lang, switcher, t } = await load(props);
  return (
    <section className={styles.list}>
      <SetSwitcher {...switcher} />
      <Breadcrumb items={[{ label: t.common.home, href: localePath(lang, "/") }, { label: t.sub.services }]} />
      <div className={styles.head}>
        <CharTitle text={t.sub.services} step={45} className={styles.title} />
        <p className={`${styles.lead} ${anim.in}`} style={{ animationDelay: "600ms" }}>
          {site.description}
        </p>
      </div>
      <ServicesGrid services={site.services} lang={lang} />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "CollectionPage",
            base: site.url,
            lang,
            path: "/xidmetlerimiz",
            name: t.sub.services,
            description: site.description,
            crumbs: [
              { name: t.common.home, path: "/" },
              { name: t.sub.services, path: "/xidmetlerimiz" },
            ],
            extra: { mainEntity: itemList(site.services.map((s) => ({ name: s.label, url: abs(localePath(lang, `/xidmetlerimiz/${s.slug}`), site.url) }))) },
          }),
        )}
      />
    </section>
  );
}
