import { notFound } from "next/navigation";
import { companies, site as group } from "@/content/site";
import { isSubSiteId, subsites, type SubSite } from "@/content/subsites";

export type SubSiteParams = { params: Promise<{ site: string }> };

/** Marşrutun `[site]` parametrindən sayt məlumatı; naməlum olarsa 404 */
export async function getSubSite({ params }: SubSiteParams): Promise<SubSite> {
  const { site } = await params;
  if (!isSubSiteId(site)) notFound();
  return subsites[site];
}

export const groupUrl = group.url;

/** Qrupun bu saytdan başqa şirkətləri (menyu və footer üçün) */
export const siblingsOf = (id: SubSite["id"]) => companies.filter((c) => c.id !== id).map((c) => ({ name: c.name, url: c.url }));

