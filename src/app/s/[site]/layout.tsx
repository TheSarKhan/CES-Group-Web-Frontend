import type { Metadata, Viewport } from "next";
import { companies } from "@/content/site";
import { subsiteIds } from "@/content/subsites";
import { getSubSite, groupUrl, siblingsOf, type SubSiteParams } from "@/lib/subsite";
import { graph, companyNode, websiteId, orgId } from "@/lib/schema";
import { JsonLdScript } from "@/components/JsonLd";
import { SubHeader } from "@/components/subsite/SubHeader";
import { SubFooter } from "@/components/subsite/SubFooter";
import { BackToTop } from "@/components/subsite/BackToTop";

// Yalnız tanınan subdomain saytları; digərləri 404
export const dynamicParams = false;

export function generateStaticParams() {
  return subsiteIds.map((site) => ({ site }));
}

export const viewport: Viewport = { themeColor: "#1e1e21" };

export async function generateMetadata(props: SubSiteParams): Promise<Metadata> {
  const site = await getSubSite(props);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    // Hər səhifə öz canonical, Open Graph və Twitter məlumatını pageMetadata ilə verir
    openGraph: { type: "website", locale: "az_AZ", siteName: site.name, images: [{ url: site.poster, width: 1280, height: 720 }] },
    twitter: { card: "summary_large_image", images: [site.poster] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default async function SubSiteLayout({ children, params }: { children: React.ReactNode } & SubSiteParams) {
  const site = await getSubSite({ params });
  const siblings = siblingsOf(site.id);

  // Axtarış sistemləri bu saytın CES Group-un şirkəti olduğunu bilsin (parentOrganization eyni @id ilə qrupa bağlanır)
  const company = companies.find((c) => c.id === site.id);
  const jsonLd = graph([
    { "@type": "WebSite", "@id": websiteId(site.url), url: site.url, name: site.name, inLanguage: "az", publisher: { "@id": orgId(site.url) } },
    ...(company ? [{ ...companyNode(company, { contact: true }), description: site.description, image: new URL(site.poster, site.url).toString() }] : []),
  ]);

  return (
    <>
      <SubHeader name={site.name} groupUrl={groupUrl} siblings={siblings} />
      <main id="main">{children}</main>
      <SubFooter site={site} groupUrl={groupUrl} siblings={siblings} />
      <BackToTop />
      <JsonLdScript data={jsonLd} />
    </>
  );
}
