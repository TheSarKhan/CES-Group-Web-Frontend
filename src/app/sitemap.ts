import type { MetadataRoute } from "next";
import { getProjects } from "@/content/loaders";
import { companies, site } from "@/content/site";

// lastModified yazılmır: real dəyişiklik tarixi olmadan yanlış tarix axtarış sisteminin sitemap-a etibarını azaldır
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return ["", "/haqqimizda", "/sirketler", ...companies.map((c) => `/sirketler/${c.id}`), "/layiheler", "/suallar", "/elaqe", "/mexfilik-siyaseti", "/istifade-sertleri", ...projects.map((p) => `/layiheler/${p.slug}`)].map((path) => ({ url: `${site.url}${path}` }));
}
