/**
 * Panel-dən idarə olunan yönləndirmələr. Siyahı backend-dən 60 saniyədən bir yenilənir; köhnəlmiş siyahı dərhal
 * istifadə olunur ki, backend yavaş olanda səhifələr gecikməsin.
 */
type Rule = { from: string; to: string; code: number };
type Entry = { at: number; rules: Map<string, Rule>; loading: boolean };

const TTL_MS = 60_000;
const cache = new Map<string, Entry>();

async function load(site: string, entry: Entry) {
  const base = process.env.BACKEND_URL;
  if (!base || entry.loading) return;
  entry.loading = true;
  try {
    const res = await fetch(`${base}/api/v1/public/redirects/${site}`, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    if (res.ok) {
      const list = (await res.json()) as Rule[];
      entry.rules = new Map(list.map((r) => [r.from, r]));
      entry.at = Date.now();
    }
  } catch {
    /* backend əlçatmazdır: köhnə siyahı qalır */
  } finally {
    entry.loading = false;
  }
}

export async function findRedirect(site: string, pathname: string): Promise<Rule | null> {
  let entry = cache.get(site);
  if (!entry) {
    entry = { at: 0, rules: new Map(), loading: false };
    cache.set(site, entry);
    await load(site, entry); // ilk dəfə: qısa gözləyirik
  } else if (Date.now() - entry.at > TTL_MS) {
    void load(site, entry); // arxa fonda yenilənir
  }
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return entry.rules.get(key) ?? null;
}
