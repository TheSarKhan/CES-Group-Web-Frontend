/**
 * Panel məzmununu (JSON) saytın köhnə TS tiplərinə çevirən xalis funksiyalar. Eyni funksiyalar köçürmə skriptində
 * "DB-dən oxunan = fayldakı" yoxlaması üçün də işlənir.
 */
import { tr } from "@/lib/cms";
import type { Faq, FaqGroup } from "./faq";
import type { LegalDoc, LegalSection } from "./legal";

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
