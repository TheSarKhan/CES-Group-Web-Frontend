import type { Metadata } from "next";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { SubHero } from "@/components/subsite/SubHero";
import { About, Cta, ServicesSection, Stats } from "@/components/subsite/Sections";
import { ProjectsSlider } from "@/components/subsite/ProjectsSlider";

// absolute: kökdəki "%s | CES Group" şablonu ana səhifə başlığına əlavə olunmasın
export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return { title: { absolute: `${site.name} — ${site.tagline}` } };
}

export default async function SubSiteHome(props: SubSiteParams) {
  const site = await getSubSite(props);
  return (
    <>
      <SubHero title={site.tagline} video={site.video} poster={site.poster} />
      <About site={site} />
      <ServicesSection site={site} />
      <Stats site={site} />
      <ProjectsSlider projects={site.projects} />
      <Cta site={site} />
    </>
  );
}
