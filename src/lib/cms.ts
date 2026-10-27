/**
 * Backend-dən (panel) məzmun oxuyan qat. Backend əlçatmaz olarsa, boş cavab verərsə və ya BACKEND_URL verilməyibsə
 * `null` qaytarılır və çağıran köhnə fayldakı (src/content) məzmuna keçir, yəni sayt heç vaxt boş qalmır.
 *
 * Səhifələr 5 dəqiqədən bir arxa fonda yenilənir (ISR); panel-dən dərc edəndə backend `content:*` tag-ları ilə dərhal yeniləyir.
 */
import { DEFAULT_LANG, type Lang } from "./i18n";
import { previewTarget, previewToken } from "./preview";

export const CMS_REVALIDATE = 300;

export type CmsEntry = {
  slug: string;
  sortOrder: number;
  data: Record<string, unknown>;
  seo: { title?: Record<string, string>; description?: Record<string, string>; ogImage?: string; canonical?: string; noindex?: boolean };
  publishedAt: string | null;
};

const BASE = process.env.BACKEND_URL;

async function get<T>(path: string, tags: string[], preview?: string | null): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/api/v1/public/content/${path}${preview ? `?preview=${encodeURIComponent(preview)}` : ""}`, {
      // Önizləmədə keş olmur (qaralama heç vaxt ISR keşinə düşməsin)
      ...(preview ? { cache: "no-store" as const } : { next: { revalidate: CMS_REVALIDATE, tags } }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

// ---- Dillər -----------------------------------------------------------------------------------------------------
// Tərcümə olunan sahə {az, en, ru} obyektidir. Seçilmiş dil üçün bütün belə sahələr tək mətnə çevrilir ki,
// çevirmə funksiyaları (cms-map) dildən xəbərsiz işləsin. En/ru üçün tərcüməsi tam olmayan qeyd "yoxdur" sayılır:
// tərcümə avtomatik yaradılmır, yarımçıq mətn dərc olunmur.

const LANG_KEYS = new Set<string>(["az", "en", "ru"]);
const isTranslatable = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LANG_KEYS.has(k));
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Qeyddəki bütün tərcümə sahələrini seçilmiş dilin mətninə çevirir */
export function localize(v: unknown, lang: Lang): unknown {
  if (isTranslatable(v)) return text(v[lang]);
  if (Array.isArray(v)) return v.map((x) => localize(x, lang));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, localize(x, lang)]));
  return v;
}

/** Azərbaycanca mətni olan hər sahənin seçilmiş dildə də mətni varmı */
export function isComplete(v: unknown, lang: Lang): boolean {
  if (lang === DEFAULT_LANG) return true;
  if (isTranslatable(v)) return !text(v[DEFAULT_LANG]) || !!text(v[lang]);
  if (Array.isArray(v)) return v.every((x) => isComplete(x, lang));
  if (v && typeof v === "object") return Object.values(v).every((x) => isComplete(x, lang));
  return true;
}

const forLang = (e: CmsEntry, lang: Lang): CmsEntry | null => {
  if (lang === DEFAULT_LANG) return e;
  return isComplete(e.data, lang) ? { ...e, data: localize(e.data, lang) as Record<string, unknown> } : null;
};

/** Növün dərc olunmuş qeydləri (sıra ilə). Qeyd yoxdursa (və ya seçilmiş dildə tam tərcümə olunmuş qeyd yoxdursa) null. */
export async function cmsList(site: string, type: string, lang: Lang = DEFAULT_LANG): Promise<CmsEntry[] | null> {
  let list = await get<CmsEntry[]>(`${site}/${type}`, [`content:${site}`, `content:${site}:${type}`]);
  // Önizləmə: işarənin adlandırdığı qeydin qaralaması siyahıda dərc olunmuş nüsxənin yerinə qoyulur (yeni qeyd isə əlavə olunur)
  const token = await previewToken();
  const target = token ? previewTarget(token) : null;
  if (token && target && target.site === site && target.type === type) {
    const draft = await get<CmsEntry>(`${site}/${type}/${target.slug}`, [], token);
    if (draft) list = [...(list ?? []).filter((e) => e.slug !== draft.slug), draft].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const ready = (list ?? []).map((e) => forLang(e, lang)).filter((e): e is CmsEntry => e !== null);
  return ready.length > 0 ? ready : null;
}

export async function cmsEntry(site: string, type: string, slug: string, lang: Lang = DEFAULT_LANG): Promise<CmsEntry | null> {
  const token = await previewToken();
  const e = await get<CmsEntry>(`${site}/${type}/${slug}`, [`content:${site}`, `content:${site}:${type}`, `content:${site}:${type}:${slug}`], token);
  return e ? forLang(e, lang) : null;
}

/** Tərcümə olunan sahədən seçilmiş dilin mətni (hələlik AZ), yoxdursa boş */
export const tr = (v: unknown, lang = "az"): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return String((v as Record<string, unknown>)[lang] ?? "");
  return "";
};
