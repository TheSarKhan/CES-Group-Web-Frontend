import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Synergy } from "@/components/Synergy";
import { Stats } from "@/components/Stats";
import { Projects } from "@/components/Projects";
import { Clients } from "@/components/Clients";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";

export default function HomePage() {
  return (
    <>
      <Header overlay />
      <main id="main">
        <Hero />
        <Intro />
        <Synergy />
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
