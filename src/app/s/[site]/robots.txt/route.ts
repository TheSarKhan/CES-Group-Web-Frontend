import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { robotsTxt } from "@/lib/seo";

export async function GET(_req: Request, props: SubSiteParams) {
  const site = await getSubSite(props);
  return new Response(robotsTxt(`${site.url}/sitemap.xml`), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
