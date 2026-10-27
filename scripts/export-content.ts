/**
 * Statik fayllardakı (src/content) məzmunu panelin bazasına köçürmək üçün SQL yaradır (bir dəfəlik, təkrar işlədilə bilər).
 *   npx tsx scripts/export-content.ts > seed.sql
 * Hər qeyd dərc olunmuş kimi yazılır (qaralama = dərc olunan), 1-ci versiya yaradılır. Mövcud qeydlərə toxunulmur.
 * Skript əvvəl yoxlayır: panel formatından geri çevrilən məzmun fayldakı ilə tam eynidir. Fərq olarsa dayanır.
 */
import { isDeepStrictEqual } from "node:util";
import { faqGroupFrom, faqGroupTo, legalFrom, legalTo, settingsFrom, settingsTo } from "../src/content/cms-map";
import { faqGroups } from "../src/content/faq";
import { privacy, terms } from "../src/content/legal";
import { site } from "../src/content/site";

type Entry = { site: string; type: string; slug: string; sort: number; data: unknown };
const entries: Entry[] = [];

faqGroups.forEach((g, i) => {
  const data = faqGroupTo(g);
  if (!isDeepStrictEqual(faqGroupFrom(g.id, data as Record<string, unknown>), g)) throw new Error(`FAQ qrupu çevrilmədi: ${g.id}`);
  entries.push({ site: "group", type: "faq-group", slug: g.id, sort: i, data });
});

for (const [slug, doc] of [["mexfilik-siyaseti", privacy], ["istifade-sertleri", terms]] as const) {
  const data = legalTo(doc);
  if (!isDeepStrictEqual(legalFrom(data as Record<string, unknown>), doc)) throw new Error(`Hüquqi səhifə çevrilmədi: ${slug}`);
  entries.push({ site: "group", type: "legal-page", slug, sort: 0, data });
}

{
  const data = settingsTo(site);
  if (!isDeepStrictEqual(settingsFrom(data as Record<string, unknown>, site), site)) throw new Error("Sayt ayarları çevrilmədi");
  entries.push({ site: "group", type: "settings", slug: "main", sort: 0, data });
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const out: string[] = ["-- Avtomatik yaradılıb: scripts/export-content.ts", "BEGIN;"];
for (const e of entries) {
  const json = JSON.stringify(e.data);
  if (json.includes("$j$")) throw new Error("JSON-da $j$ var");
  out.push(
    `INSERT INTO content_entries (site_id, type, slug, sort_order, status, draft_data, published_data, has_changes, published_at, published_by, updated_by)
SELECT s.id, ${q(e.type)}, ${q(e.slug)}, ${e.sort}, 'PUBLISHED', $j$${json}$j$, $j$${json}$j$, false, now(), 'import', 'import' FROM sites s WHERE s.code = ${q(e.site)}
ON CONFLICT (site_id, type, slug) WHERE deleted_at IS NULL DO NOTHING;`,
    `INSERT INTO content_revisions (entry_id, version, data, note, created_by)
SELECT c.id, 1, c.published_data, 'Statik fayldan köçürüldü', 'import' FROM content_entries c JOIN sites s ON s.id = c.site_id
WHERE s.code = ${q(e.site)} AND c.type = ${q(e.type)} AND c.slug = ${q(e.slug)} AND c.deleted_at IS NULL
ON CONFLICT (entry_id, version) DO NOTHING;`,
  );
}
out.push("COMMIT;");
console.log(out.join("\n"));
console.error(`${entries.length} qeyd hazırlandı`);
