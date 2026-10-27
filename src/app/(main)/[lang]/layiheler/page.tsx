import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowRight, PinIcon, TagIcon } from "@/components/Icons";
import { JsonLdScript } from "@/components/JsonLd";
import { getProjects } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localePath } from "@/lib/i18n";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes, projectsItemList } from "@/lib/schema";
import styles from "./page.module.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs } = await pageContext(props.params, { kind: "projects" }, "/layiheler");
  const t = getUi(lang).projectsPage;
  return pageMetadata({ title: t.title, description: t.description, path: "/layiheler", lang, langs });
}

export default async function ProjectsPage(props: Props) {
  const { lang, switcher } = await pageContext(props.params, { kind: "projects" }, "/layiheler");
  const projects = await getProjects(lang);
  const ui = getUi(lang);
  const t = ui.projectsPage;
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={t.title} lead={t.lead} />

        <section className="section" aria-label={t.listAria}>
          <div className="container">
            <ul className={styles.grid}>
              {projects.map((p, i) => (
                <li key={p.slug} className={styles.card}>
                  <Link href={localePath(lang, `/layiheler/${p.slug}`)} className={styles.link}>
                    <span className={styles.img}>
                      <Image
                        src={p.image}
                        alt={p.alt}
                        fill
                        priority={i < 3}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      />
                    </span>
                    <span className={styles.meta}>
                      <span className={styles.metaItem}>
                        <TagIcon size={15} />
                        {p.category}
                      </span>
                      <span className={styles.metaItem}>
                        <PinIcon size={15} />
                        {p.location}
                      </span>
                    </span>
                    <span className={styles.title}>{p.title}</span>
                    <span className={styles.summary}>{p.summary}</span>
                    <span className={styles.more}>
                      {ui.common.more} <ArrowRight size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactBlock lang={lang} />
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph([
          ...pageNodes({
            type: "CollectionPage",
            lang,
            path: "/layiheler",
            name: t.title,
            description: t.description,
            crumbs: [
              { name: ui.common.home, path: "/" },
              { name: t.title, path: "/layiheler" },
            ],
            extra: { mainEntity: projectsItemList(projects, lang) },
          }),
        ])}
      />
    </>
  );
}
