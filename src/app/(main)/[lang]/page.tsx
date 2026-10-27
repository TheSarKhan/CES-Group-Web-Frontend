import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Stats } from "@/components/Stats";
import { Projects } from "@/components/Projects";
import { Clients } from "@/components/Clients";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCompanies, getSiteSettings } from "@/content/loaders";
import { getUi } from "@/i18n/ui";
import { pageContext } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata(props: Props) {
  const { lang, langs } = await pageContext(props.params, { kind: "home" }, "/");
  return pageMetadata({
    title: getUi(lang).home.title,
    description: (await getSiteSettings(lang)).description,
    path: "/",
    absoluteTitle: true,
    lang,
    langs,
  });
}

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir) */
export const revalidate = 300;

export default async function HomePage(props: Props) {
  const { lang, switcher } = await pageContext(props.params, { kind: "home" }, "/");
  const companies = await getCompanies(lang);
  return (
    <>
      <Header overlay lang={lang} switcher={switcher} />
      <main id="main" className="home">
        <Hero companies={companies} lang={lang} />
        <Journey lang={lang} />
        <Stats lang={lang} />
        <Projects lang={lang} />
        <Clients lang={lang} />
        <ContactBlock lang={lang} />
      </main>
      <Footer lang={lang} />
      <JsonLd lang={lang} />
    </>
  );
}
