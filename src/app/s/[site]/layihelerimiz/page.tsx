import type { Metadata } from "next";
import { isReadyProject } from "@/content/subsites";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { CharTitle } from "@/components/subsite/CharTitle";
import { PanelLink } from "@/components/subsite/PanelLink";
import { Reveal } from "@/components/subsite/Reveal";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return pageMetadata({
    title: "Layihələrimiz",
    description: `${site.name} tərəfindən icra olunan layihələr.`,
    path: "/layihelerimiz",
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
    // Layihə təsvirləri yazılana qədər siyahı axtarışa açılmır
    noindex: !site.projects.some(isReadyProject),
  });
}

export default async function ProjectsPage(props: SubSiteParams) {
  const { projects } = await getSubSite(props);
  return (
    <section className={styles.list}>
      <Breadcrumb items={[{ label: "Ana səhifə", href: "/" }, { label: "Layihələrimiz" }]} />
      <div className={styles.head}>
        <CharTitle text="Layihələrimiz" step={35} className={styles.title} />
        <p className={`${styles.count} ${anim.in}`} style={{ animationDelay: "450ms" }}>
          {String(projects.length).padStart(2, "0")} layihə
        </p>
      </div>
      <div className={styles.grid}>
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 80}>
            <PanelLink
              href={`/layihelerimiz/${p.slug}`}
              image={p.image}
              alt={p.title}
              kind="Layihə"
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
