import { companies, site } from "@/content/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    foundingDate: String(site.founded),
    description: site.description,
    subOrganization: companies.map((c) => ({ "@type": "Organization", name: c.name, url: c.url, description: c.field })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
