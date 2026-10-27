/**
 * Səhifələrin məzmun almaq üçün çağırdığı yükləyicilər: əvvəl panel-dən (backend), alınmazsa src/content fayllarından.
 */
import { cmsEntry, cmsList } from "@/lib/cms";
import { faqGroupFrom, legalFrom } from "./cms-map";
import { faqGroups as faqFallback, type FaqGroup } from "./faq";
import { privacy, terms, type LegalDoc } from "./legal";

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
