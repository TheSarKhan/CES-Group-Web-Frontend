import type { Metadata } from "next";
import { site } from "@/content/site";
import { DEFAULT_LANG, localePath, ogLocale, type Lang } from "./i18n";

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
  /** Səhifənin dili (canonical və Open Graph buna görə) */
  lang?: Lang;
  /** Səhifənin açıq olduğu dillər: birdən çoxdursa hreflang yazılır */
  langs?: Lang[];
};

/** Hər səhifə üçün title, description, canonical, Open Graph və Twitter kartı */
export function pageMetadata({ title, description, path, image = defaultOgImage, siteName = site.name, absoluteTitle = false, noindex = false, lang = DEFAULT_LANG, langs = [lang] }: PageSeo): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  const here = localePath(lang, path);
  // hreflang yalnız səhifə bir neçə dildə açıqdırsa yazılır; x-default azərbaycan dilidir
  const languages = langs.length > 1 ? { ...Object.fromEntries(langs.map((l) => [l, localePath(l, path)])), "x-default": localePath(DEFAULT_LANG, path) } : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: here, ...(languages && { languages }) },
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: { type: "website", locale: ogLocale[lang], siteName, title: shareTitle, description, url: here, images: [image] },
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
