/**
 * Backend-dən (panel) məzmun oxuyan qat. Backend əlçatmaz olarsa, boş cavab verərsə və ya BACKEND_URL verilməyibsə
 * `null` qaytarılır və çağıran köhnə fayldakı (src/content) məzmuna keçir, yəni sayt heç vaxt boş qalmır.
 *
 * Səhifələr 5 dəqiqədən bir arxa fonda yenilənir (ISR); panel-dən dərc edəndə backend `content:*` tag-ları ilə dərhal yeniləyir.
 */
export const CMS_REVALIDATE = 300;

export type CmsEntry = {
  slug: string;
  sortOrder: number;
  data: Record<string, unknown>;
  seo: { title?: Record<string, string>; description?: Record<string, string>; ogImage?: string; canonical?: string; noindex?: boolean };
  publishedAt: string | null;
};

const BASE = process.env.BACKEND_URL;

async function get<T>(path: string, tags: string[]): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/api/v1/public/content/${path}`, {
      next: { revalidate: CMS_REVALIDATE, tags },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Növün dərc olunmuş qeydləri (sıra ilə). Qeyd yoxdursa null. */
export async function cmsList(site: string, type: string): Promise<CmsEntry[] | null> {
  const list = await get<CmsEntry[]>(`${site}/${type}`, [`content:${site}`, `content:${site}:${type}`]);
  return list && list.length > 0 ? list : null;
}

export async function cmsEntry(site: string, type: string, slug: string): Promise<CmsEntry | null> {
  return get<CmsEntry>(`${site}/${type}/${slug}`, [`content:${site}`, `content:${site}:${type}`, `content:${site}:${type}:${slug}`]);
}

/** Tərcümə olunan sahədən seçilmiş dilin mətni (hələlik AZ), yoxdursa boş */
export const tr = (v: unknown, lang = "az"): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return String((v as Record<string, unknown>)[lang] ?? "");
  return "";
};
