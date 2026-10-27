import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Stats } from "@/components/Stats";
import { Projects } from "@/components/Projects";
import { Clients } from "@/components/Clients";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getSiteSettings } from "@/content/loaders";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: "CES Group Azərbaycan — memarlıq, tikinti, texnika icarəsi və innovativ ekosistem",
    description: (await getSiteSettings()).description,
    path: "/",
    absoluteTitle: true,
  });
}

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir) */
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main id="main" className="home">
        <Hero />
        <Journey />
        <Stats />
        <Projects />
        <Clients />
        <ContactBlock />
      </main>
      <Footer />
      <JsonLd />
    </>
  );
}
