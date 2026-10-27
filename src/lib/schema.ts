import type { SiteSettings } from "@/content/cms-map";
import { companies as staticCompanies, journey as staticJourney, site, type Company, type JourneyStep, type Project } from "@/content/site";
import { defaultOgImage } from "./seo";

/** schema.org (JSON-LD) qurucuları: Organization, WebSite, səhifə və breadcrumb qovşaqları */

const COUNTRY = { "@type": "Country", name: "Azərbaycan" };

export const abs = (path: string, base: string = site.url) => new URL(path, base).toString();
export const orgId = (url: string) => `${url}/#organization`;
export const websiteId = (url: string) => `${url}/#website`;

type Settings = SiteSettings;

const addressOf = (s: Settings) => ({
  "@type": "PostalAddress",
  streetAddress: s.addressParts.street,
  addressLocality: s.addressParts.city,
  addressRegion: s.addressParts.region,
  addressCountry: "AZ",
});

const openingHoursOf = (s: Settings) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: s.hours.opens,
  closes: s.hours.closes,
});

const contactPointOf = (s: Settings) => ({
  "@type": "ContactPoint",
  contactType: "customer service",
  telephone: s.phone,
  email: s.email,
  areaServed: "AZ",
  availableLanguage: ["az"],
});

/** Şirkət qovşağı: qrupun ana səhifəsində də, öz subsaytında da eyni @id ilə işlənir */
export function companyNode(c: Company, { contact = false, settings = site, points }: { contact?: boolean; settings?: Settings; points?: string[] } = {}) {
  // Hələ fəaliyyətə başlamayan istiqamətin xidmətləri schema-ya Service kimi yazılmır
  const services = c.planned ? [] : (points ?? staticJourney.find((j) => j.id === c.id)?.points ?? []);
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
    ...(contact && { telephone: settings.phone, email: settings.email, address: addressOf(settings), openingHoursSpecification: openingHoursOf(settings), contactPoint: contactPointOf(settings) }),
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
export function groupGraph(settings: Settings = site, companies: Company[] = staticCompanies, journey: JourneyStep[] = staticJourney) {
  const id = orgId(site.url);
  return graph([
    { "@type": "WebSite", "@id": websiteId(site.url), url: site.url, name: site.name, inLanguage: "az", publisher: { "@id": id } },
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": id,
      name: site.name,
      legalName: settings.legalName,
      alternateName: ["CES", "CES Group Azərbaycan", "CES Azerbaijan", "Construction Equipment Services"],
      url: site.url,
      image: abs(defaultOgImage.url),
      description: settings.description,
      foundingDate: site.foundingDate,
      telephone: settings.phone,
      email: settings.email,
      address: addressOf(settings),
      hasMap: settings.mapUrl,
      openingHoursSpecification: openingHoursOf(settings),
      contactPoint: contactPointOf(settings),
      areaServed: COUNTRY,
      sameAs: settings.social.map((s) => s.href),
      numberOfEmployees: { "@type": "QuantitativeValue", minValue: 20 },
      subOrganization: companies.map((c) => ({ "@id": orgId(c.url) })),
    },
    ...companies.map((c) => companyNode(c, { points: journey.find((j) => j.id === c.id)?.points })),
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

export const projectsItemList = (projects: Project[]) => itemList(projects.map((p) => ({ name: p.title, url: abs(`/layiheler/${p.slug}`) })));
