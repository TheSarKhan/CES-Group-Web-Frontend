import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { GroupContacts } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLdScript } from "@/components/JsonLd";
import { getSiteSettings } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

type Props = { params: Promise<{ lang: string }> };

const load = async (props: Props) => {
  const ctx = await pageContext(props.params, { kind: "contact" }, "/elaqe");
  const site = await getSiteSettings(ctx.lang);
  return { ...ctx, t: getUi(ctx.lang), description: getUi(ctx.lang).contactPage.description(site.phone, site.email, site.address) };
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs, t, description } = await load(props);
  return pageMetadata({ title: t.contactPage.title, description, path: "/elaqe", lang, langs });
}

export default async function ContactPage(props: Props) {
  const { lang, switcher, t, description } = await load(props);
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={t.contactPage.title} lead={t.contactPage.lead} />
        <section className="section">
          <div className={`container ${styles.grid}`}>
            <div className={styles.formCard}>
              <h2 className={styles.title}>{t.contactPage.formTitle}</h2>
              <ContactForm lang={lang} />
            </div>
            <aside className={styles.aside} aria-labelledby="contacts">
              <h2 id="contacts" className={styles.title}>
                {t.contactPage.infoTitle}
              </h2>
              <GroupContacts lang={lang} />
            </aside>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "ContactPage",
            lang,
            path: "/elaqe",
            name: t.contactPage.title,
            description,
            crumbs: [
              { name: t.common.home, path: "/" },
              { name: t.contactPage.title, path: "/elaqe" },
            ],
          }),
        )}
      />
    </>
  );
}
