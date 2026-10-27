import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isReadyProject } from "@/content/subsites";
import { subContext, type SubPageParams } from "@/lib/subsite";
import { localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { CharTitle } from "@/components/subsite/CharTitle";
import { PanelLink } from "@/components/subsite/PanelLink";
import { SetSwitcher } from "@/components/subsite/SwitchContext";
import { Reveal } from "@/components/subsite/Reveal";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

const load = ({ params }: SubPageParams) => subContext(params, { kind: "projects" }, "/layihelerimiz");

export async function generateMetadata(props: SubPageParams): Promise<Metadata> {
  const { site, lang, langs, t } = await load(props);
  return pageMetadata({
    title: t.sub.projects,
    description: t.sub.projectsDescription(site.name),
    path: "/layihelerimiz",
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
    lang,
    langs,
    // Layihə təsvirləri yazılana qədər siyahı axtarışa açılmır
    noindex: !site.projects.some(isReadyProject),
  });
}

export default async function ProjectsPage(props: SubPageParams) {
  const { site: { projects }, lang, switcher, t } = await load(props);
  if (projects.length === 0) notFound();
  return (
    <section className={styles.list}>
      <SetSwitcher {...switcher} />
      <Breadcrumb items={[{ label: t.common.home, href: localePath(lang, "/") }, { label: t.sub.projects }]} />
      <div className={styles.head}>
        <CharTitle text={t.sub.projects} step={35} className={styles.title} />
        <p className={`${styles.count} ${anim.in}`} style={{ animationDelay: "450ms" }}>
          {t.sub.projectCount(String(projects.length).padStart(2, "0"))}
        </p>
      </div>
      <div className={styles.grid}>
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 80}>
            <PanelLink
              href={localePath(lang, `/layihelerimiz/${p.slug}`)}
              image={p.image}
              alt={p.title}
              kind={t.sub.projectKind}
              title={p.title}
              index={i}
              meta={p.category}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={i < 2}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
