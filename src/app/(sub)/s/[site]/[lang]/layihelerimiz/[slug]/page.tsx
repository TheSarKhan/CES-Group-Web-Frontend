import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubSiteContent } from "@/content/loaders";
import { isReadyProject, isTbd, subsiteIds } from "@/content/subsites";
import { subContext } from "@/lib/subsite";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { DetailHero } from "@/components/subsite/DetailHero";
import { Gallery } from "@/components/subsite/Gallery";
import { SetSwitcher } from "@/components/subsite/SwitchContext";
import { Reveal } from "@/components/subsite/Reveal";
import styles from "@/components/subsite/Pages.module.css";

type Props = { params: Promise<{ site: string; lang: string; slug: string }> };

export async function generateStaticParams() {
  const all = await Promise.all(subsiteIds.map(async (site) => (await getSubSiteContent(site)).projects.map((p) => ({ site, lang: "az", slug: p.slug }))));
  return all.flat();
}

async function load({ params }: Props) {
  const { slug } = await params;
  const ctx = await subContext(params, { kind: "project", slug }, `/layihelerimiz/${slug}`);
  const { site } = ctx;
  const index = site.projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  return { ...ctx, project: site.projects[index], next: site.projects.length > 1 ? site.projects[(index + 1) % site.projects.length] : null };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { site, project, lang, langs, t } = await load(props);
  return pageMetadata({
    title: project.title,
    description: isReadyProject(project) ? project.description : t.sub.projectFallbackDescription(site.name, project.title),
    path: `/layihelerimiz/${project.slug}`,
    siteName: site.name,
    image: { url: project.image },
    // Təsviri yazılmayan layihə səhifəsi axtarışa açılmır
    noindex: !isReadyProject(project),
    lang,
    langs,
  });
}

export default async function ProjectDetailPage(props: Props) {
  const { site, project, next, lang, switcher, t } = await load(props);
  const specs = [
    { label: t.sub.specClient, value: project.client },
    { label: t.sub.specType, value: project.category },
    { label: t.sub.specDuration, value: project.duration },
    { label: t.sub.specArea, value: project.area },
  ].filter((s) => s.value && !isTbd(s.value));

  return (
    <>
      <SetSwitcher {...switcher} />
      <DetailHero
        image={project.image}
        alt={project.title}
        lang={lang}
        kicker={t.sub.projectKind}
        title={project.title}
        links={[
          { href: "#haqqinda", label: t.sub.projectAbout },
          { href: "#spesifikasiyalar", label: t.sub.specs },
          ...(project.gallery.length ? [{ href: "#qalereya", label: t.sub.galleryTitle }] : []),
        ]}
      />

      <section id="haqqinda" className={styles.dark} data-header-theme="dark">
        <Reveal>
          <h2 className="h2">{t.sub.projectAbout}</h2>
          <span className={styles.rule} aria-hidden="true" />
        </Reveal>
        <Reveal delay={150}>
          <p className={styles.darkText}>{project.description}</p>
        </Reveal>
      </section>

      <section id="spesifikasiyalar" className={`${styles.light} ${styles.center}`}>
        <Reveal>
          <h2 className="h2">{t.sub.specs}</h2>
        </Reveal>
        <div className={styles.specs}>
          {specs.map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <div className={styles.spec}>
                <p className={styles.specLabel}>{s.label}</p>
                <p className={styles.specValue}>{s.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section id="qalereya" className={styles.light}>
          <Reveal>
            <h2 className={`h2 ${styles.sectionTitle}`}>{t.sub.galleryTitle}</h2>
          </Reveal>
          <Gallery images={project.gallery} title={project.title} lang={lang} />
        </section>
      )}

      <JsonLdScript
        data={graph(
          pageNodes({
            base: site.url,
            lang,
            path: `/layihelerimiz/${project.slug}`,
            name: project.title,
            description: project.description,
            image: project.image,
            crumbs: [
              { name: t.common.home, path: "/" },
              { name: t.sub.projects, path: "/layihelerimiz" },
              { name: project.title, path: `/layihelerimiz/${project.slug}` },
            ],
          }),
        )}
      />

      {next && (
        <Link href={localePath(lang, `/layihelerimiz/${next.slug}`)} className={styles.next} data-header-theme="dark">
          <Image src={next.image} alt="" fill sizes="100vw" quality={70} className={styles.nextImg} />
          <span className={styles.nextShade} aria-hidden="true" />
          <span className={styles.nextBody}>
            <span className={styles.nextKind}>{t.sub.nextProject}</span>
            <span className={styles.nextTitle}>{next.title}</span>
            <span className={styles.nextArrow} aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      )}
    </>
  );
}
