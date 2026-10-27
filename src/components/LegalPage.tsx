import Link from "next/link";
import { Header, type LangSwitch } from "./Header";
import { PageHero } from "./PageHero";
import { Footer } from "./Footer";
import { JsonLdScript } from "./JsonLd";
import type { LegalDoc } from "@/content/legal";
import { getUi } from "@/i18n/ui";
import { localePath, type Lang } from "@/lib/i18n";
import { graph, pageNodes } from "@/lib/schema";
import styles from "./LegalPage.module.css";

/** Hüquqi mətn səhifəsi: başlıq, yenilənmə tarixi, mündəricat və bölmələr */
export function LegalPage({ doc, path, lang = "az", switcher }: { doc: LegalDoc; path: string; lang?: Lang; switcher?: LangSwitch }) {
  const t = getUi(lang);
  return (
    <>
      <Header lang={lang} switcher={switcher} />
      <main id="main">
        <PageHero title={doc.title} lead={`${t.legal.updated} ${doc.updated}`} />
        <section className="section">
          <div className={`container ${styles.layout}`}>
            <nav className={styles.toc} aria-label={t.legal.toc}>
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
                <Link href={localePath(lang, path === "/mexfilik-siyaseti" ? "/istifade-sertleri" : "/mexfilik-siyaseti")} className="link-underline">
                  {path === "/mexfilik-siyaseti" ? t.footer.terms : t.footer.privacy}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      <JsonLdScript
        data={graph(
          pageNodes({
            lang,
            path,
            name: doc.title,
            description: doc.description,
            crumbs: [
              { name: t.common.home, path: "/" },
              { name: doc.title, path },
            ],
          }),
        )}
      />
    </>
  );
}
