import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { JsonLdScript } from "@/components/JsonLd";
import { faqItemsOf, getFaqGroups } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localHref } from "@/lib/i18n";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";
import { faqQuestions, graph, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs } = await pageContext(props.params, { kind: "faq" }, "/suallar");
  const t = getUi(lang).faqPage;
  return pageMetadata({ title: t.title, description: t.description, path: "/suallar", lang, langs });
}

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export default async function FaqPage(props: Props) {
  const { lang, switcher } = await pageContext(props.params, { kind: "faq" }, "/suallar");
  const faqGroups = await getFaqGroups(lang);
  const ui = getUi(lang);
  const t = ui.faqPage;
  const faqItems = faqItemsOf(faqGroups);
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={t.title} lead={t.lead} />

        <section className="section" aria-label={t.aria}>
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
                          <Link href={localHref(lang, item.link.href)} className={`link-arrow ${styles.more}`}>
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

        <ContactBlock lang={lang} />
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph([
          ...pageNodes({
            type: "FAQPage",
            lang,
            path: "/suallar",
            name: t.title,
            description: t.description,
            crumbs: [
              { name: ui.common.home, path: "/" },
              { name: t.title, path: "/suallar" },
            ],
            extra: { mainEntity: faqQuestions(faqItems) },
          }),
        ])}
      />
    </>
  );
}
