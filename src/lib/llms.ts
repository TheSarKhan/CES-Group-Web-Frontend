import { site as staticSite } from "@/content/site";
import { faqItemsOf, getCompanies, getFaqGroups, getProjects, getSiteSettings, getStats } from "@/content/loaders";
import { isReadyProject, type SubSite } from "@/content/subsites";
import { GROUP_LLMS, SUB_LLMS } from "@/i18n/llms";
import { localePath, type Lang } from "@/lib/i18n";

/**
 * llms.txt: süni intellekt sistemləri üçün saytın qısa, faktlara əsaslanan təsviri (llmstxt.org formatı).
 * Mətn `content/` fayllarından yığılır, ona görə saytla həmişə uyğun qalır.
 */

const link = (title: string, url: string, text: string) => `- [${title}](${url}): ${text}`;

export async function groupLlmsTxt(lang: Lang = "az") {
  const t = GROUP_LLMS[lang];
  const site = { ...staticSite, ...(await getSiteSettings(lang)) };
  const faqItems = faqItemsOf(await getFaqGroups(lang));
  const projects = await getProjects(lang);
  const stats = await getStats(lang);
  const companies = await getCompanies(lang);
  const u = (path: string) => `${site.url}${localePath(lang, path)}`;
  const facts = [
    `${t.legalName}: ${site.legalName}`,
    t.founded(site.foundingDate),
    `${t.address}: ${site.address}`,
    `${t.phone}: ${site.phone}`,
    `${t.email}: ${site.email}`,
    `${t.hours}: ${site.hours.label}`,
    t.area,
    ...stats.slice(1).map((s) => `${s.value} ${s.label}`),
  ];
  const pl = t.pageLinks;

  return `# ${site.name}

> ${site.description}

${t.intro(site.name)}

## ${t.companies}

${companies.map((c) => link(c.name, u(`/sirketler/${c.id}`), `${c.field}. ${c.description} ${t.companySite}: ${c.url}`)).join("\n")}

## ${t.facts}

${facts.map((f) => `- ${f}`).join("\n")}

## ${t.projects}

${projects.map((p) => link(p.title, u(`/layiheler/${p.slug}`), p.summary)).join("\n")}

## ${t.faq}

${faqItems.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## ${t.pages}

${link(pl.companies[0], u("/sirketler"), pl.companies[1])}
${link(pl.faq[0], u("/suallar"), pl.faq[1])}
${link(pl.about[0], u("/haqqimizda"), pl.about[1])}
${link(pl.projects[0], u("/layiheler"), pl.projects[1])}
${link(pl.contact[0], u("/elaqe"), pl.contact[1])}
${link(pl.privacy[0], u("/mexfilik-siyaseti"), pl.privacy[1])}
${link(pl.terms[0], u("/istifade-sertleri"), pl.terms[1])}
`;
}

export async function subsiteLlmsTxt(s: SubSite, lang: Lang = "az") {
  const t = SUB_LLMS[lang];
  const site = { ...staticSite, ...(await getSiteSettings(lang)) };
  const companies = await getCompanies(lang);
  const company = companies.find((c) => c.id === s.id);
  const ready = s.projects.filter(isReadyProject);
  const u = (path: string) => `${s.url}${localePath(lang, path)}`;

  return `# ${s.name}

> ${s.description}

${t.companyOf(s.name, site.name, company ? t.since(company.legalName, company.founded) : "", lang === "az" ? site.url : `${site.url}${localePath(lang, "/")}`)}

## ${t.services}

${s.services.map((x) => link(x.label, u(`/xidmetlerimiz/${x.slug}`), x.description)).join("\n")}
${ready.length ? `\n## ${t.projects}\n\n${ready.map((p) => link(p.title, u(`/layihelerimiz/${p.slug}`), p.description)).join("\n")}\n` : ""}
## ${t.contact}

- ${t.address}: ${site.address}
- ${t.phone}: ${site.phone}
- ${t.email}: ${site.email}
- ${t.hours}: ${site.hours.label}
- ${t.contactPage}: ${u("/elaqe")}
`;
}
