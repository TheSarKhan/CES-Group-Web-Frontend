import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/content/loaders";
import { site } from "@/content/site";
import { RootShell } from "@/components/RootShell";
import { ENABLED_LANGS, isLang, ogLocale } from "@/lib/i18n";
import { defaultOgImage } from "@/lib/seo";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir): panel-dəki məzmun ən geci bu vaxtda saytda görünür */
export const revalidate = 300;

export function generateStaticParams() {
  return ENABLED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang) || !ENABLED_LANGS.includes(lang)) return {};
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: "CES Group Azərbaycan — memarlıq, tikinti, texnika icarəsi və innovativ ekosistem",
      template: "%s | CES Group",
    },
    description: settings.description,
    applicationName: site.name,
    // Hər səhifə öz canonical, Open Graph və Twitter məlumatını pageMetadata ilə verir
    openGraph: { type: "website", locale: ogLocale[lang], siteName: site.name, images: [defaultOgImage] },
    twitter: { card: "summary_large_image", images: [defaultOgImage.url] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export const viewport: Viewport = {
  themeColor: "#1e1e21",
  width: "device-width",
  initialScale: 1,
};

export default async function MainRootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || !ENABLED_LANGS.includes(lang)) notFound();
  return <RootShell lang={lang}>{children}</RootShell>;
}
