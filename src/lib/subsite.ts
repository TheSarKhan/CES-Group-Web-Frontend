import { notFound } from "next/navigation";
import { getCompanies, getSubSiteContent } from "@/content/loaders";
import { site as group } from "@/content/site";
import { isSubSiteId, type SubSite } from "@/content/subsites";

export type SubSiteParams = { params: Promise<{ site: string }> };

/** Marşrutun `[site]` parametrindən sayt məlumatı; naməlum olarsa 404 */
export async function getSubSite({ params }: SubSiteParams): Promise<SubSite> {
  const { site } = await params;
  if (!isSubSiteId(site)) notFound();
  return getSubSiteContent(site);
}

export const groupUrl = group.url;

/** Qrupun bu saytdan başqa şirkətləri (menyu və footer üçün) */
export const siblingsOf = async (id: SubSite["id"]) => (await getCompanies()).filter((c) => c.id !== id).map((c) => ({ name: c.name, url: c.url }));

