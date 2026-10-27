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
import { pageMetadata } from "@/lib/seo";
import { abs, graph, itemList, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

const description =
  "CES Group şirkətləri: CES Equipment (texnika icarəsi), CES Architect (memarlıq və dizayn), CES Construction (tikinti və podrat) və Farmart (innovativ və təbii ekosistem).";

export const metadata: Metadata = pageMetadata({ title: "Şirkətlər", description, path: "/sirketler" });

const pathIcons = { design: DesignIcon, build: BuildIcon, crane: CraneIcon } as const;
// Layihənin yolu: dizayn, tikinti, texnika (Farmart ayrı istiqamətdir)
export default async function CompaniesPage() {
  const [companies, companyPages, journey] = await Promise.all([getCompanies(), getCompanyPages(), getJourney()]);
  const pathSteps = journey.filter((j) => j.id !== "farmart" && j.id !== "equipment").concat(journey.filter((j) => j.id === "equipment"));
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          title="Şirkətlər"
          lead="CES Group dörd şirkəti birləşdirir. Hər biri öz sahəsində müstəqil işləyir, böyük layihələrdə isə bir komanda kimi çalışır."
        />

        <section className="section" aria-label="Şirkətlərin siyahısı">
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
                      <Link href={`/sirketler/${c.id}`} className="btn btn-dark">
                        Ətraflı <ArrowRight />
                      </Link>
                      <a href={c.url} className="link-arrow">
                        Şirkətin saytı <ArrowUpRight />
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
              Layihənin yolu
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
                      <Link href={`/sirketler/${c.id}`} title={c.name}>
                        {c.shortName}
                      </Link>
                    </h3>
                    <p className={styles.stepText}>{s.points.join(", ")}.</p>
                  </li>
                );
              })}
            </ol>
            <p className={styles.pathNote}>
              Dizayndan təhvilə qədər bütün mərhələlər qrup daxilində əlaqələndirilir, sifarişçi isə tək məsuliyyətlə işləyir. Farmart isə qrupun
              ayrıca innovativ və təbii ekosistem istiqamətidir.
            </p>
          </div>
        </section>

        <ContactBlock />
      </main>
      <Footer />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "CollectionPage",
            path: "/sirketler",
            name: "Şirkətlər",
            description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Şirkətlər", path: "/sirketler" },
            ],
            extra: { mainEntity: itemList(companies.map((c) => ({ name: c.name, url: abs(`/sirketler/${c.id}`) }))) },
          }),
        )}
      />
    </>
  );
}
