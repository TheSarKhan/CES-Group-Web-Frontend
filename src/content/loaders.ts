/**
 * Səhifələrin məzmun almaq üçün çağırdığı yükləyicilər: əvvəl panel-dən (backend), alınmazsa src/content fayllarından.
 */
import { cache } from "react";
import { notFound } from "next/navigation";
import { cmsEntry, cmsList } from "@/lib/cms";
import { DEFAULT_LANG, LANGS, type Lang } from "@/lib/i18n";
import { aboutFrom, approachFrom, clientFrom, companyFrom, companyPageFrom, faqGroupFrom, journeyFrom, serviceFrom, subProjectFrom, subsiteFrom, legalFrom, projectFrom, settingsFrom, statsFrom, type About, type Approach, type Client, type SiteSettings, type Stat } from "./cms-map";
import { faqGroups as faqFallback, type FaqGroup } from "./faq";
import { privacy, terms, type LegalDoc } from "./legal";
import { companyPages as pagesFallback, type CompanyPage } from "./companies";
import { subsites, type SubSite, type SubSiteId } from "./subsites";
import { about as aboutFallback, clients as clientsFallback, companies as companiesFallback, journey as journeyFallback, type Company, type CompanyId, type JourneyStep, projectApproach as approachFallback, projects as projectsFallback, site, stats as statsFallback, type Project } from "./site";

const az = (lang: Lang) => lang === DEFAULT_LANG;
/** Seçilmiş dildə məzmun yoxdursa səhifə açılmır (tərcümə avtomatik yaradılmır) */
const must = <T,>(v: T | null): T => v ?? notFound();

// ---- Hər loader iki formada var: load* (yoxdursa null; səhifənin hansı dillərdə açıldığını yoxlamaq üçün) və get* (yoxdursa 404).
// Az üçün həmişə dəyər var (panel boşdursa src/content-dəki ehtiyat məzmun). En/ru üçün ehtiyat yoxdur.

const loadFaqGroups = cache(async (lang: Lang): Promise<FaqGroup[] | null> => {
  const list = await cmsList("group", "faq-group", lang);
  return list ? list.map((e) => faqGroupFrom(e.slug, e.data)) : az(lang) ? faqFallback : null;
});
export const getFaqGroups = async (lang: Lang = DEFAULT_LANG) => must(await loadFaqGroups(lang));

export const faqItemsOf = (groups: FaqGroup[]) => groups.flatMap((g) => g.items);

const LEGAL_FALLBACK: Record<string, LegalDoc> = { "mexfilik-siyaseti": privacy, "istifade-sertleri": terms };
export type LegalSlug = "mexfilik-siyaseti" | "istifade-sertleri";

const loadLegal = cache(async (lang: Lang, slug: LegalSlug): Promise<LegalDoc | null> => {
  const e = await cmsEntry("group", "legal-page", slug, lang);
  return e ? legalFrom(e.data) : az(lang) ? LEGAL_FALLBACK[slug] : null;
});
export const getLegal = async (slug: LegalSlug, lang: Lang = DEFAULT_LANG) => must(await loadLegal(lang, slug));

/** Qrupun əlaqə məlumatları (bütün CES saytlarında eynidir): əvvəl panel-dən, alınmazsa `site` faylından */
const loadSettings = cache(async (lang: Lang): Promise<SiteSettings | null> => {
  const e = await cmsEntry("group", "settings", "main", lang);
  return e ? settingsFrom(e.data, site) : az(lang) ? site : null;
});
/** Yoxdursa null (layout kimi 404 verməməli olan yerlər üçün) */
export const findSiteSettings = loadSettings;
export const getSiteSettings = async (lang: Lang = DEFAULT_LANG) => must(await loadSettings(lang));

const loadStats = cache(async (lang: Lang): Promise<Stat[] | null> => {
  const e = await cmsEntry("group", "stats", "main", lang);
  return e ? statsFrom(e.data) : az(lang) ? statsFallback : null;
});
export const getStats = async (lang: Lang = DEFAULT_LANG) => must(await loadStats(lang));

const loadAbout = cache(async (lang: Lang): Promise<About | null> => {
  const e = await cmsEntry("group", "about", "main", lang);
  return e ? aboutFrom(e.data) : az(lang) ? aboutFallback : null;
});
export const getAbout = async (lang: Lang = DEFAULT_LANG) => must(await loadAbout(lang));

const loadApproach = cache(async (lang: Lang): Promise<Approach | null> => {
  const e = await cmsEntry("group", "project-approach", "main", lang);
  return e ? approachFrom(e.data) : az(lang) ? approachFallback : null;
});
export const getProjectApproach = async (lang: Lang = DEFAULT_LANG) => must(await loadApproach(lang));

/** Müştəri adları və loqoları dilə bağlı deyil */
export const getClients = cache(async (): Promise<Client[]> => {
  const list = await cmsList("group", "client");
  return list ? list.map((e) => clientFrom(e.data)) : clientsFallback;
});

const loadProjects = cache(async (lang: Lang): Promise<Project[] | null> => {
  const list = await cmsList("group", "project", lang);
  return list ? list.map((e) => projectFrom(e.slug, e.data)) : az(lang) ? projectsFallback : null;
});
/** Seçilmiş dildə heç bir layihə yoxdursa 404 (ana səhifə kimi bölməsi isteğe bağlı olan yerlər üçün `getProjectsOrNone`) */
export const getProjects = async (lang: Lang = DEFAULT_LANG) => must(await loadProjects(lang));
export const getProjectsOrNone = async (lang: Lang = DEFAULT_LANG) => (await loadProjects(lang)) ?? [];

// ---- Şirkətlər: hero, şirkətlər səhifəsi, "layihənin yolu" və hər şirkətin səhifəsi bir yerdən gəlir ---------------

type Bundle = { companies: Company[]; pages: Record<CompanyId, CompanyPage>; journey: JourneyStep[] };
const COMPANY_IDS: CompanyId[] = ["equipment", "architect", "construction", "farmart"];
const isCompanyId = (v: string): v is CompanyId => (COMPANY_IDS as string[]).includes(v);

const loadBundle = cache(async (lang: Lang): Promise<Bundle | null> => {
  const [list, projects] = await Promise.all([cmsList("group", "company", lang), getProjectsOrNone(lang)]);
  // Equipment-in layihələri qrupun layihələri ilə eynidir: "Layihələr" bölməsindən avtomatik götürülür
  const equipmentProjects = projects.map((p) => ({ title: p.title, category: p.category, image: p.image, alt: p.alt, href: `/layiheler/${p.slug}` }));
  const withLiveProjects = (pages: Record<CompanyId, CompanyPage>) => ({ ...pages, equipment: { ...pages.equipment, projects: equipmentProjects } });

  if (!list) return az(lang) ? { companies: companiesFallback, pages: withLiveProjects(pagesFallback), journey: journeyFallback } : null;

  const entries = list.filter((e) => isCompanyId(e.slug));
  const present = new Set(entries.map((e) => e.slug));
  // En/ru: dörd şirkətin hamısı tərcümə olunmayınca şirkət bölmələri açılmır (yarımçıq siyahı göstərilməsin)
  if (!az(lang) && COMPANY_IDS.some((id) => !present.has(id))) return null;
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

const getBundle = async (lang: Lang) => must(await loadBundle(lang));
export const getCompanies = async (lang: Lang = DEFAULT_LANG) => (await getBundle(lang)).companies;
export const getCompanyPages = async (lang: Lang = DEFAULT_LANG) => (await getBundle(lang)).pages;
export const getJourney = async (lang: Lang = DEFAULT_LANG) => (await getBundle(lang)).journey;

// ---- Səhifənin hansı dillərdə açıldığı ------------------------------------------------------------------------------

export type PageRef =
  | { kind: "home" | "about" | "companies" | "projects" | "faq" | "contact" }
  | { kind: "company"; id: string }
  | { kind: "project"; slug: string }
  | { kind: "legal"; slug: LegalSlug };

/** Az həmişə var. En/ru yalnız səhifənin bütün məzmunu həmin dildə tam tərcümə olunubsa (altbilgi də daxil olmaqla). */
async function isReady(lang: Lang, ref: PageRef): Promise<boolean> {
  if (az(lang)) return true;
  const [settings, bundle] = await Promise.all([loadSettings(lang), loadBundle(lang)]);
  if (!settings || !bundle) return false;
  switch (ref.kind) {
    case "home":
      return !!(await loadStats(lang)) && !!(await loadAbout(lang));
    case "about":
      return !!(await loadStats(lang)) && !!(await loadAbout(lang));
    case "company":
      return bundle.companies.some((c) => c.id === ref.id);
    case "projects":
      return !!(await loadProjects(lang));
    case "project":
      return !!(await loadApproach(lang)) && !!(await loadProjects(lang))?.some((p) => p.slug === ref.slug);
    case "faq":
      return !!(await loadFaqGroups(lang));
    case "legal":
      return !!(await loadLegal(lang, ref.slug));
    default:
      return true;
  }
}

export async function availableLangs(ref: PageRef): Promise<Lang[]> {
  const ok = await Promise.all(LANGS.map((l) => isReady(l, ref)));
  return LANGS.filter((_, i) => ok[i]);
}

// ---- Construction və Farmart (panel-də Farmart-ın sayt kodu "agro"-dur) ------------------------------------------

export const PANEL_SITE: Record<SubSiteId, string> = { construction: "construction", farmart: "agro" };

/** Alt saytın tam məzmunu: əsas məzmun, xidmətlər və layihələr. Panel-də qurulmayıbsa fayldakı məzmun işlənir (yalnız az). */
const loadSubSite = cache(async (id: SubSiteId, lang: Lang): Promise<SubSite | null> => {
  const base = subsites[id];
  const code = PANEL_SITE[id];
  const [main, services, projects] = await Promise.all([cmsEntry(code, "subsite", "main", lang), cmsList(code, "service", lang), cmsList(code, "sub-project", lang)]);
  if (!main) return az(lang) ? base : null;
  return {
    ...subsiteFrom(main.data, base),
    services: services ? services.map((e) => serviceFrom(e.slug, e.data)) : az(lang) ? base.services : [],
    projects: projects ? projects.map((e) => subProjectFrom(e.slug, e.data)) : az(lang) ? base.projects : [],
  };
});
export const getSubSiteContent = async (id: SubSiteId, lang: Lang = DEFAULT_LANG) => must(await loadSubSite(id, lang));

export type SubPageRef = { kind: "home" | "services" | "projects" | "contact" } | { kind: "service"; slug: string } | { kind: "project"; slug: string };

/** Alt saytın səhifəsi en/ru-da yalnız saytın, qrupun ayarlarının və şirkət adlarının tərcüməsi tam olduqda açılır */
async function isSubReady(id: SubSiteId, lang: Lang, ref: SubPageRef): Promise<boolean> {
  if (az(lang)) return true;
  const [settings, bundle, site] = await Promise.all([loadSettings(lang), loadBundle(lang), loadSubSite(id, lang)]);
  if (!settings || !bundle || !site) return false;
  switch (ref.kind) {
    case "home":
    case "services":
      return site.services.length > 0;
    case "projects":
      return site.projects.length > 0;
    case "service":
      return site.services.some((x) => x.slug === ref.slug);
    case "project":
      return site.projects.some((x) => x.slug === ref.slug);
    default:
      return true;
  }
}

export async function availableSubLangs(id: SubSiteId, ref: SubPageRef): Promise<Lang[]> {
  const ok = await Promise.all(LANGS.map((l) => isSubReady(id, l, ref)));
  return LANGS.filter((_, i) => ok[i]);
}
