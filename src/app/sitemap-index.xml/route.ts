import { externalUrls, siteUrl, subdomainUrl } from "@/lib/urls";

/**
 * Sitemap index: qrupun bütün saytlarının sitemap-larını bir yerdə göstərir.
 * Search Console-da "Domain" property (cesgroup.az) bütün subdomenləri əhatə etdiyi üçün
 * bu fayl bir dəfə göndərilir və aşağıdakı sitemap-ların hamısı oxunur.
 */
export function GET() {
  const sitemaps = [
    `${siteUrl}/sitemap.xml`,
    `${externalUrls.equipment}/sitemap.xml`,
    `${externalUrls.architect}/sitemap.xml`,
    `${subdomainUrl("construction")}/sitemap.xml`,
    `${subdomainUrl("farmart")}/sitemap.xml`,
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
