import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { subsites } from "@/content/subsites";
import { getSubSite } from "@/lib/subsite";
import { DetailHero } from "@/components/subsite/DetailHero";
import { PanelLink } from "@/components/subsite/PanelLink";
import { Reveal } from "@/components/subsite/Reveal";
import styles from "@/components/subsite/Pages.module.css";

type Props = { params: Promise<{ site: string; slug: string }> };

export function generateStaticParams() {
  return Object.keys(subsites).flatMap((site) => subsites[site as keyof typeof subsites].services.map((s) => ({ site, slug: s.slug })));
}

async function load({ params }: Props) {
  const { slug } = await params;
  const site = await getSubSite({ params });
  const service = site.services.find((s) => s.slug === slug);
  if (!service) notFound();
  return { site, service };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { service } = await load(props);
  return { title: service.label, description: service.description, alternates: { canonical: `/xidmetlerimiz/${service.slug}` } };
}

export default async function ServiceDetailPage(props: Props) {
  const { site, service } = await load(props);
  const others = site.services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <DetailHero
        image={service.image}
        alt={service.label}
        kicker="Xidmət"
        title={service.label}
        links={[{ href: "#haqqinda", label: "Xidmət haqqında" }, ...(others.length ? [{ href: "#diger", label: "Digər xidmətlər" }] : [])]}
      />

      <section id="haqqinda" className={styles.dark} data-header-theme="dark">
        <Reveal>
          <h2 className="h2">Xidmət haqqında</h2>
          <span className={styles.rule} aria-hidden="true" />
        </Reveal>
        <Reveal delay={150}>
          <p className={styles.darkText}>{service.description}</p>
        </Reveal>
      </section>

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
    </>
  );
}
