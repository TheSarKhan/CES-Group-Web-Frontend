import type { Metadata } from "next";
import { site } from "@/content/site";

export type OgImage = { url: string; width?: number; height?: number; alt?: string };

export const defaultOgImage: OgImage = {
  url: "/media/og-cesgroup.jpg",
  width: 1200,
  height: 630,
  alt: "CES Group: memarlıq, tikinti, texnika icarəsi və innovativ ekosistem",
};

type PageSeo = {
  title: string;
  description: string;
  /** Səhifənin yolu, məs. "/haqqimizda" */
  path: string;
  image?: OgImage;
  siteName?: string;
  /** true olarsa sayt şablonu ("| CES Group") əlavə olunmur */
  absoluteTitle?: boolean;
  /** Axtarış sistemləri səhifəni indeksləməsin */
  noindex?: boolean;
};

/** Hər səhifə üçün title, description, canonical, Open Graph və Twitter kartı */
export function pageMetadata({ title, description, path, image = defaultOgImage, siteName = site.name, absoluteTitle = false, noindex = false }: PageSeo): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: { type: "website", locale: "az_AZ", siteName, title: shareTitle, description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [image.url] },
  };
}

/** Süni intellekt axtarış və cavab sistemlərinin crawler-ləri: sayt onlar üçün açıqdır */
export const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const PRIVATE_PATHS = ["/api/"];

export function robotsRules(): { userAgent: string | string[]; allow: string; disallow: string[] }[] {
  return [
    { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    { userAgent: aiCrawlers, allow: "/", disallow: PRIVATE_PATHS },
  ];
}

/** Subdomen saytlarının robots.txt mətni */
export function robotsTxt(sitemapUrl: string) {
  const block = (agents: string[]) =>
    `${agents.map((a) => `User-agent: ${a}`).join("\n")}\nAllow: /\n${PRIVATE_PATHS.map((p) => `Disallow: ${p}`).join("\n")}\n`;
  return `${block(["*"])}\n${block(aiCrawlers)}\nSitemap: ${sitemapUrl}\n`;
}
