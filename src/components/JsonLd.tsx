import { getCompanies, getJourney, getSiteSettings } from "@/content/loaders";
import type { Lang } from "@/lib/i18n";
import { groupGraph } from "@/lib/schema";

export function JsonLdScript({ data }: { data: object }) {
  // "<" qaçışı JSON-un </script> ilə səhifədən çıxmasının qarşısını alır
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Ana səhifə: sayt, qrup və şirkətlər */
export async function JsonLd({ lang = "az" }: { lang?: Lang }) {
  const [settings, companies, journey] = await Promise.all([getSiteSettings(lang), getCompanies(lang), getJourney(lang)]);
  return <JsonLdScript data={groupGraph(settings, companies, journey, lang)} />;
}
