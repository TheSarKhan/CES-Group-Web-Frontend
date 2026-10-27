/** Saytın dilləri. Az kökdə qalır (mövcud URL-lər dəyişmir), en və ru `/en/...`, `/ru/...` prefiksi ilə açılır. */
export const LANGS = ["az", "en", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "az";
/** Marşrutu açıq olan dillər. Səhifənin özü isə yalnız məzmunu həmin dildə tam tərcümə olunubsa açılır (content/loaders.ts). */
export const ENABLED_LANGS: readonly Lang[] = LANGS;
/** Build zamanı əvvəlcədən yığılan dillər: en/ru tələb olunanda yığılır və 5 dəqiqədən bir yenilənir */
export const STATIC_LANGS: readonly Lang[] = ["az"];

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

/** Dilin URL prefiksi: az üçün boş */
export const prefixOf = (lang: Lang) => (lang === DEFAULT_LANG ? "" : `/${lang}`);

/** Daxili yolu dilə uyğun yola çevirir: ("en", "/elaqe") → "/en/elaqe"; ("az", "/") → "/" */
export function localePath(lang: Lang, path: string): string {
  if (lang === DEFAULT_LANG) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** hreflang və <html lang> üçün */
export const htmlLang: Record<Lang, string> = { az: "az", en: "en", ru: "ru" };
/** Open Graph locale */
export const ogLocale: Record<Lang, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU" };

/** Daxili keçidi (`/x`) dilə uyğunlaşdırır; xarici ünvanlara toxunmur */
export const localHref = (lang: Lang, href: string) => (href.startsWith("/") && !href.startsWith("//") ? localePath(lang, href) : href);
