import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubSiteContent } from "@/content/loaders";
import { subsiteIds } from "@/content/subsites";
import { getSubSite } from "@/lib/subsite";
import { getCompanies } from "@/content/loaders";
import { pageMetadata } from "@/lib/seo";
import { abs, graph, orgId, pageNodes } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { DetailHero } from "@/components/subsite/DetailHero";
import { PanelLink } from "@/components/subsite/PanelLink";
import { Reveal } from "@/components/subsite/Reveal";
import styles from "@/components/subsite/Pages.module.css";

type Props = { params: Promise<{ site: string; slug: string }> };

export async function generateStaticParams() {
  const all = await Promise.all(subsiteIds.map(async (site) => (await getSubSiteContent(site)).services.map((s) => ({ site, slug: s.slug }))));
  return all.flat();
}

async function load({ params }: Props) {
  const { slug } = await params;
  const site = await getSubSite({ params });
  const service = site.services.find((s) => s.slug === slug);
  if (!service) notFound();
  return { site, service };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { site, service } = await load(props);
  return pageMetadata({
    title: service.label,
    description: service.description,
    path: `/xidmetlerimiz/${service.slug}`,
    siteName: site.name,
    image: { url: service.image },
  });
}

export default async function ServiceDetailPage(props: Props) {
  const { site, service } = await load(props);
  const others = site.services.filter((s) => s.slug !== service.slug);
  const company = (await getCompanies()).find((c) => c.id === site.id);
  const path = `/xidmetlerimiz/${service.slug}`;

  return (
    <>
      <DetailHero
        image={service.image}
        alt={service.label}
        kicker="Xidmət"
        title={service.label}
        links={[{ href: "#haqqinda", label: "Xidmət haqqında" }, ...(service.includes?.length ? [{ href: "#daxildir", label: "Nələr daxildir" }] : []), ...(others.length ? [{ href: "#diger", label: "Digər xidmətlər" }] : [])]}
      />

      <section id="haqqinda" className={styles.dark} data-header-theme="dark">
        <Reveal>
          <h2 className="h2">Xidmət haqqında</h2>
          <span className={styles.rule} aria-hidden="true" />
        </Reveal>
        <Reveal delay={150}>
          <p className={styles.darkText}>{service.description}</p>
          {service.body?.map((p, i) => (
            <p key={i} className={`${styles.darkText} ${styles.darkTextMore}`}>
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      {service.includes && service.includes.length > 0 && (
        <section id="daxildir" className={styles.light}>
          <Reveal>
            <h2 className={`h2 ${styles.sectionTitle}`}>Nələr daxildir</h2>
          </Reveal>
          <ul className={styles.includes}>
            {service.includes.map((item, i) => (
              <li key={item} className={styles.include}>
                <Reveal delay={(i % 2) * 100}>{item}</Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section id="diger" className={styles.light}>
          <Reveal>
            <h2 className={`h2 ${styles.sectionTitle}`}>Digər xidmətlər</h2>
          </Reveal>
          <div className={styles.grid}>
            {others.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 120} className={others.length % 2 === 1 && i === others.length - 1 ? styles.full : ""}>
                <PanelLink href={`/xidmetlerimiz/${s.slug}`} image={s.image} alt={s.label} kind="Xidmət" title={s.label} sizes="(min-width: 768px) 50vw, 100vw" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <JsonLdScript
        data={graph([
          ...pageNodes({
            base: site.url,
            path,
            name: service.label,
            description: service.description,
            image: service.image,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Xidmətlərimiz", path: "/xidmetlerimiz" },
              { name: service.label, path },
            ],
          }),
          {
            "@type": "Service",
            "@id": `${abs(path, site.url)}#service`,
            name: service.label,
            description: service.description,
            serviceType: company?.field,
            provider: { "@id": orgId(site.url) },
            areaServed: { "@type": "Country", name: "Azərbaycan" },
            image: abs(service.image, site.url),
            url: abs(path, site.url),
          },
        ])}
      />
    </>
  );
}
