import type { Metadata, Viewport } from "next";
import { subsiteIds } from "@/content/subsites";
import { getSubSite, groupUrl, siblingsOf, type SubSiteParams } from "@/lib/subsite";
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
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "az_AZ",
      siteName: site.name,
      title: site.name,
      description: site.description,
      url: site.url,
      images: [{ url: site.poster, width: 1280, height: 720 }],
    },
  };
}

export default async function SubSiteLayout({ children, params }: { children: React.ReactNode } & SubSiteParams) {
  const site = await getSubSite({ params });
  const siblings = siblingsOf(site.id);

  // Axtarış sistemləri bu saytın CES Group-un şirkəti olduğunu bilsin
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    parentOrganization: { "@type": "Organization", name: "CES Group", url: groupUrl },
  };

  return (
    <>
      <SubHeader name={site.name} groupUrl={groupUrl} siblings={siblings} />
      <main id="main">{children}</main>
      <SubFooter site={site} groupUrl={groupUrl} siblings={siblings} />
      <BackToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
