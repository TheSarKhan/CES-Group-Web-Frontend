import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { availableLangs, availableSubLangs, getCompanies, getJourney, getSiteSettings, getSubSiteContent } from "@/content/loaders";
import { isSubSiteId, subsiteIds } from "@/content/subsites";
import { RootShell } from "@/components/RootShell";
import { ENABLED_LANGS, isLang, ogLocale, STATIC_LANGS } from "@/lib/i18n";
import { groupUrl, siblingsOf } from "@/lib/subsite";
import { graph, companyNode, websiteId, orgId } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { SubHeader } from "@/components/subsite/SubHeader";
import { SubFooter } from "@/components/subsite/SubFooter";
import { BackToTop } from "@/components/subsite/BackToTop";
import { SwitchProvider } from "@/components/subsite/SwitchContext";

/** 5 dəqiqə (Next bu dəyərin sabit rəqəm olmasını tələb edir): panel-dəki məzmun ən geci bu vaxtda saytda görünür */
export const revalidate = 300;

type Props = { children: React.ReactNode; params: Promise<{ site: string; lang: string }> };

// Yalnız tanınan subdomain saytları; digərləri 404. Build zamanı yalnız az yığılır, en/ru tələb olunanda.
export function generateStaticParams() {
  return subsiteIds.flatMap((site) => STATIC_LANGS.map((lang) => ({ site, lang })));
}

export const viewport: Viewport = { themeColor: "#1e1e21" };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { site: id, lang } = await params;
  if (!isSubSiteId(id) || !isLang(lang) || !ENABLED_LANGS.includes(lang)) return {};
  // Tərcüməsi hazır olmayan dildə layout özü yıxılmamalıdır ki, səhifənin 404-ü düzgün göstərilsin
  if (!(await availableSubLangs(id, { kind: "contact" })).includes(lang)) return {};
  const site = await getSubSiteContent(id, lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    // Hər səhifə öz canonical, Open Graph və Twitter məlumatını pageMetadata ilə verir
    openGraph: { type: "website", locale: ogLocale[lang], siteName: site.name, images: [{ url: site.poster, width: 1280, height: 720 }] },
    twitter: { card: "summary_large_image", images: [site.poster] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default async function SubSiteLayout({ children, params }: Props) {
  const { site: id, lang } = await params;
  if (!isSubSiteId(id) || !isLang(lang) || !ENABLED_LANGS.includes(lang)) notFound();
  // Dil hazır deyilsə yalnız qabıq: səhifə özü 404 verir
  if (!(await availableSubLangs(id, { kind: "contact" })).includes(lang)) return <RootShell lang={lang}>{children}</RootShell>;

  const site = await getSubSiteContent(id, lang);
  const [siblings, settings, [companies, journey], groupLegal] = await Promise.all([
    siblingsOf(site.id, lang),
    getSiteSettings(lang),
    Promise.all([getCompanies(lang), getJourney(lang)]),
    availableLangs({ kind: "legal", slug: "mexfilik-siyaseti" }),
  ]);
  // Qrupun hüquqi səhifələrinin həmin dildə tərcüməsi yoxdursa az versiyasına keçid verilir
  const groupLegalLang = groupLegal.includes(lang) ? lang : "az";

  // Axtarış sistemləri bu saytın CES Group-un şirkəti olduğunu bilsin (parentOrganization eyni @id ilə qrupa bağlanır)
  const company = companies.find((c) => c.id === site.id);
  const jsonLd = graph([
    { "@type": "WebSite", "@id": websiteId(site.url), url: site.url, name: site.name, inLanguage: lang, publisher: { "@id": orgId(site.url) } },
    ...(company ? [{ ...companyNode(company, { contact: true, settings, points: journey.find((j) => j.id === company.id)?.points }), description: site.description, image: new URL(site.poster, site.url).toString() }] : []),
  ]);

  return (
    <RootShell lang={lang}>
      <SwitchProvider>
        <SubHeader name={site.name} groupUrl={groupUrl} siblings={siblings} hasProjects={site.projects.length > 0} lang={lang} />
        <main id="main">{children}</main>
        <SubFooter site={site} groupUrl={groupUrl} siblings={siblings} lang={lang} groupLegalLang={groupLegalLang} />
        <BackToTop lang={lang} />
        <JsonLdScript data={jsonLd} />
      </SwitchProvider>
    </RootShell>
  );
}
