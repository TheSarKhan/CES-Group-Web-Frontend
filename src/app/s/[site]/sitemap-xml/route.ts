import { getSubSite, type SubSiteParams } from "@/lib/subsite";

export async function GET(_req: Request, props: SubSiteParams) {
  const site = await getSubSite(props);
  const paths = [
    "",
    "/xidmetlerimiz",
    "/layihelerimiz",
    "/elaqe",
    ...site.services.map((s) => `/xidmetlerimiz/${s.slug}`),
    ...site.projects.map((p) => `/layihelerimiz/${p.slug}`),
  ];
  const urls = paths.map((p) => `  <url><loc>${site.url}${p}</loc><priority>${p === "" ? "1.0" : "0.7"}</priority></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
