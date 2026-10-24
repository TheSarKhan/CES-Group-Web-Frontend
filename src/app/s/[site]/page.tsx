import type { Metadata } from "next";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { pageMetadata } from "@/lib/seo";
import { SubHero } from "@/components/subsite/SubHero";
import { About, Cta, ServicesSection, Stats } from "@/components/subsite/Sections";
import { ProjectsSlider } from "@/components/subsite/ProjectsSlider";

// absolute: kökdəki "%s | CES Group" şablonu ana səhifə başlığına əlavə olunmasın
export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return pageMetadata({
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    path: "/",
    absoluteTitle: true,
    siteName: site.name,
    image: { url: site.poster, width: 1280, height: 720 },
  });
}

export default async function SubSiteHome(props: SubSiteParams) {
  const site = await getSubSite(props);
  return (
    <>
      <SubHero title={site.tagline} video={site.video} poster={site.poster} />
      <About site={site} />
      <ServicesSection site={site} />
      <Stats site={site} />
      {site.projects.length > 0 && <ProjectsSlider projects={site.projects} />}
      <Cta site={site} />
    </>
  );
}
