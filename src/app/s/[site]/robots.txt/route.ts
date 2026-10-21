import { getSubSite, type SubSiteParams } from "@/lib/subsite";

export async function GET(_req: Request, props: SubSiteParams) {
  const site = await getSubSite(props);
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
