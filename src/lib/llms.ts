import { companies, projects, site, stats } from "@/content/site";
import { isReadyProject, type SubSite } from "@/content/subsites";

/**
 * llms.txt: süni intellekt sistemləri üçün saytın qısa, faktlara əsaslanan təsviri (llmstxt.org formatı).
 * Mətn `content/` fayllarından yığılır, ona görə saytla həmişə uyğun qalır.
 */

const link = (title: string, url: string, text: string) => `- [${title}](${url}): ${text}`;

export function groupLlmsTxt() {
  const facts = [
    `Hüquqi ad: ${site.legalName}`,
    `Qurulma: ${site.foundingDate} (CES ağır texnika icarəsi ilə başlayıb)`,
    `Ünvan: ${site.address}`,
    `Telefon: ${site.phone}`,
    `E-poçt: ${site.email}`,
    `İş saatları: ${site.hours.label}`,
    "Xidmət ərazisi: bütün Azərbaycan",
    ...stats.slice(1).map((s) => `${s.value} ${s.label}`),
  ];

  return `# ${site.name}

> ${site.description}

${site.name} dörd şirkəti birləşdirir: memarlıq (CES Architect), tikinti və podrat (CES Construction), ağır texnika icarəsi (CES Equipment) və innovativ fermerçilik (Farmart). Sifarişçi layihənin dizaynından icrasına və texnika təminatına qədər bütün mərhələlər üçün bir komanda ilə işləyir.

## Şirkətlər

${companies.map((c) => link(c.name, c.url, `${c.field}. ${c.description}`)).join("\n")}

## Əsas faktlar

${facts.map((f) => `- ${f}`).join("\n")}

## Layihələr

${projects.map((p) => link(p.title, `${site.url}/layiheler/${p.slug}`, p.summary)).join("\n")}

## Səhifələr

${link("Haqqımızda", `${site.url}/haqqimizda`, "Qrupun tarixi, missiyası, dəyərləri və şirkətlərin strukturu")}
${link("Layihələr", `${site.url}/layiheler`, "İştirak etdiyimiz layihələrin siyahısı")}
${link("Əlaqə", `${site.url}/elaqe`, "Müraciət forması, telefon, e-poçt və ünvan")}
`;
}

export function subsiteLlmsTxt(s: SubSite) {
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
- Telefon: ${site.phone}
- E-poçt: ${site.email}
- İş saatları: ${site.hours.label}
- Əlaqə səhifəsi (müraciət forması): ${s.url}/elaqe
`;
}
