import { getSubSite, type SubSiteParams } from "@/lib/subsite";
import { subsiteLlmsTxt } from "@/lib/llms";

export async function GET(_req: Request, props: SubSiteParams) {
  const site = await getSubSite(props);
  return new Response(await subsiteLlmsTxt(site), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
