import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { JsonLdScript } from "@/components/JsonLd";
import { faqGroups, faqItems } from "@/content/faq";
import { pageMetadata } from "@/lib/seo";
import { faqQuestions, graph, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

const description =
  "CES Group, texnika icarəsi, memarlıq, tikinti və Farmart ekosistemi üzrə tez-tez verilən suallar: icarə şərtləri, çatdırılma, ödəniş, xidmət ərazisi və əlaqə.";

export const metadata: Metadata = pageMetadata({ title: "Tez-tez verilən suallar", description, path: "/suallar" });

export default function FaqPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero title="Tez-tez verilən suallar" lead="Texnika icarəsi, layihələndirmə, tikinti və Farmart üzrə ən çox verilən suallara qısa cavablar." />

        <section className="section" aria-label="Suallar və cavablar">
          <div className="container">
            {faqGroups.map((g) => (
              <section key={g.id} id={g.id} className={styles.group} aria-labelledby={`${g.id}-title`}>
                <div className={styles.head}>
                  <h2 id={`${g.id}-title`} className={styles.groupTitle}>
                    {g.title}
                  </h2>
                  <p className={styles.groupLead}>{g.lead}</p>
                </div>
                <ul className={styles.items}>
                  {g.items.map((item) => (
                    <li key={item.q} className={styles.item}>
                      <h3 className={styles.q}>{item.q}</h3>
                      <p className={styles.a}>{item.a}</p>
                      {item.link &&
                        (item.link.href.startsWith("/") ? (
                          <Link href={item.link.href} className={`link-arrow ${styles.more}`}>
                            {item.link.label} <ArrowRight />
                          </Link>
                        ) : (
                          <a href={item.link.href} className={`link-arrow ${styles.more}`}>
                            {item.link.label} <ArrowRight />
                          </a>
                        ))}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <ContactBlock />
      </main>
      <Footer />
      <JsonLdScript
        data={graph([
          ...pageNodes({
            type: "FAQPage",
            path: "/suallar",
            name: "Tez-tez verilən suallar",
            description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Tez-tez verilən suallar", path: "/suallar" },
            ],
            extra: { mainEntity: faqQuestions(faqItems) },
          }),
        ])}
      />
    </>
  );
}
