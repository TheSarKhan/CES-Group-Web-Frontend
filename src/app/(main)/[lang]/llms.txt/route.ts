import { notFound } from "next/navigation";
import { availableLangs } from "@/content/loaders";
import { isLang } from "@/lib/i18n";
import { groupLlmsTxt } from "@/lib/llms";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

/** /en/llms.txt, /ru/llms.txt: yalnız ana səhifəsi həmin dildə hazır olanda (az üçün kökdəki /llms.txt) */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || !(await availableLangs({ kind: "home" })).includes(lang)) notFound();
  return new Response(await groupLlmsTxt(lang), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
