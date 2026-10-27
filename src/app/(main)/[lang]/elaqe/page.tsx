import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { GroupContacts } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLdScript } from "@/components/JsonLd";
import { getSiteSettings } from "@/content/loaders";
import { pageMetadata } from "@/lib/seo";
import { graph, pageNodes } from "@/lib/schema";
import styles from "./page.module.css";

const describe = (site: Awaited<ReturnType<typeof getSiteSettings>>) => `CES Group ilə əlaqə: müraciət forması, ${site.phone}, ${site.email}. Ünvan: ${site.address}.`;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "Əlaqə", description: describe(await getSiteSettings()), path: "/elaqe" });
}

export default async function ContactPage() {
  const description = describe(await getSiteSettings());
  return (
    <>
      <Header />
      <main id="main">
        <PageHero title="Əlaqə" lead="Müraciətinizi göndərin, sorğunuzu birbaşa aidiyyəti şirkətə yönləndirək." />
        <section className="section">
          <div className={`container ${styles.grid}`}>
            <div className={styles.formCard}>
              <h2 className={styles.title}>Müraciət forması</h2>
              <ContactForm />
            </div>
            <aside className={styles.aside} aria-labelledby="contacts">
              <h2 id="contacts" className={styles.title}>
                Əlaqə məlumatları
              </h2>
              <GroupContacts />
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLdScript
        data={graph(
          pageNodes({
            type: "ContactPage",
            path: "/elaqe",
            name: "Əlaqə",
            description,
            crumbs: [
              { name: "Ana səhifə", path: "/" },
              { name: "Əlaqə", path: "/elaqe" },
            ],
          }),
        )}
      />
    </>
  );
}
