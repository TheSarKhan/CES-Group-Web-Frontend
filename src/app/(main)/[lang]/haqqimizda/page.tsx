import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { Stats } from "@/components/Stats";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowUpRight } from "@/components/Icons";
import { JsonLdScript } from "@/components/JsonLd";
import { getAbout, getCompanies } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs } = await pageContext(props.params, { kind: "about" }, "/haqqimizda");
  const t = getUi(lang).aboutPage;
  return pageMetadata({ title: t.title, description: t.description, path: "/haqqimizda", lang, langs });
}

export default async function AboutPage(props: Props) {
  const { lang, switcher } = await pageContext(props.params, { kind: "about" }, "/haqqimizda");
  const [about, companies] = await Promise.all([getAbout(lang), getCompanies(lang)]);
  const ui = getUi(lang);
  const t = ui.aboutPage;
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={t.title} lead={about.lead} />

        <section className="section">
          <div className={`container ${styles.mv}`}>
            <div className={styles.mvItem}>
              <h2 className={styles.kicker}>{t.mission}</h2>
              <p className={styles.statement}>{about.mission}</p>
            </div>
            <div className={styles.mvItem}>
              <h2 className={styles.kicker}>{t.vision}</h2>
              <p className={styles.statement}>{about.vision}</p>
            </div>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="structure-title">
          <div className="container">
            <div className="section-head">
              <h2 id="structure-title" className="h2">
                {t.structure}
              </h2>
              <p className="lead" style={{ maxWidth: 420 }}>
                {t.structureLead}
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
                    {ui.common.goToSite} <ArrowUpRight />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="values-title">
          <div className="container">
            <h2 id="values-title" className="h2">
              {t.values}
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
              {t.timeline}
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

        <Stats lang={lang} />
        <ContactBlock lang={lang} />
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "AboutPage",
            lang,
            path: "/haqqimizda",
            name: t.title,
            description: t.description,
            crumbs: [
              { name: ui.common.home, path: "/" },
              { name: t.title, path: "/haqqimizda" },
            ],
          }),
        )}
      />
    </>
  );
}
