/**
 * Səhifələrin məzmun almaq üçün çağırdığı yükləyicilər: əvvəl panel-dən (backend), alınmazsa src/content fayllarından.
 */
import { cache } from "react";
import { cmsEntry, cmsList } from "@/lib/cms";
import { aboutFrom, approachFrom, clientFrom, faqGroupFrom, legalFrom, projectFrom, settingsFrom, statsFrom, type About, type Approach, type Client, type SiteSettings, type Stat } from "./cms-map";
import { faqGroups as faqFallback, type FaqGroup } from "./faq";
import { privacy, terms, type LegalDoc } from "./legal";
import { about as aboutFallback, clients as clientsFallback, projectApproach as approachFallback, projects as projectsFallback, site, stats as statsFallback, type Project } from "./site";

export async function getFaqGroups(): Promise<FaqGroup[]> {
  const list = await cmsList("group", "faq-group");
  return list ? list.map((e) => faqGroupFrom(e.slug, e.data)) : faqFallback;
}

export const faqItemsOf = (groups: FaqGroup[]) => groups.flatMap((g) => g.items);

const LEGAL_FALLBACK: Record<string, LegalDoc> = { "mexfilik-siyaseti": privacy, "istifade-sertleri": terms };

export async function getLegal(slug: "mexfilik-siyaseti" | "istifade-sertleri"): Promise<LegalDoc> {
  const e = await cmsEntry("group", "legal-page", slug);
  return e ? legalFrom(e.data) : LEGAL_FALLBACK[slug];
}

/** Qrupun əlaqə məlumatları (bütün CES saytlarında eynidir): əvvəl panel-dən, alınmazsa `site` faylından */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const e = await cmsEntry("group", "settings", "main");
  return e ? settingsFrom(e.data, site) : site;
});

export const getStats = cache(async (): Promise<Stat[]> => {
  const e = await cmsEntry("group", "stats", "main");
  return e ? statsFrom(e.data) : statsFallback;
});

export const getAbout = cache(async (): Promise<About> => {
  const e = await cmsEntry("group", "about", "main");
  return e ? aboutFrom(e.data) : aboutFallback;
});

export const getProjectApproach = cache(async (): Promise<Approach> => {
  const e = await cmsEntry("group", "project-approach", "main");
  return e ? approachFrom(e.data) : approachFallback;
});

export const getClients = cache(async (): Promise<Client[]> => {
  const list = await cmsList("group", "client");
  return list ? list.map((e) => clientFrom(e.data)) : clientsFallback;
});

export const getProjects = cache(async (): Promise<Project[]> => {
  const list = await cmsList("group", "project");
  return list ? list.map((e) => projectFrom(e.slug, e.data)) : projectsFallback;
});
