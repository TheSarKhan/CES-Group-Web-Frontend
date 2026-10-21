import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { GroupContacts } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
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
    </>
  );
}
