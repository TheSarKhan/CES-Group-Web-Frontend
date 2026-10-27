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
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes, projectsItemList } from "@/lib/schema";
import styles from "./page.module.css";

const description =
  "CES Group şirkətlərinin iştirak etdiyi layihələr: Formula 1, COP29, Port Baku, Crescent Mall və Qarabağ infrastrukturu üçün texnika təminatı.";

export const metadata: Metadata = pageMetadata({ title: "Layihələr", description, path: "/layiheler" });

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <Header />
      <main id="main">
        <PageHero title="Layihələr" lead="Beynəlxalq tədbirlərdən infrastruktur işlərinə qədər iştirak etdiyimiz layihələr." />

        <section className="section" aria-label="Layihələrin siyahısı">
          <div className="container">
            <ul className={styles.grid}>
              {projects.map((p, i) => (
                <li key={p.slug} className={styles.card}>
                  <Link href={`/layiheler/${p.slug}`} className={styles.link}>
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
                      Ətraflı <ArrowRight size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactBlock />
      </main>
      <Footer />
      <JsonLdScript
        data={graph([
          ...pageNodes({
            type: "CollectionPage",
            path: "/layiheler",
            name: "Layihələr",
            description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Layihələr", path: "/layiheler" },
            ],
            extra: { mainEntity: projectsItemList(projects) },
          }),
        ])}
      />
    </>
  );
}
