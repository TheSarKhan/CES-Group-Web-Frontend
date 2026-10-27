import type { MetadataRoute } from "next";
import { availableLangs, getProjects, type PageRef } from "@/content/loaders";
import { companies, site } from "@/content/site";
import { localePath } from "@/lib/i18n";

type Item = { path: string; ref: PageRef };

// lastModified yazılmır: real dəyişiklik tarixi olmadan yanlış tarix axtarış sisteminin sitemap-a etibarını azaldır
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const items: Item[] = [
    { path: "", ref: { kind: "home" } },
    { path: "/haqqimizda", ref: { kind: "about" } },
    { path: "/sirketler", ref: { kind: "companies" } },
    ...companies.map((c): Item => ({ path: `/sirketler/${c.id}`, ref: { kind: "company", id: c.id } })),
    { path: "/layiheler", ref: { kind: "projects" } },
    { path: "/suallar", ref: { kind: "faq" } },
    { path: "/elaqe", ref: { kind: "contact" } },
    { path: "/mexfilik-siyaseti", ref: { kind: "legal", slug: "mexfilik-siyaseti" } },
    { path: "/istifade-sertleri", ref: { kind: "legal", slug: "istifade-sertleri" } },
    ...projects.map((p): Item => ({ path: `/layiheler/${p.slug}`, ref: { kind: "project", slug: p.slug } })),
  ];

  // Hər səhifə yalnız tam tərcümə olunduğu dillərdə yazılır; birdən çox dil varsa hreflang əlavə olunur (x-default: az)
  const rows = await Promise.all(
    items.map(async ({ path, ref }) => {
      const langs = await availableLangs(ref);
      const at = (l: (typeof langs)[number]) => `${site.url}${localePath(l, path || "/")}`;
      const alternates = langs.length > 1 ? { languages: { ...Object.fromEntries(langs.map((l) => [l, at(l)])), "x-default": at("az") } } : undefined;
      return langs.map((l) => ({ url: `${site.url}${path === "" && l === "az" ? "" : localePath(l, path || "/")}`, ...(alternates && { alternates }) }));
    }),
  );
  return rows.flat();
}
