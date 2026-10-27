import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { JsonLdScript } from "@/components/JsonLd";
import { ArrowRight, ArrowUpRight, CheckIcon } from "@/components/Icons";
import { isCompanyId } from "@/content/companies";
import { getCompanies, getCompanyPages, getFaqGroups, getJourney, getSiteSettings } from "@/content/loaders";
import { companies as staticCompanies } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { companyNode, graph, pageNodes } from "@/lib/schema";
import styles from "../page.module.css";

type Props = { params: Promise<{ company: string }> };

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export function generateStaticParams() {
  return staticCompanies.map((c) => ({ company: c.id }));
}

async function load({ params }: Props) {
  const { company: id } = await params;
  if (!isCompanyId(id)) notFound();
  const [companies, pages] = await Promise.all([getCompanies(), getCompanyPages()]);
  const company = companies.find((c) => c.id === id)!;
  return { company, page: pages[id], companies };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { company, page } = await load(props);
  return pageMetadata({
    title: `${company.name}: ${company.field}`,
    description: page.metaDescription,
    path: `/sirketler/${company.id}`,
    image: { url: company.image, alt: company.imageAlt },
  });
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

function LinkOrA({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return isExternal(href) ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function CompanyPage(props: Props) {
  const { company, page, companies } = await load(props);
  const faq = (await getFaqGroups()).find((g) => g.id === company.id);
  const settings = await getSiteSettings();
  const others = companies.filter((c) => c.id !== company.id);
  const path = `/sirketler/${company.id}`;
  const facts = [
    { label: "Hüquqi ad", value: company.legalName },
    { label: "Yaradılıb", value: company.id === "equipment" ? "2020" : company.founded },
    ...page.facts,
  ];

  return (
    <>
      <Header />
      <main id="main">
        <PageHero title={company.name} lead={page.tagline} />

        <section className="section" aria-labelledby="about-title">
          <div className={`container ${styles.about}`}>
            <div className={styles.aboutText}>
              <h2 id="about-title" className={styles.h2}>
                {company.field}
              </h2>
              {page.about.map((t, i) => (
                <p key={i} className={styles.lead}>
                  {t}
                </p>
              ))}
              <div className={styles.links}>
                <Link href={`/elaqe?sirket=${company.id}`} className="btn btn-gold">
                  Müraciət göndər <ArrowRight />
                </Link>
                <a href={company.url} className="link-arrow">
                  {company.name} saytı <ArrowUpRight />
                </a>
              </div>
            </div>
            <dl className={styles.facts}>
              {facts.map((f) => (
                <div key={f.label} className={styles.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="services-title">
          <div className="container">
            <h2 id="services-title" className={styles.h2}>
              {page.servicesTitle}
            </h2>
            <ul className={styles.cards}>
              {page.services.map((s) => (
                <li key={s.name} className={styles.card}>
                  <h3 className={styles.cardTitle}>{s.href ? <a href={s.href}>{s.name}</a> : s.name}</h3>
                  {s.text && <p className={styles.cardText}>{s.text}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {page.terms && (
          <section className="section" aria-labelledby="terms-title">
            <div className="container">
              <h2 id="terms-title" className={styles.h2}>
                İcarə şərtləri
              </h2>
              <ul className={styles.terms}>
                {page.terms.map((t) => (
                  <li key={t} className={styles.term}>
                    <CheckIcon size={20} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {page.projects.length > 0 && (
          <section className={`section ${page.terms ? styles.white : ""}`} aria-labelledby="projects-title">
            <div className="container">
              <h2 id="projects-title" className={styles.h2}>
                {page.projectsTitle}
              </h2>
              <ul className={styles.projects}>
                {page.projects.map((p) => (
                  <li key={p.title} className={styles.project}>
                    <LinkOrA href={p.href}>
                      <span className={styles.pImg}>
                        <Image src={p.image} alt={p.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
                      </span>
                      <span className={styles.pCat}>{p.category}</span>
                      <h3 className={styles.pTitle}>{p.title}</h3>
                    </LinkOrA>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {faq && faq.items.length > 0 && (
          <section className={`section ${page.projects.length > 0 && !page.terms ? "" : styles.white}`} aria-labelledby="faq-title">
            <div className="container">
              <h2 id="faq-title" className={styles.h2}>
                Tez-tez verilən suallar
              </h2>
              <ul className={styles.faq}>
                {faq.items.slice(0, 6).map((f) => (
                  <li key={f.q} className={styles.faqItem}>
                    <h3 className={styles.q}>{f.q}</h3>
                    <p className={styles.a}>{f.a}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.links}>
                <Link href={`/suallar#${company.id}`} className="link-arrow">
                  Bütün suallar <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className={`section ${styles.cta}`} aria-labelledby="cta-title">
          <div className="container">
            <div className={styles.ctaInner}>
              <h2 id="cta-title" className={styles.ctaTitle}>
                {company.name} ilə əlaqə
              </h2>
              <p className={styles.ctaText}>Müraciətinizi göndərin, sorğunuz birbaşa {company.name} komandasına yönləndirilsin.</p>
              <div className={styles.ctaActions}>
                <Link href={`/elaqe?sirket=${company.id}`} className="btn btn-gold">
                  Müraciət göndər <ArrowRight />
                </Link>
                <a href={company.url} className={`link-arrow ${styles.ctaLink}`}>
                  {company.name} saytına keç <ArrowUpRight />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="others-title">
          <div className="container">
            <h2 id="others-title" className={styles.h2}>
              Digər şirkətlər
            </h2>
            <ul className={styles.others}>
              {others.map((c) => (
                <li key={c.id} className={styles.other}>
                  <Link href={`/sirketler/${c.id}`}>
                    <span className={styles.oName} title={c.name}>
                      {c.shortName}
                    </span>
                    <span className={styles.oField}>{c.field}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLdScript
        data={graph([
          ...pageNodes({
            path,
            name: `${company.name}: ${company.field}`,
            description: page.metaDescription,
            image: company.image,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Şirkətlər", path: "/sirketler" },
              { name: company.name, path },
            ],
            extra: { about: { "@id": companyNode(company)["@id"] } },
          }),
          companyNode(company, { contact: true, settings, points: (await getJourney()).find((j) => j.id === company.id)?.points }),
        ])}
      />
    </>
  );
}
