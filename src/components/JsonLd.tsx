import { getSiteSettings } from "@/content/loaders";
import { groupGraph } from "@/lib/schema";

export function JsonLdScript({ data }: { data: object }) {
  // "<" qaçışı JSON-un </script> ilə səhifədən çıxmasının qarşısını alır
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Ana səhifə: sayt, qrup və şirkətlər */
export async function JsonLd() {
  return <JsonLdScript data={groupGraph(await getSiteSettings())} />;
}
