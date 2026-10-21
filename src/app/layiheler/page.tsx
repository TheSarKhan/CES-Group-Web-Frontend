import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { projects } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Layihələr",
  description: "CES Group şirkətlərinin iştirak etdiyi layihələr: beynəlxalq tədbirlər, kommersiya obyektləri və infrastruktur.",
  alternates: { canonical: "/layiheler" },
};

export default function ProjectsPage() {
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
                      {p.category} · {p.location}
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
    </>
  );
}
