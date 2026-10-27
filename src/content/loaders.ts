/**
 * Səhifələrin məzmun almaq üçün çağırdığı yükləyicilər: əvvəl panel-dən (backend), alınmazsa src/content fayllarından.
 */
import { cache } from "react";
import { cmsEntry, cmsList } from "@/lib/cms";
import { aboutFrom, approachFrom, clientFrom, companyFrom, companyPageFrom, faqGroupFrom, journeyFrom, serviceFrom, subProjectFrom, subsiteFrom, legalFrom, projectFrom, settingsFrom, statsFrom, type About, type Approach, type Client, type SiteSettings, type Stat } from "./cms-map";
import { faqGroups as faqFallback, type FaqGroup } from "./faq";
import { privacy, terms, type LegalDoc } from "./legal";
import { companyPages as pagesFallback, type CompanyPage } from "./companies";
import { subsites, type SubSite, type SubSiteId } from "./subsites";
import { about as aboutFallback, clients as clientsFallback, companies as companiesFallback, journey as journeyFallback, type Company, type CompanyId, type JourneyStep, projectApproach as approachFallback, projects as projectsFallback, site, stats as statsFallback, type Project } from "./site";

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

// ---- Şirkətlər: hero, şirkətlər səhifəsi, "layihənin yolu" və hər şirkətin səhifəsi bir yerdən gəlir ---------------

type Bundle = { companies: Company[]; pages: Record<CompanyId, CompanyPage>; journey: JourneyStep[] };
const COMPANY_IDS: CompanyId[] = ["equipment", "architect", "construction", "farmart"];
const isCompanyId = (v: string): v is CompanyId => (COMPANY_IDS as string[]).includes(v);

const getBundle = cache(async (): Promise<Bundle> => {
  const [list, projects] = await Promise.all([cmsList("group", "company"), getProjects()]);
  // Equipment-in layihələri qrupun layihələri ilə eynidir: "Layihələr" bölməsindən avtomatik götürülür
  const equipmentProjects = projects.map((p) => ({ title: p.title, category: p.category, image: p.image, alt: p.alt, href: `/layiheler/${p.slug}` }));
  const withLiveProjects = (pages: Record<CompanyId, CompanyPage>) => ({ ...pages, equipment: { ...pages.equipment, projects: equipmentProjects } });

  if (!list) return { companies: companiesFallback, pages: withLiveProjects(pagesFallback), journey: journeyFallback };

  const entries = list.filter((e) => isCompanyId(e.slug));
  const present = new Set(entries.map((e) => e.slug));
  const companies: Company[] = entries.map((e) => companyFrom(e.data, companiesFallback.find((c) => c.id === e.slug)!));
  const pages = { ...pagesFallback } as Record<CompanyId, CompanyPage>;
  entries.forEach((e) => (pages[e.slug as CompanyId] = companyPageFrom(e.slug as CompanyId, e.data)));
  const steps = entries
    .map((e) => ({ step: journeyFrom(e.slug as CompanyId, e.data), order: typeof e.data.journeyOrder === "number" ? e.data.journeyOrder : 99 }))
    .sort((a, b) => a.order - b.order)
    .map((x) => x.step);
  // Panel-də olmayan şirkət köhnə fayldan tamamlanır, sayt heç vaxt şirkətsiz qalmır
  companiesFallback.filter((c) => !present.has(c.id)).forEach((c) => companies.push(c));
  journeyFallback.filter((j) => !present.has(j.id)).forEach((j) => steps.push(j));
  return { companies, pages: withLiveProjects(pages), journey: steps };
});

export const getCompanies = async () => (await getBundle()).companies;
export const getCompanyPages = async () => (await getBundle()).pages;
export const getJourney = async () => (await getBundle()).journey;

// ---- Construction və Farmart (panel-də Farmart-ın sayt kodu "agro"-dur) ------------------------------------------

export const PANEL_SITE: Record<SubSiteId, string> = { construction: "construction", farmart: "agro" };

/** Alt saytın tam məzmunu: əsas məzmun, xidmətlər və layihələr. Panel-də qurulmayıbsa fayldakı məzmun işlənir. */
export const getSubSiteContent = cache(async (id: SubSiteId): Promise<SubSite> => {
  const base = subsites[id];
  const code = PANEL_SITE[id];
  const [main, services, projects] = await Promise.all([cmsEntry(code, "subsite", "main"), cmsList(code, "service"), cmsList(code, "sub-project")]);
  if (!main) return base;
  return {
    ...subsiteFrom(main.data, base),
    services: services ? services.map((e) => serviceFrom(e.slug, e.data)) : base.services,
    projects: projects ? projects.map((e) => subProjectFrom(e.slug, e.data)) : base.projects,
  };
});
