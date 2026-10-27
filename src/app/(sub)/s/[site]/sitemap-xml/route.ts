import { availableSubLangs, type SubPageRef } from "@/content/loaders";
import { isReadyProject } from "@/content/subsites";
import { localePath } from "@/lib/i18n";
import { getSubSite, type SubSiteParams } from "@/lib/subsite";

export async function GET(_req: Request, props: SubSiteParams) {
  const site = await getSubSite(props);
  // Təsviri yazılmayan layihə səhifələri sitemap-a düşmür (onlar noindex-dir)
  const projects = site.projects.filter(isReadyProject);
  const items: { path: string; ref: SubPageRef }[] = [
    { path: "", ref: { kind: "home" } },
    { path: "/xidmetlerimiz", ref: { kind: "services" } },
    ...(projects.length ? [{ path: "/layihelerimiz", ref: { kind: "projects" } as SubPageRef }] : []),
    { path: "/elaqe", ref: { kind: "contact" } },
    ...site.services.map((s) => ({ path: `/xidmetlerimiz/${s.slug}`, ref: { kind: "service", slug: s.slug } as SubPageRef })),
    ...projects.map((p) => ({ path: `/layihelerimiz/${p.slug}`, ref: { kind: "project", slug: p.slug } as SubPageRef })),
  ];

  // Hər səhifə yalnız tam tərcümə olunduğu dillərdə yazılır; birdən çox dil varsa hreflang əlavə olunur (x-default: az)
  const blocks = await Promise.all(
    items.map(async ({ path, ref }) => {
      const langs = await availableSubLangs(site.id, ref);
      const at = (l: (typeof langs)[number]) => `${site.url}${l === "az" ? path : localePath(l, path || "/")}`;
      const alts = langs.length > 1 ? [...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${at(l)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${at("az")}"/>`].join("\n") : "";
      return langs.map((l) => `  <url><loc>${at(l)}</loc>${alts ? `\n${alts}\n  ` : ""}</url>`);
    }),
  );
  const rows = blocks.flat();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${rows.some((r) => r.includes("xhtml:link")) ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ""}>\n${rows.join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
