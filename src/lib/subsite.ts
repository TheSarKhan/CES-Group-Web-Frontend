import { notFound } from "next/navigation";
import { availableSubLangs, getCompanies, getSubSiteContent, type SubPageRef } from "@/content/loaders";
import { site as group } from "@/content/site";
import { isSubSiteId, type SubSite } from "@/content/subsites";
import { getUi } from "@/i18n/ui";
import { ENABLED_LANGS, isLang, type Lang } from "./i18n";

/** Dilsiz marşrutlar (robots.txt, sitemap, llms.txt) */
export type SubSiteParams = { params: Promise<{ site: string }> };
/** Dilli səhifələr: /s/<sayt>/<dil>/... */
export type SubPageParams = { params: Promise<{ site: string; lang: string }> };

/** Marşrutun `[site]` parametrindən sayt məlumatı (azərbaycanca); naməlum olarsa 404 */
export async function getSubSite({ params }: SubSiteParams): Promise<SubSite> {
  const { site } = await params;
  if (!isSubSiteId(site)) notFound();
  return getSubSiteContent(site);
}

/**
 * Alt saytın səhifəsi üçün sayt məlumatı, dil və açıq olduğu dillər. Dil tanınmırsa və ya səhifənin məzmunu həmin dildə
 * tam tərcümə olunmayıbsa 404. `switcher` başlıqdakı dil seçiciyə verilir.
 */
export async function subContext(params: SubPageParams["params"], ref: SubPageRef, path: string) {
  const { site: id, lang } = await params;
  if (!isSubSiteId(id) || !isLang(lang) || !ENABLED_LANGS.includes(lang)) notFound();
  const langs = await availableSubLangs(id, ref);
  if (!langs.includes(lang)) notFound();
  const site = await getSubSiteContent(id, lang);
  return { site, lang: lang as Lang, langs, switcher: { path, langs }, t: getUi(lang) };
}

export const groupUrl = group.url;

/** Qrupun bu saytdan başqa şirkətləri (menyu və footer üçün) */
export const siblingsOf = async (id: SubSite["id"], lang: Lang = "az") => (await getCompanies(lang)).filter((c) => c.id !== id).map((c) => ({ name: c.name, url: c.url }));
