import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { CompanyContacts } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Əlaqə",
  description: "CES Group və şirkətləri ilə əlaqə: müraciət forması, telefon və e-poçt ünvanları.",
  alternates: { canonical: "/elaqe" },
};

export default function ContactPage() {
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
            <aside className={styles.aside} aria-labelledby="companies-contacts">
              <h2 id="companies-contacts" className={styles.title}>
                Şirkətlərimiz
              </h2>
              <CompanyContacts />
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>CES Group</h3>
                <p>{site.address}</p>
                <p>{site.email}</p>
                <p>{site.phone}</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
