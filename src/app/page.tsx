import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Stats } from "@/components/Stats";
import { Projects } from "@/components/Projects";
import { Clients } from "@/components/Clients";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "CES Group — memarlıq, tikinti, texnika icarəsi və innovativ fermerçilik",
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

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
