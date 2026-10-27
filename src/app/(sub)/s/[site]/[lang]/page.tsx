import type { Metadata } from "next";
import { subContext, type SubPageParams } from "@/lib/subsite";
import { pageMetadata } from "@/lib/seo";
import { SubHero } from "@/components/subsite/SubHero";
import { SetSwitcher } from "@/components/subsite/SwitchContext";
import { About, Cta, ServicesSection, Stats } from "@/components/subsite/Sections";
import { ProjectsSlider } from "@/components/subsite/ProjectsSlider";

const load = ({ params }: SubPageParams) => subContext(params, { kind: "home" }, "/");

// absolute: kökdəki "%s | CES Group" şablonu ana səhifə başlığına əlavə olunmasın
export async function generateMetadata(props: SubPageParams): Promise<Metadata> {
  const { site, lang, langs } = await load(props);
  return pageMetadata({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    path: "/",
    absoluteTitle: true,
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
    lang,
    langs,
  });
}

export default async function SubSiteHome(props: SubPageParams) {
  const { site, lang, switcher } = await load(props);
  return (
    <>
      <SetSwitcher {...switcher} />
      <SubHero title={site.tagline} video={site.video} poster={site.poster} lang={lang} />
      <About site={site} lang={lang} />
      <ServicesSection site={site} lang={lang} />
      <Stats site={site} lang={lang} />
      {site.projects.length > 0 && <ProjectsSlider projects={site.projects} lang={lang} />}
      <Cta site={site} lang={lang} />
    </>
  );
}
