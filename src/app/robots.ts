import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { robotsRules } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: robotsRules(), sitemap: `${site.url}/sitemap.xml` };
}
