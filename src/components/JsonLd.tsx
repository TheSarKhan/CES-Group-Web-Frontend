import { getCompanies, getJourney, getSiteSettings } from "@/content/loaders";
import { groupGraph } from "@/lib/schema";

export function JsonLdScript({ data }: { data: object }) {
  // "<" qaçışı JSON-un </script> ilə səhifədən çıxmasının qarşısını alır
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Ana səhifə: sayt, qrup və şirkətlər */
export async function JsonLd() {
  const [settings, companies, journey] = await Promise.all([getSiteSettings(), getCompanies(), getJourney()]);
  return <JsonLdScript data={groupGraph(settings, companies, journey)} />;
}
