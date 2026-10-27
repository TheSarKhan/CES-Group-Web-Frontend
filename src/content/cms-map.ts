/**
 * Panel məzmununu (JSON) saytın köhnə TS tiplərinə çevirən xalis funksiyalar. Eyni funksiyalar köçürmə skriptində
 * "DB-dən oxunan = fayldakı" yoxlaması üçün də işlənir.
 */
import { tr } from "@/lib/cms";
import type { Faq, FaqGroup } from "./faq";
import type { LegalDoc, LegalSection } from "./legal";
import type { Project, site as staticSite } from "./site";
import type { about as staticAbout, projectApproach as staticApproach, stats as staticStats } from "./site";

/** `site` obyektinin panel-dən idarə olunan sahələri */
export type SiteSettings = typeof staticSite;

type Data = Record<string, unknown>;
const arr = (v: unknown): Data[] => (Array.isArray(v) ? (v as Data[]) : []);
const lines = (s: string, sep: RegExp) => s.split(sep).map((x) => x.trim()).filter(Boolean);

export function faqGroupFrom(slug: string, d: Data): FaqGroup {
  return {
    id: slug,
    title: tr(d.title),
    lead: tr(d.lead),
    items: arr(d.items).map((it): Faq => {
      const href = typeof it.linkHref === "string" ? it.linkHref : "";
      return { q: tr(it.q), a: tr(it.a), ...(href ? { link: { href, label: tr(it.linkLabel) } } : {}) };
    }),
  };
}

export function legalFrom(d: Data): LegalDoc {
  return {
    title: tr(d.title),
    description: tr(d.description),
    updated: tr(d.updated),
    intro: tr(d.intro),
    sections: arr(d.sections).map((s): LegalSection => {
      const paragraphs = lines(tr(s.paragraphs), /\n{2,}/);
      const items = lines(tr(s.items), /\n/);
      return { id: String(s.id ?? ""), title: tr(s.title), ...(paragraphs.length ? { paragraphs } : {}), ...(items.length ? { items } : {}) };
    }),
  };
}

/** Fayldakı tipdən panel formatına (köçürmə skripti üçün) */
export function faqGroupTo(g: FaqGroup): Data {
  return {
    title: { az: g.title },
    ...(g.lead ? { lead: { az: g.lead } } : {}),
    items: g.items.map((i) => ({ q: { az: i.q }, a: { az: i.a }, ...(i.link ? { linkHref: i.link.href, linkLabel: { az: i.link.label } } : {}) })),
  };
}

export function legalTo(d: LegalDoc): Data {
  return {
    title: { az: d.title },
    description: { az: d.description },
    updated: { az: d.updated },
    intro: { az: d.intro },
    sections: d.sections.map((s) => ({
      id: s.id,
      title: { az: s.title },
      ...(s.paragraphs?.length ? { paragraphs: { az: s.paragraphs.join("\n\n") } } : {}),
      ...(s.items?.length ? { items: { az: s.items.join("\n") } } : {}),
    })),
  };
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Panel ayarlarını (JSON) `site` obyektinin formasına çevirir; panel-də olmayan sahələr köhnə dəyərdə qalır */
export function settingsFrom(d: Data, base: SiteSettings): SiteSettings {
  const social = arr(d.social).map((s) => ({ label: str(s.label), href: str(s.href) }));
  return {
    ...base,
    description: tr(d.description) || base.description,
    legalName: str(d.legalName) || base.legalName,
    address: tr(d.address) || base.address,
    addressParts: {
      street: str(d.addressStreet) || base.addressParts.street,
      region: str(d.addressRegion) || base.addressParts.region,
      city: str(d.addressCity) || base.addressParts.city,
    },
    mapQuery: str(d.mapQuery) || base.mapQuery,
    mapUrl: str(d.mapUrl) || base.mapUrl,
    email: str(d.email) || base.email,
    phone: str(d.phone) || base.phone,
    whatsapp: str(d.whatsapp) || base.whatsapp,
    hours: {
      opens: str(d.hoursOpens) || base.hours.opens,
      closes: str(d.hoursCloses) || base.hours.closes,
      label: tr(d.hoursLabel) || base.hours.label,
    },
    social: social.length ? social : base.social,
  };
}

export function settingsTo(s: SiteSettings): Data {
  return {
    legalName: s.legalName,
    description: { az: s.description },
    phone: s.phone,
    email: s.email,
    whatsapp: s.whatsapp,
    address: { az: s.address },
    addressStreet: s.addressParts.street,
    addressRegion: s.addressParts.region,
    addressCity: s.addressParts.city,
    mapQuery: s.mapQuery,
    mapUrl: s.mapUrl,
    hoursOpens: s.hours.opens,
    hoursCloses: s.hours.closes,
    hoursLabel: { az: s.hours.label },
    social: s.social.map((x) => ({ label: x.label, href: x.href })),
  };
}

// ---- Ana səhifə məzmunu ---------------------------------------------------------------------------------------

export type Stat = (typeof staticStats)[number];
export type About = typeof staticAbout;
export type Approach = typeof staticApproach;
export type Client = { name: string; logo: string };

export const statsFrom = (d: Data): Stat[] => arr(d.items).map((i) => ({ value: str(i.value), label: tr(i.label) }));
export const statsTo = (list: Stat[]): Data => ({ items: list.map((i) => ({ value: i.value, label: { az: i.label } })) });

export const aboutFrom = (d: Data): About => ({
  lead: tr(d.lead),
  mission: tr(d.mission),
  vision: tr(d.vision),
  values: arr(d.values).map((v) => ({ title: tr(v.title), text: tr(v.text) })),
  timeline: arr(d.timeline).map((t) => ({ year: str(t.year), text: tr(t.text) })),
});
export const aboutTo = (a: About): Data => ({
  lead: { az: a.lead },
  mission: { az: a.mission },
  vision: { az: a.vision },
  values: a.values.map((v) => ({ title: { az: v.title }, text: { az: v.text } })),
  timeline: a.timeline.map((t) => ({ year: t.year, text: { az: t.text } })),
});

export const approachFrom = (d: Data): Approach => arr(d.items).map((i) => ({ title: tr(i.title), text: tr(i.text) }));
export const approachTo = (list: Approach): Data => ({ items: list.map((i) => ({ title: { az: i.title }, text: { az: i.text } })) });

export const clientFrom = (d: Data): Client => ({ name: str(d.name), logo: str(d.logo) });
export const clientTo = (c: Client): Data => ({ name: c.name, logo: c.logo });

export const projectFrom = (slug: string, d: Data): Project => ({
  slug,
  title: tr(d.title),
  company: str(d.company),
  image: str(d.image),
  alt: tr(d.alt),
  category: tr(d.category),
  location: tr(d.location),
  summary: tr(d.summary),
  body: lines(tr(d.body), /\n{2,}/),
  details: arr(d.details).map((x) => ({ label: tr(x.label), value: tr(x.value) })),
});
export const projectTo = (p: Project): Data => ({
  title: { az: p.title },
  company: p.company,
  image: p.image,
  alt: { az: p.alt },
  category: { az: p.category },
  location: { az: p.location },
  summary: { az: p.summary },
  body: { az: p.body.join("\n\n") },
  details: p.details.map((x) => ({ label: { az: x.label }, value: { az: x.value } })),
});
