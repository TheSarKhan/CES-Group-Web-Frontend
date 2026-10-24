import Link from "next/link";
import { Header } from "./Header";
import { PageHero } from "./PageHero";
import { Footer } from "./Footer";
import { JsonLdScript } from "./JsonLd";
import type { LegalDoc } from "@/content/legal";
import { graph, pageNodes } from "@/lib/schema";
import styles from "./LegalPage.module.css";

/** Hüquqi mətn səhifəsi: başlıq, yenilənmə tarixi, mündəricat və bölmələr */
export function LegalPage({ doc, path }: { doc: LegalDoc; path: string }) {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero title={doc.title} lead={`Son yenilənmə: ${doc.updated}`} />
        <section className="section">
          <div className={`container ${styles.layout}`}>
            <nav className={styles.toc} aria-label="Mündəricat">
              <ul>
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.body}>
              <p className={styles.intro}>{doc.intro}</p>
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-title`}>
                  <h2 id={`${s.id}-title`} className={styles.h2}>
                    {s.title}
                  </h2>
                  {s.paragraphs?.map((p, i) => (
                    <p key={i} className={styles.p}>
                      {p}
                    </p>
                  ))}
                  {s.items && (
                    <ul className={styles.list}>
                      {s.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <p className={styles.p}>
                <Link href={path === "/mexfilik-siyaseti" ? "/istifade-sertleri" : "/mexfilik-siyaseti"} className="link-underline">
                  {path === "/mexfilik-siyaseti" ? "İstifadə şərtləri" : "Məxfilik siyasəti"}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLdScript
        data={graph(
          pageNodes({
            path,
            name: doc.title,
            description: doc.description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: doc.title, path },
            ],
          }),
        )}
      />
    </>
  );
}
