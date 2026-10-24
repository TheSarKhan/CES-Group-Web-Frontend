import { companies, journey, projects, site, type Company } from "@/content/site";
import { defaultOgImage } from "./seo";

/** schema.org (JSON-LD) qurucuları: Organization, WebSite, səhifə və breadcrumb qovşaqları */

const COUNTRY = { "@type": "Country", name: "Azərbaycan" };

export const abs = (path: string, base: string = site.url) => new URL(path, base).toString();
export const orgId = (url: string) => `${url}/#organization`;
export const websiteId = (url: string) => `${url}/#website`;

const address = {
  "@type": "PostalAddress",
  streetAddress: site.addressParts.street,
  addressLocality: site.addressParts.city,
  addressRegion: site.addressParts.region,
  addressCountry: "AZ",
};

const openingHours = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: site.hours.opens,
  closes: site.hours.closes,
};

const contactPoint = {
  "@type": "ContactPoint",
  contactType: "customer service",
  telephone: site.phone,
  email: site.email,
  areaServed: "AZ",
  availableLanguage: ["az"],
};

/** Şirkət qovşağı: qrupun ana səhifəsində də, öz subsaytında da eyni @id ilə işlənir */
export function companyNode(c: Company, { contact = false }: { contact?: boolean } = {}) {
  // Hələ fəaliyyətə başlamayan istiqamətin xidmətləri schema-ya Service kimi yazılmır
  const services = c.planned ? [] : (journey.find((j) => j.id === c.id)?.points ?? []);
  return {
    "@type": "Organization",
    "@id": orgId(c.url),
    name: c.name,
    legalName: c.legalName,
    url: c.url,
    description: `${c.field}. ${c.description}`,
    foundingDate: c.founded,
    parentOrganization: { "@id": orgId(site.url) },
    areaServed: COUNTRY,
    ...(contact && { telephone: site.phone, email: site.email, address, openingHoursSpecification: openingHours, contactPoint }),
    makesOffer: services.map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: c.id === "equipment" ? `${name} icarəsi` : name,
        serviceType: c.field,
        provider: { "@id": orgId(c.url) },
        areaServed: COUNTRY,
      },
    })),
  };
}

export const graph = (nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** Ana səhifə: sayt, qrup (yerli biznes kimi) və dörd şirkət */
export function groupGraph() {
  const id = orgId(site.url);
  return graph([
    { "@type": "WebSite", "@id": websiteId(site.url), url: site.url, name: site.name, inLanguage: "az", publisher: { "@id": id } },
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": id,
      name: site.name,
      legalName: site.legalName,
      alternateName: ["CES", "Construction Equipment Services"],
      url: site.url,
      image: abs(defaultOgImage.url),
      description: site.description,
      foundingDate: site.foundingDate,
      telephone: site.phone,
      email: site.email,
      address,
      hasMap: site.mapUrl,
      openingHoursSpecification: openingHours,
      contactPoint,
      areaServed: COUNTRY,
      sameAs: site.social.map((s) => s.href),
      numberOfEmployees: { "@type": "QuantitativeValue", minValue: 20 },
      subOrganization: companies.map((c) => ({ "@id": orgId(c.url) })),
    },
    ...companies.map((c) => companyNode(c)),
  ]);
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(items: Crumb[], base: string = site.url) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(items[items.length - 1].path, base)}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path, base) })),
  };
}

type PageNode = {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
  base?: string;
  path: string;
  name: string;
  description: string;
  image?: string;
  crumbs: Crumb[];
  extra?: object;
};

/** Səhifə + breadcrumb qovşaqları (graph içində istifadə üçün) */
export function pageNodes({ type = "WebPage", base = site.url, path, name, description, image, crumbs, extra }: PageNode) {
  const url = abs(path, base);
  return [
    {
      "@type": type,
      "@id": `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: "az",
      isPartOf: { "@id": websiteId(base) },
      publisher: { "@id": orgId(base) },
      breadcrumb: { "@id": `${abs(crumbs[crumbs.length - 1].path, base)}#breadcrumb` },
      ...(image && { primaryImageOfPage: { "@type": "ImageObject", url: abs(image, base) } }),
      ...extra,
    },
    breadcrumbNode(crumbs, base),
  ];
}

export const itemList = (items: { name: string; url: string }[]) => ({
  "@type": "ItemList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: it.url })),
});

export const faqQuestions = (items: { q: string; a: string }[]) =>
  items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } }));

export const projectsItemList = () => itemList(projects.map((p) => ({ name: p.title, url: abs(`/layiheler/${p.slug}`) })));
