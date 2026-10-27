import type { Metadata } from "next";
import { subContext, type SubPageParams } from "@/lib/subsite";
import { getSiteSettings } from "@/content/loaders";
import { localePath } from "@/lib/i18n";
import { tel } from "@/lib/tel";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/subsite/Breadcrumb";
import { SetSwitcher } from "@/components/subsite/SwitchContext";
import { ContactForm } from "@/components/ContactForm";
import anim from "@/components/subsite/Anim.module.css";
import styles from "@/components/subsite/Pages.module.css";

const load = async ({ params }: SubPageParams) => {
  const ctx = await subContext(params, { kind: "contact" }, "/elaqe");
  return { ...ctx, group: await getSiteSettings(ctx.lang) };
};

export async function generateMetadata(props: SubPageParams): Promise<Metadata> {
  const { site, group, lang, langs, t } = await load(props);
  return pageMetadata({
    title: t.contactPage.title,
    description: t.sub.contactDescription(site.name, group.phone, group.email, group.address),
    path: "/elaqe",
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
    lang,
    langs,
  });
}

export default async function ContactPage(props: SubPageParams) {
  const { site, group, lang, switcher, t } = await load(props);
  const q = encodeURIComponent(group.mapQuery);

  return (
    <>
      <SetSwitcher {...switcher} />
      <section className={styles.contactInfo} data-header-theme="dark">
        <div className={styles.breadcrumb}>
          <Breadcrumb light items={[{ label: t.common.home, href: localePath(lang, "/") }, { label: t.contactPage.title }]} />
        </div>
        <h1 className={`${styles.contactTitle} ${anim.in}`}>{t.contactPage.title}</h1>
        <div className={`${styles.contactLines} ${anim.in}`} style={{ animationDelay: "150ms" }}>
          <p>{group.address}</p>
          <p>{group.hours.label}</p>
          <p>
            <a href={tel(group.phone)}>{group.phone}</a>
          </p>
          <p>
            <a href={group.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp: {group.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${group.email}`}>{group.email}</a>
          </p>
        </div>
      </section>

      <section className={styles.light}>
        <div className={styles.formWrap}>
          <h2 className={styles.formTitle}>{t.contactPage.formTitle}</h2>
          <ContactForm company={site.id} lang={lang} />
        </div>
      </section>

      <section className={styles.map}>
        <iframe title={t.sub.mapTitle(site.name)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${q}&output=embed`} />
        <a className={styles.mapLink} href={group.mapUrl} target="_blank" rel="noopener noreferrer">
          <span>{group.mapQuery.split(",")[0]}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <JsonLdScript
        data={graph(
          pageNodes({
            type: "ContactPage",
            base: site.url,
            lang,
            path: "/elaqe",
            name: t.contactPage.title,
            description: t.sub.contactAbout(site.name),
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
