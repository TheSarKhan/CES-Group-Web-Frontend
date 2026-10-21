import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { ArrowRight, ArrowUpRight } from "@/components/Icons";
import { companies, projectApproach, projects } from "@/content/site";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

async function load({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return project;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const p = await load(props);
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/layiheler/${p.slug}` },
    openGraph: { images: [{ url: p.image }] },
  };
}

export default async function ProjectPage(props: Props) {
  const project = await load(props);
  const company = companies.find((c) => c.name === project.company);
  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 4);

  return (
    <>
      <Header />
      <main id="main">
        <section className={styles.hero}>
          <div className="container">
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <Link href="/">Ana səhifə</Link>
              <span aria-hidden="true">/</span>
              <Link href="/layiheler">Layihələr</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{project.title}</span>
            </nav>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.lead}>{project.summary}</p>
          </div>
        </section>

        <div className={styles.coverWrap}>
          <div className={`container ${styles.coverInner}`}>
            <div className={styles.cover}>
              <Image src={project.image} alt={project.alt} fill priority sizes="(max-width: 1280px) 100vw, 1240px" className={styles.coverImg} />
            </div>
          </div>
        </div>

        <section className="section" aria-labelledby="about-title">
          <div className={`container ${styles.about}`}>
            <div className={styles.text}>
              <h2 id="about-title" className="h2">
                Layihə haqqında
              </h2>
              {project.body.map((t, i) => (
                <p key={i} className="lead">
                  {t}
                </p>
              ))}
            </div>
            <dl className={styles.details}>
              <div className={styles.detail}>
                <dt>Şirkət</dt>
                <dd>{project.company}</dd>
              </div>
              <div className={styles.detail}>
                <dt>Kateqoriya</dt>
                <dd>{project.category}</dd>
              </div>
              <div className={styles.detail}>
                <dt>Yer</dt>
                <dd>{project.location}</dd>
              </div>
              {project.details.map((d) => (
                <div key={d.label} className={styles.detail}>
                  <dt>{d.label}</dt>
                  <dd className={d.value.startsWith("[") ? styles.todo : undefined}>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`section ${styles.white}`} aria-labelledby="approach-title">
          <div className="container">
            <h2 id="approach-title" className="h2">
              Necə işləyirik
            </h2>
            <ul className={styles.approach}>
              {projectApproach.map((a, i) => (
                <li key={a.title} className={styles.step}>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={styles.stepTitle}>{a.title}</h3>
                  <p className={styles.stepText}>{a.text}</p>
                </li>
              ))}
            </ul>
            {company && (
              <a href={company.url} className={`btn btn-dark ${styles.companyBtn}`}>
                {company.name} saytına keç <ArrowUpRight />
              </a>
            )}
          </div>
        </section>

        <section className={`section ${styles.more}`} aria-labelledby="more-title">
          <div className="container">
            <h2 id="more-title" className="h2">
              Digər layihələr
            </h2>
            <ul className={styles.moreGrid}>
              {others.map((p) => (
                <li key={p.slug} className={styles.card}>
                  <Link href={`/layiheler/${p.slug}`} className={styles.cardLink}>
                    <span className={styles.cardImg}>
                      <Image src={p.image} alt={p.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" />
                    </span>
                    <span className={styles.cardTitle}>{p.title}</span>
                    <span className={styles.cardMeta}>
                      {p.category} <ArrowRight size={14} />
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
