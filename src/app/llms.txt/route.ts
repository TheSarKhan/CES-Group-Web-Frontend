import { groupLlmsTxt } from "@/lib/llms";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir; src/lib/cms.ts-dəki CMS_REVALIDATE ilə eyni olmalıdır) */
export const revalidate = 300;

export async function GET() {
  return new Response(await groupLlmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
