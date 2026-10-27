/** Panel-dən "Önizlə" düyməsinin açdığı ünvan: saytın /api/preview marşrutu qaralamanı yalnız bu brauzerdə göstərir. */

const HOSTS: Record<string, string> = {
  group: "https://cesgroup.az",
  construction: "https://construction.cesgroup.az",
  agro: "https://farmart.cesgroup.az",
  architect: "https://architect.cesgroup.az",
};

/** Məzmun növünün saytdakı səhifəsi (yolu dilsiz). Ayrıca səhifəsi olmayan növlər onların göründüyü səhifəni açır. */
function pagePath(site: string, type: string, slug: string): string {
  if (site === "group") {
    switch (type) {
      case "project":
        return `/layiheler/${slug}`;
      case "project-approach":
        return "/layiheler";
      case "company":
        return `/sirketler/${slug}`;
      case "faq-group":
        return "/suallar";
      case "legal-page":
        return `/${slug}`;
      case "about":
        return "/haqqimizda";
      default:
        return "/"; // settings, stats, client
    }
  }
  if (site === "architect") {
    switch (type) {
      case "service":
        return `/xidmetlerimiz/${slug}`;
      case "portfolio":
        return `/layihelerimiz/${slug}`;
      case "service-note":
        return "/xidmetlerimiz";
      default:
        return "/"; // arch-home
    }
  }
  switch (type) {
    case "service":
      return `/xidmetlerimiz/${slug}`;
    case "sub-project":
      return `/layihelerimiz/${slug}`;
    default:
      return "/"; // subsite
  }
}

export function previewUrl(site: string, type: string, slug: string, token: string, lang: string): string | null {
  const host = HOSTS[site];
  if (!host) return null;
  const path = pagePath(site, type, slug);
  const localized = lang === "az" ? path : path === "/" ? `/${lang}` : `/${lang}${path}`;
  return `${host}/api/preview?token=${encodeURIComponent(token)}&path=${encodeURIComponent(localized)}`;
}
