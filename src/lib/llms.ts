import { companies, projects, site as staticSite, stats } from "@/content/site";
import { faqItemsOf, getFaqGroups, getSiteSettings } from "@/content/loaders";
import { isReadyProject, type SubSite } from "@/content/subsites";

/**
 * llms.txt: süni intellekt sistemləri üçün saytın qısa, faktlara əsaslanan təsviri (llmstxt.org formatı).
 * Mətn `content/` fayllarından yığılır, ona görə saytla həmişə uyğun qalır.
 */

const link = (title: string, url: string, text: string) => `- [${title}](${url}): ${text}`;

export async function groupLlmsTxt() {
  const site = { ...staticSite, ...(await getSiteSettings()) };
  const faqItems = faqItemsOf(await getFaqGroups());
  const facts = [
    `Hüquqi ad: ${site.legalName}`,
    `Qurulma: ${site.foundingDate} (CES ağır texnika icarəsi ilə başlayıb)`,
    `Ünvan: ${site.address}`,
    `Telefon və WhatsApp: ${site.phone}`,
    `E-poçt: ${site.email}`,
    `İş saatları: ${site.hours.label}`,
    "Xidmət ərazisi: bütün Azərbaycan",
    ...stats.slice(1).map((s) => `${s.value} ${s.label}`),
  ];

  return `# ${site.name}

> ${site.description}

${site.name} dörd şirkəti birləşdirir: memarlıq (CES Architect), tikinti və podrat (CES Construction), ağır texnika icarəsi (CES Equipment) və innovativ və təbii ekosistem (Farmart). Sifarişçi layihənin dizaynından icrasına və texnika təminatına qədər bütün mərhələlər üçün bir komanda ilə işləyir.

## Şirkətlər

${companies.map((c) => link(c.name, `${site.url}/sirketler/${c.id}`, `${c.field}. ${c.description} Şirkətin saytı: ${c.url}`)).join("\n")}

## Əsas faktlar

${facts.map((f) => `- ${f}`).join("\n")}

## Layihələr

${projects.map((p) => link(p.title, `${site.url}/layiheler/${p.slug}`, p.summary)).join("\n")}

## Tez-tez verilən suallar

${faqItems.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## Səhifələr

${link("Şirkətlər", `${site.url}/sirketler`, "Dörd şirkətin təsviri, xidmətləri, rəqəmləri və layihələri")}
${link("Tez-tez verilən suallar", `${site.url}/suallar`, "Texnika icarəsi, memarlıq, tikinti və Farmart üzrə suallar və cavablar")}
${link("Haqqımızda", `${site.url}/haqqimizda`, "Qrupun tarixi, missiyası, dəyərləri və şirkətlərin strukturu")}
${link("Layihələr", `${site.url}/layiheler`, "İştirak etdiyimiz layihələrin siyahısı")}
${link("Əlaqə", `${site.url}/elaqe`, "Müraciət forması, telefon, e-poçt və ünvan")}
${link("Məxfilik siyasəti", `${site.url}/mexfilik-siyaseti`, "Şəxsi məlumatların emalı")}
${link("İstifadə şərtləri", `${site.url}/istifade-sertleri`, "Saytdan istifadə qaydaları")}
`;
}

export async function subsiteLlmsTxt(s: SubSite) {
  const site = { ...staticSite, ...(await getSiteSettings()) };
  const company = companies.find((c) => c.id === s.id);
  const ready = s.projects.filter(isReadyProject);

  return `# ${s.name}

> ${s.description}

${s.name} ${site.name} qrupunun şirkətidir${company ? ` (${company.legalName}, ${company.founded}-ci ildən)` : ""}. Qrupun ana səhifəsi: ${site.url}

## Xidmətlər

${s.services.map((x) => link(x.label, `${s.url}/xidmetlerimiz/${x.slug}`, x.description)).join("\n")}
${ready.length ? `\n## Layihələr\n\n${ready.map((p) => link(p.title, `${s.url}/layihelerimiz/${p.slug}`, p.description)).join("\n")}\n` : ""}
## Əlaqə

- Ünvan: ${site.address}
- Telefon və WhatsApp: ${site.phone}
- E-poçt: ${site.email}
- İş saatları: ${site.hours.label}
- Əlaqə səhifəsi (müraciət forması): ${s.url}/elaqe
`;
}
