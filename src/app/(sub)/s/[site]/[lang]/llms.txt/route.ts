import { notFound } from "next/navigation";
import { availableSubLangs, getSubSiteContent } from "@/content/loaders";
import { isSubSiteId } from "@/content/subsites";
import { isLang } from "@/lib/i18n";
import { subsiteLlmsTxt } from "@/lib/llms";

/** /en/llms.txt, /ru/llms.txt: yalnız saytın ana səhifəsi həmin dildə hazır olanda (az üçün kökdəki /llms.txt) */
export async function GET(_req: Request, { params }: { params: Promise<{ site: string; lang: string }> }) {
  const { site: id, lang } = await params;
  if (!isSubSiteId(id) || !isLang(lang) || !(await availableSubLangs(id, { kind: "home" })).includes(lang)) notFound();
  return new Response(await subsiteLlmsTxt(await getSubSiteContent(id, lang), lang), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
