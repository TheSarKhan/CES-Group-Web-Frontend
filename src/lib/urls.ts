/**
 * Saytlar arası linklər buradan gəlir ki, lokal və prod mühitlərində düzgün yerə getsin.
 *
 * - `NEXT_PUBLIC_SITE_URL` qrupun əsas ünvanıdır. Verilməsə: dev-də http://localhost:3000, prod-da https://cesgroup.az.
 *   Dev server başqa portda işləyirsə `.env.local`-da yazın: NEXT_PUBLIC_SITE_URL=http://localhost:3005
 * - Construction və Farmart bu tətbiqin özündən xidmət olunur, ona görə ünvanları əsas ünvandan çıxarılır:
 *   https://cesgroup.az → https://construction.cesgroup.az, http://localhost:3000 → http://construction.localhost:3000
 * - Equipment və Architect ayrı tətbiqlərdir, həmişə canlı ünvana gedir. Lokalda onları da işlətmək üçün
 *   NEXT_PUBLIC_URL_EQUIPMENT və NEXT_PUBLIC_URL_ARCHITECT dəyişənləri ilə ünvanı əvəz edin.
 * NEXT_PUBLIC_* dəyişənləri build zamanı kodun içinə yazılır, ona görə `process.env.X` birbaşa yazılmalıdır.
 */
const dev = process.env.NODE_ENV === "development";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (dev ? "http://localhost:3000" : "https://cesgroup.az")).replace(/\/$/, "");

/** Bu tətbiqin subdomain-i (construction, farmart) */
export function subdomainUrl(id: string) {
  const { protocol, host } = new URL(siteUrl);
  return `${protocol}//${id}.${host}`;
}

export const externalUrls = {
  equipment: process.env.NEXT_PUBLIC_URL_EQUIPMENT || "https://equipment.cesgroup.az",
  architect: process.env.NEXT_PUBLIC_URL_ARCHITECT || "https://architect.cesgroup.az",
};
