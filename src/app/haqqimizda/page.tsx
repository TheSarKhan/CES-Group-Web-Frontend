import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { Stats } from "@/components/Stats";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowUpRight } from "@/components/Icons";
import { about, companies } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Haqqımızda",
  description: about.lead,
  alternates: { canonical: "/haqqimizda" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero title="Haqqımızda" lead={about.lead} />

        <section className="section">
          <div className={`container ${styles.mv}`}>
            <div className={styles.mvItem}>
              <h2 className={styles.kicker}>Missiyamız</h2>
              <p className={styles.statement}>{about.mission}</p>
            </div>
            <div className={styles.mvItem}>
              <h2 className={styles.kicker}>Vizyonumuz</h2>
              <p className={styles.statement}>{about.vision}</p>
            </div>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="structure-title">
          <div className="container">
            <div className="section-head">
              <h2 id="structure-title" className="h2">
                Qrupun strukturu
              </h2>
              <p className="lead" style={{ maxWidth: 420 }}>
                Hər şirkət öz sahəsində müstəqil işləyir, böyük layihələrdə isə bir komanda kimi birləşir.
              </p>
            </div>
            <ul className={styles.companies}>
              {companies.map((c) => (
                <li key={c.id} className={styles.company}>
                  <div className={styles.cImg}>
                    <Image src={c.image} alt={c.imageAlt} fill sizes="(max-width: 767px) 100vw, 280px" />
                  </div>
                  <div className={styles.cBody}>
                    <h3 className={styles.cName}>{c.name}</h3>
                    <span className={styles.cField}>{c.field}</span>
                    <p className={styles.cText}>{c.description}</p>
                  </div>
                  <a href={c.url} className={`link-arrow ${styles.cLink}`}>
                    Sayta keç <ArrowUpRight />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="values-title">
          <div className="container">
            <h2 id="values-title" className="h2">
              Dəyərlərimiz
            </h2>
            <ul className={styles.values}>
              {about.values.map((v) => (
                <li key={v.title} className={styles.value}>
                  <h3 className={styles.vTitle}>{v.title}</h3>
                  <p className={styles.vText}>{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="timeline-title">
          <div className={`container ${styles.tlGrid}`}>
            <h2 id="timeline-title" className="h2">
              Yolumuz
            </h2>
            <ol className={styles.timeline}>
              {about.timeline.map((t, i) => (
                <li key={i} className={styles.tlItem}>
                  <span className={styles.tlYear}>{t.year}</span>
                  <p className={styles.tlText}>{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Stats />
        <ContactBlock />
      </main>
      <Footer />
    </>
  );
}
