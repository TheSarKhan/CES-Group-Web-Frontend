"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Building2, ChartColumn, ChevronRight, ChevronsUpDown, Eye, FileText, Folder, Home, ListChecks, MessageSquare, Pencil, Plus, Settings, StickyNote, Trash2, Undo2, Users, Wrench, ArrowUp, ArrowDown, Info } from "lucide-react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import { previewUrl } from "@/lib/admin/preview";
import { gapsFor } from "@/lib/admin/translations";
import type { ContentEntry, ContentSummary, ContentType, Revision, Seo } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { ImageField } from "./ImageFields";
import { Modal } from "./Modal";
import { LangTabs, SchemaForm, type Lang } from "./SchemaForm";
import { Notice, PageHeader, Pill, RowMenu, SearchBox, Toggle, useCrumbs, type Tone } from "./ui";

const base = (site: string) => `panel/sites/${site}/content`;

const TYPE_ICONS: Record<string, ReactNode> = {
  settings: <Settings size={30} />,
  stats: <ChartColumn size={30} />,
  about: <FileText size={30} />,
  client: <Users size={30} />,
  project: <Folder size={30} />,
  "project-approach": <ListChecks size={30} />,
  company: <Building2 size={30} />,
  "faq-group": <MessageSquare size={30} />,
  "legal-page": <FileText size={30} />,
  subsite: <Home size={30} />,
  service: <Wrench size={30} />,
  "sub-project": <Folder size={30} />,
  portfolio: <Folder size={30} />,
  "service-note": <StickyNote size={30} />,
  "arch-home": <Home size={30} />,
};

/** Saytın məzmun bölmələri */
export function ContentHub({ code }: { code: string }) {
  const { me } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const types = useApi<ContentType[]>(`${base(code)}/types`);
  useCrumbs([{ label: "Məzmun" }, { label: site?.name ?? code }]);
  if (!site) return <p className={styles.error}>Sayt tapılmadı.</p>;
  return (
    <>
      <PageHeader title="Məzmun" sub="Dəyişikliklər qaralama kimi saxlanılır, dərc etdikdə sayta çıxır." />
      {types.error ? (
        <Notice tone="bad">{types.error}</Notice>
      ) : !types.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : types.data.length === 0 ? (
        <p className={styles.muted}>Bu sayt üçün idarə olunan məzmun növü hələ yoxdur.</p>
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {types.data.map((t) => (
            <Link key={t.code} href={`/sites/${code}/content/${t.code}`} className={`${styles.card} ${styles.hubCard}`}>
              <span className={styles.iconTile}>{TYPE_ICONS[t.code] ?? <FileText size={30} />}</span>
              <div>
                <h3>{t.label}</h3>
                <p>{t.description}</p>
              </div>
              <ChevronRight size={22} className={styles.hubArrow} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

const statusOf = (e: { status: string; hasChanges: boolean }): { text: string; tone: Tone } =>
  e.status === "DRAFT" ? { text: "Qaralama", tone: "muted" } : e.hasChanges ? { text: "Dərc olunub — dəyişiklik var", tone: "violet" } : { text: "Dərc olunub", tone: "ok" };

type SortKey = "title" | "slug" | "status" | "gaps" | "updatedAt";

export function ContentList({ code, type }: { code: string; type: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const types = useApi<ContentType[]>(`${base(code)}/types`);
  const list = useApi<ContentSummary[]>(`${base(code)}/${type}`);
  const def = types.data?.find((t) => t.code === type);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  useCrumbs([{ label: "Məzmun", href: `/sites/${code}/content` }, { label: site?.name ?? code }, { label: def?.label ?? "" }]);

  const gapsOf = (e: ContentSummary) => (e.draftGaps?.en ?? 0) + (e.draftGaps?.ru ?? 0);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = (list.data ?? []).filter((e) => !needle || e.title.toLowerCase().includes(needle) || e.slug.toLowerCase().includes(needle));
    // Sıralama seçilməyibsə saytdakı sıra (sortOrder) saxlanılır: yuxarı/aşağı düymələri onu dəyişir
    if (sort) {
      const v = (e: ContentSummary) => (sort.key === "title" ? e.title.toLowerCase() : sort.key === "slug" ? e.slug : sort.key === "status" ? statusOf(e).text : sort.key === "gaps" ? gapsOf(e) : e.updatedAt);
      r = [...r].sort((a, b) => (v(a) < v(b) ? -sort.dir : v(a) > v(b) ? sort.dir : 0));
    }
    return r;
  }, [list.data, q, sort]);

  async function remove(e: ContentSummary) {
    if (!confirm(`"${e.title}" silinsin?`)) return;
    try {
      await api(`${base(code)}/${type}/${e.id}`, { method: "DELETE" });
      list.reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinmədi.");
    }
  }

  async function move(e: ContentSummary, d: -1 | 1) {
    const all = list.data ?? [];
    const i = all.findIndex((x) => x.id === e.id);
    const j = i + d;
    if (i < 0 || j < 0 || j >= all.length) return;
    const ids = all.map((r) => r.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    try {
      await api(`${base(code)}/${type}/reorder`, { method: "PUT", body: { ids } });
    } finally {
      list.reload();
    }
  }

  if (!site) return <p className={styles.error}>Sayt tapılmadı.</p>;
  if (types.error || list.error) return <Notice tone="bad">{types.error ?? list.error}</Notice>;
  if (!def || !list.data) return <p className={styles.loading}>Yüklənir…</p>;

  const canCreate = can(def.module, "CREATE", code) && (!def.singleton || list.data.length === 0);
  const canEdit = can(def.module, "UPDATE", code);
  const head = (key: SortKey, label: string, hint?: string) => (
    <th>
      <button type="button" onClick={() => setSort((s) => (s?.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))} style={{ background: "none", border: 0, font: "inherit", fontWeight: 600, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", padding: 0 }}>
        {label}
        <ChevronsUpDown size={14} style={{ opacity: sort?.key === key ? 1 : 0.45 }} />
      </button>
      {hint && <span className={styles.cellSub}>{hint}</span>}
    </th>
  );
  return (
    <>
      <PageHeader
        back={{ href: `/sites/${code}/content`, label: "Məzmun" }}
        title={def.label}
        sub={def.description}
        actions={
          canCreate && (
            <Link href={`/sites/${code}/content/${type}/new`} className={`${styles.btn} ${styles.btnGold}`}>
              <Plus size={18} /> Yeni
            </Link>
          )
        }
      />
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={setQ} placeholder="Ad və ya keçid üzrə axtar…" />
          <span className={styles.toolbarEnd}>{rows.length} qeyd</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {head("title", "Ad")}
                {head("slug", "Keçid (slug)")}
                {head("status", "Status")}
                {head("gaps", "Tərcümə", "Rəqəm çatışmayan sahə sayıdır.")}
                {head("updatedAt", "Son dəyişiklik")}
                <th style={{ textAlign: "right" }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.muted}>
                    Hələ heç nə yoxdur.
                  </td>
                </tr>
              )}
              {rows.map((e) => {
                const st = statusOf(e);
                const idx = (list.data ?? []).findIndex((x) => x.id === e.id);
                return (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/sites/${code}/content/${type}/${e.id}`} className={styles.cellMain}>
                        {e.title}
                      </Link>
                    </td>
                    <td>{e.slug}</td>
                    <td>
                      <Pill tone={st.tone}>{st.text}</Pill>
                    </td>
                    <td>
                      <div className={styles.row} style={{ gap: 6 }}>
                        {(["en", "ru"] as const).map((l) => {
                          const gaps = e.draftGaps?.[l] ?? 0;
                          const live = e.publishedGaps ? e.publishedGaps[l] === 0 : false;
                          return (
                            <Pill key={l} tone={live ? "ok" : gaps === 0 ? "muted" : "gold"} title={live ? "Bu dildə saytda açıqdır" : gaps === 0 ? "Tərcümə tamdır, amma dərc olunmayıb" : `${gaps} sahənin tərcüməsi çatışmır, bu dildə sayt açılmır`}>
                              {l.toUpperCase()} {live ? "tam" : gaps === 0 ? "hazır" : gaps}
                            </Pill>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      {fmtDate(e.updatedAt)}
                      {e.updatedBy && <span className={styles.cellSub}>{e.updatedBy}</span>}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        {canEdit && !def.singleton && !q && !sort && (
                          <>
                            <button type="button" className={styles.iconBtn} onClick={() => move(e, -1)} disabled={idx === 0} aria-label="Yuxarı">
                              <ArrowUp size={18} />
                            </button>
                            <button type="button" className={styles.iconBtn} onClick={() => move(e, 1)} disabled={idx === (list.data ?? []).length - 1} aria-label="Aşağı">
                              <ArrowDown size={18} />
                            </button>
                          </>
                        )}
                        <Link href={`/sites/${code}/content/${type}/${e.id}`} className={styles.iconBtn} aria-label={canEdit ? "Redaktə" : "Bax"}>
                          {canEdit ? <Pencil size={18} /> : <Eye size={18} />}
                        </Link>
                        <RowMenu
                          items={[
                            { label: canEdit ? "Redaktə et" : "Bax", icon: <Pencil size={16} />, href: `/sites/${code}/content/${type}/${e.id}` },
                            { label: "Sil", icon: <Trash2 size={16} />, danger: true, hidden: !can(def.module, "DELETE", code), onClick: () => remove(e) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFoot}>
          <span>{list.data.length} qeyd</span>
          {!def.singleton && (
            <span className={styles.footHint}>
              <Info size={16} /> Sıranı dəyişmək üçün yuxarı/aşağı düymələrindən istifadə edin.
            </span>
          )}
        </div>
      </section>
    </>
  );
}

type Draft = { data: Record<string, unknown>; seo: Seo; slug: string };

export function ContentEditor({ code, type, id }: { code: string; type: string; id: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const types = useApi<ContentType[]>(`${base(code)}/types`);
  const isNew = id === "new";
  const entry = useApi<ContentEntry>(isNew ? null : `${base(code)}/${type}/${id}`);
  const def = types.data?.find((t) => t.code === type);

  if (!site) return <p className={styles.error}>Sayt tapılmadı.</p>;
  if (types.error || entry.error) return <Notice tone="bad">{types.error ?? entry.error}</Notice>;
  if (!def || (!isNew && !entry.data)) return <p className={styles.loading}>Yüklənir…</p>;

  return <EditorBody key={entry.data?.updatedAt ?? "new"} code={code} def={def} entry={entry.data ?? null} onReload={entry.reload} siteName={site.name} domain={site.domain} can={can} />;
}

function titleOf(def: ContentType, data: Record<string, unknown>, fallback: string) {
  const v = data[def.titleField];
  const text = typeof v === "string" ? v : v && typeof v === "object" ? String((v as Record<string, unknown>).az ?? "") : "";
  return text || fallback;
}

function EditorBody({ code, def, entry, onReload, siteName, domain, can }: { code: string; def: ContentType; entry: ContentEntry | null; onReload: () => void; siteName: string; domain: string; can: (m: string, a: "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "PUBLISH", s?: string) => boolean }) {
  const router = useRouter();
  const initial = useMemo<Draft>(() => ({ data: entry?.data ?? {}, seo: entry?.seo ?? {}, slug: entry?.slug ?? "" }), [entry]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [lang, setLang] = useState<Lang>("az");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showRevisions, setShowRevisions] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const canUpdate = entry ? can(def.module, "UPDATE", code) : can(def.module, "CREATE", code);
  const canPublish = can(def.module, "PUBLISH", code);
  const title = titleOf(def, draft.data, entry ? def.label : `Yeni: ${def.label}`);
  useCrumbs([{ label: "Məzmun", href: `/sites/${code}/content` }, { label: def.label, href: `/sites/${code}/content/${def.code}` }, { label: entry ? "Redaktə" : "Yeni" }]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const path = `${base(code)}/${def.code}`;
  const body = { slug: draft.slug || undefined, data: draft.data, seo: draft.seo };

  async function save(): Promise<ContentEntry | null> {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = entry ? await api<ContentEntry>(`${path}/${entry.id}`, { method: "PUT", body }) : await api<ContentEntry>(path, { method: "POST", body });
      if (!entry) router.replace(`/sites/${code}/content/${def.code}/${saved.id}`);
      else onReload();
      setNotice("Qaralama saxlanıldı. Saytda hələ dəyişiklik yoxdur.");
      return saved;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xəta baş verdi.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const note = window.prompt("Dəyişiklik haqqında qısa qeyd (könüllü):", "");
    if (note === null) return;
    const saved = dirty || !entry ? await save() : entry;
    if (!saved) return;
    setBusy(true);
    try {
      await api(`${path}/${saved.id}/publish`, { method: "POST", body: { note } });
      setNotice("Dərc olundu. Sayt bir neçə saniyəyə yenilənəcək.");
      if (entry) onReload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Dərc olunmadı.");
    } finally {
      setBusy(false);
    }
  }

  /** Qaralamanı saxlayıb saytda yeni pəncərədə göstərir (qaralama yalnız bu brauzerdə görünür, 10 dəqiqə) */
  async function preview() {
    const win = window.open("about:blank", "_blank");
    const saved = dirty || !entry ? await save() : entry;
    if (!saved) {
      win?.close();
      return;
    }
    try {
      const { token } = await api<{ token: string }>(`${path}/${saved.id}/preview-token`, { method: "POST" });
      const url = previewUrl(code, def.code, saved.slug, token, lang);
      if (!url) throw new Error("no-site");
      if (win) win.location.href = url;
      else window.open(url, "_blank");
    } catch (e) {
      win?.close();
      setError(e instanceof ApiError ? e.message : "Önizləmə açılmadı.");
    }
  }

  async function unpublish() {
    if (!entry || !confirm("Dərcdən çıxarılsın? Məzmun saytdan götürüləcək, qaralama qalacaq.")) return;
    setBusy(true);
    try {
      await api(`${path}/${entry.id}/unpublish`, { method: "POST" });
      onReload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  const st = entry ? statusOf(entry) : { text: "Yeni", tone: "gold" as Tone };
  const setSeo = (patch: Partial<Seo>) => setDraft((d) => ({ ...d, seo: { ...d.seo, ...patch } }));
  const seoText = (k: "title" | "description") => draft.seo[k]?.[lang] ?? "";
  const setSeoText = (k: "title" | "description", v: string) => setSeo({ [k]: { ...(draft.seo[k] ?? {}), [lang]: v } });

  return (
    <>
      <PageHeader
        back={{ href: `/sites/${code}/content/${def.code}`, label: def.label }}
        title={title}
        status={<Pill tone={st.tone === "muted" ? "gold" : st.tone}>{st.text}</Pill>}
        sub={entry?.publishedAt ? `Son dərc: ${fmtDate(entry.publishedAt)}${entry.publishedBy ? `, ${entry.publishedBy}` : ""}` : def.description}
        actions={
          <>
            {entry && (
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowRevisions(true)}>
                Versiyalar
              </button>
            )}
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} disabled={busy} onClick={preview} title="Qaralamanı saytda yalnız siz görürsünüz">
              Önizlə
            </button>
            {canUpdate && (
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} disabled={busy || (!dirty && !!entry)} onClick={() => void save()}>
                {busy ? "Saxlanılır…" : "Qaralamanı saxla"}
              </button>
            )}
            {canPublish && (
              <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy || (!!entry && !dirty && !entry.hasChanges && entry.status === "PUBLISHED")} onClick={publish}>
                Dərc et
              </button>
            )}
            {canPublish && entry?.status === "PUBLISHED" && <RowMenu items={[{ label: "Dərcdən çıxar", icon: <Undo2 size={16} />, danger: true, onClick: unpublish }]} />}
          </>
        }
      />

      {(error || notice) && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone={error ? "bad" : "info"}>{error || notice}</Notice>
        </div>
      )}

      <div className={styles.editorGrid}>
        <section className={`${styles.panel} ${styles.panelPad}`}>
          <div className={styles.panelHead} style={{ marginBottom: 6 }}>
            <div>
              <h2>Məzmun</h2>
              <p className={styles.panelSub}>{def.description || "Məzmunu aşağıdakı dillərdə redaktə edin."}</p>
            </div>
          </div>
          <LangTabs lang={lang} onChange={setLang} gaps={{ en: gapsFor(draft.data, "en"), ru: gapsFor(draft.data, "ru") }} />
          <p className={styles.langNote}>AZ məcburidir. EN və RU könüllüdür.</p>
          <SchemaForm fields={def.fields} value={draft.data} lang={lang} site={code} onChange={(data) => setDraft((d) => ({ ...d, data }))} />
        </section>

        <div className={styles.editorCol}>
          {!def.singleton && (
            <section className={`${styles.panel} ${styles.panelPad}`}>
              <div className={styles.panelHead} style={{ marginBottom: 12 }}>
                <div>
                  <h2>URL hissəsi</h2>
                  <p className={styles.panelSub}>Məzmunun saytda görünəcək ünvanını təyin edin.</p>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="slug">URL</label>
                <div className={styles.inputAddon}>
                  <span>{domain}/</span>
                  <input id="slug" className={styles.input} value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} disabled={entry?.status === "PUBLISHED"} placeholder="Boş qalsa başlıqdan yaranır" />
                </div>
                <span className={styles.hint}>{entry?.status === "PUBLISHED" ? "Dərc olunmuş məzmunun ünvanı dəyişdirilmir." : "Yalnız kiçik hərf, rəqəm və tire istifadə edin."}</span>
              </div>
            </section>
          )}

          <section className={`${styles.panel} ${styles.panelPad}`}>
            <div className={styles.panelHead} style={{ marginBottom: 12 }}>
              <div>
                <h2>SEO məlumatları</h2>
                <p className={styles.panelSub}>Axtarış sistemlərində daha yaxşı görünmək üçün doldurun. Boş buraxsanız saytın özü məzmundan yaradır. Dil: {lang.toUpperCase()}.</p>
              </div>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="seo-title">Meta başlıq</label>
                <input id="seo-title" className={styles.input} maxLength={70} value={seoText("title")} onChange={(e) => setSeoText("title", e.target.value)} />
                <span className={styles.hint} style={{ textAlign: "right" }}>{seoText("title").length}/70</span>
              </div>
              <div className={styles.field}>
                <label htmlFor="seo-desc">Meta təsvir</label>
                <textarea id="seo-desc" className={styles.input} rows={3} maxLength={200} value={seoText("description")} onChange={(e) => setSeoText("description", e.target.value)} />
                <span className={styles.hint} style={{ textAlign: "right" }}>{seoText("description").length}/200</span>
              </div>
              <div className={styles.field}>
                <label htmlFor="seo-canonical">Kanonik URL (opsional)</label>
                <input id="seo-canonical" className={styles.input} value={draft.seo.canonical ?? ""} onChange={(e) => setSeo({ canonical: e.target.value || undefined })} placeholder="https://" />
                <span className={styles.hint}>Fərqli bir URL göstərmək istəyirsinizsə, daxil edin.</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Sosial şəbəkə şəkli (opsional)</span>
                <ImageField folder="misc" site={code} crop="free" value={draft.seo.ogImage ?? ""} onChange={(v) => setSeo({ ogImage: v || undefined })} contain={false} />
                <span className={styles.hint}>Tövsiyə olunan ölçü: 1200 × 630 piksel.</span>
              </div>
              <div className={styles.toggleRow}>
                <Toggle checked={!!draft.seo.noindex} onChange={(v) => setSeo({ noindex: v || undefined })} label="Axtarış sistemlərində göstərilməsin" />
                <span>Axtarış sistemlərində göstərilməsin (noindex)</span>
              </div>
            </div>
          </section>

          <Notice title="Qaralama saxlanması saytı dəyişmir.">Dərc et düyməsini sıxana qədər edilən dəyişikliklər saytda görünməyəcək.</Notice>
          {dirty && <p className={styles.hint}>Saxlanmamış dəyişiklik var.</p>}
        </div>
      </div>

      <p className={styles.sampleTag} style={{ marginTop: 12 }}>
        {siteName}
      </p>
      {showRevisions && entry && <RevisionsDialog path={`${path}/${entry.id}`} canRestore={canUpdate} onClose={() => setShowRevisions(false)} onRestored={() => { setShowRevisions(false); onReload(); }} />}
    </>
  );
}

function RevisionsDialog({ path, canRestore, onClose, onRestored }: { path: string; canRestore: boolean; onClose: () => void; onRestored: () => void }) {
  const revs = useApi<Revision[]>(`${path}/revisions`);
  const [sel, setSel] = useState<number | null>(null);
  async function restore(r: Revision) {
    if (!confirm(`Versiya ${r.version} qaralamaya yüklənsin? Saytda dəyişiklik olmayacaq, dərc etməlisiniz.`)) return;
    try {
      await api(`${path}/revisions/${r.id}/restore`, { method: "POST" });
      onRestored();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Bərpa olunmadı.");
    }
  }
  const current = revs.data?.find((r) => r.id === sel) ?? revs.data?.[0];
  return (
    <Modal title="Versiyalar" onClose={onClose} width={860}>
      <p className={styles.panelSub} style={{ marginTop: -10 }}>
        Son 20 versiya saxlanılır.
      </p>
      {revs.error ? (
        <Notice tone="bad">{revs.error}</Notice>
      ) : !revs.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : revs.data.length === 0 ? (
        <p className={styles.muted}>Hələ dərc olunmayıb.</p>
      ) : (
        <>
          <div className={`${styles.panel} ${styles.tableWrap}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarix</th>
                  <th>İstifadəçi</th>
                  <th>Qeyd</th>
                  <th style={{ textAlign: "right" }}>Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {revs.data.map((r) => (
                  <tr key={r.id} className={r.id === current?.id ? styles.rowHi : undefined} onClick={() => setSel(r.id)} style={{ cursor: "pointer" }}>
                    <td>{fmtDate(r.createdAt)}</td>
                    <td>{r.createdBy ?? "—"}</td>
                    <td>{r.note ?? `Versiya ${r.version}`}</td>
                    <td style={{ textAlign: "right" }}>
                      {canRestore && (
                        <button type="button" className={`${styles.btn} ${styles.btnOutlineGold} ${styles.btnSm}`} onClick={(e) => { e.stopPropagation(); void restore(r); }}>
                          Bərpa et
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {current && (
            <>
              <h3 className={styles.sectionTitle} style={{ margin: "4px 0 0" }}>
                Seçilmiş versiyanın məzmunu
              </h3>
              <pre className={styles.jsonBox}>{JSON.stringify(current.data ?? {}, null, 2)}</pre>
            </>
          )}
          <p className={styles.hint}>Bərpa əvvəlcə qaralamanı yeniləyir, saytda dəyişiklik olmaz.</p>
        </>
      )}
      <div className={styles.modalFoot}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
          Bağla
        </button>
      </div>
    </Modal>
  );
}
