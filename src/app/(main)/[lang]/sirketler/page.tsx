import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLdScript } from "@/components/JsonLd";
import { ArrowRight, ArrowUpRight, BuildIcon, CraneIcon, DesignIcon } from "@/components/Icons";
import { getCompanies, getCompanyPages, getJourney } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { localePath } from "@/lib/i18n";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";
import { abs, graph, itemList, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, langs } = await pageContext(props.params, { kind: "companies" }, "/sirketler");
  const t = getUi(lang).companiesPage;
  return pageMetadata({ title: t.title, description: t.description, path: "/sirketler", lang, langs });
}

const pathIcons = { design: DesignIcon, build: BuildIcon, crane: CraneIcon } as const;
// Layihənin yolu: dizayn, tikinti, texnika (Farmart ayrı istiqamətdir)
export default async function CompaniesPage(props: Props) {
  const { lang, switcher } = await pageContext(props.params, { kind: "companies" }, "/sirketler");
  const [companies, companyPages, journey] = await Promise.all([getCompanies(lang), getCompanyPages(lang), getJourney(lang)]);
  const ui = getUi(lang);
  const t = ui.companiesPage;
  const pathSteps = journey.filter((j) => j.id !== "farmart" && j.id !== "equipment").concat(journey.filter((j) => j.id === "equipment"));
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={t.title} lead={t.lead} />

        <section className="section" aria-label={t.listAria}>
          <div className="container">
            <ul className={styles.list}>
              {companies.map((c, i) => (
                <li key={c.id} className={styles.row}>
                  <div className={styles.img}>
                    <Image
                      src={c.image}
                      alt={c.imageAlt}
                      fill
                      priority={i < 2}
                      sizes="(max-width: 899px) 100vw, 45vw"
                      style={c.focus ? { objectPosition: c.focus } : undefined}
                    />
                  </div>
                  <div className={styles.body}>
                    <span className={styles.field}>{c.field}</span>
                    <h2 className={styles.name} title={c.name}>
                      {c.shortName}
                    </h2>
                    <p className={styles.tagline}>{companyPages[c.id].tagline}</p>
                    <p className={styles.text}>{c.description}</p>
                    <div className={styles.links}>
                      <Link href={localePath(lang, `/sirketler/${c.id}`)} className="btn btn-dark">
                        {ui.common.more} <ArrowRight />
                      </Link>
                      <a href={c.url} className="link-arrow">
                        {ui.common.companySite} <ArrowUpRight />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="path-title">
          <div className="container">
            <h2 id="path-title" className={styles.h2}>
              {t.pathTitle}
            </h2>
            <ol className={styles.path}>
              {pathSteps.map((s, i) => {
                const c = companies.find((x) => x.id === s.id)!;
                const Icon = pathIcons[s.icon as keyof typeof pathIcons];
                return (
                  <li key={s.id} className={styles.step}>
                    <span className={styles.stepIcon}>{Icon && <Icon size={28} />}</span>
                    <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={styles.stepTitle}>
                      <Link href={localePath(lang, `/sirketler/${c.id}`)} title={c.name}>
                        {c.shortName}
                      </Link>
                    </h3>
                    <p className={styles.stepText}>{s.points.join(", ")}.</p>
                  </li>
                );
              })}
            </ol>
            <p className={styles.pathNote}>{t.pathNote}</p>
          </div>
        </section>

        <ContactBlock lang={lang} />
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "CollectionPage",
            lang,
            path: "/sirketler",
            name: t.title,
            description: t.description,
            crumbs: [
              { name: ui.common.home, path: "/" },
              { name: t.title, path: "/sirketler" },
            ],
            extra: { mainEntity: itemList(companies.map((c) => ({ name: c.name, url: abs(localePath(lang, `/sirketler/${c.id}`)) }))) },
          }),
        )}
      />
    </>
  );
}
