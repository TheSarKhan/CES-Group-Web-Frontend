import { groupLlmsTxt } from "@/lib/llms";

export function GET() {
  return new Response(groupLlmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
