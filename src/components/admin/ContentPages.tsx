"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import { previewUrl } from "@/lib/admin/preview";
import { gapsFor } from "@/lib/admin/translations";
import type { ContentEntry, ContentSummary, ContentType, Revision, Seo } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { ImageField } from "./ImageFields";
import { Modal } from "./Modal";
import { LangTabs, SchemaForm, type Lang } from "./SchemaForm";
import { SiteTabs } from "./SiteTabs";

const base = (site: string) => `panel/sites/${site}/content`;

/** Saytın məzmun növləri */
export function ContentHub({ code }: { code: string }) {
  const { me } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const types = useApi<ContentType[]>(`${base(code)}/types`);
  if (!site) return <p className={styles.error}>Sayt tapılmadı.</p>;
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>Saytın məzmunu. Dəyişikliklər əvvəl qaralama kimi saxlanılır, “Dərc et” basana qədər saytda görünmür.</p>
        </div>
      </div>
      <SiteTabs code={code} current="content" />
      {types.error ? (
        <p className={styles.error}>{types.error}</p>
      ) : !types.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : types.data.length === 0 ? (
        <p className={styles.muted}>Bu sayt üçün idarə olunan məzmun növü hələ yoxdur.</p>
      ) : (
        <div className={styles.cards}>
          {types.data.map((t) => (
            <Link key={t.code} href={`/sites/${code}/content/${t.code}`} className={styles.card}>
              <span className={styles.cardTitle}>{t.label}</span>
              <span className={styles.cardMeta}>{t.description}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

const statusOf = (e: { status: string; hasChanges: boolean }) =>
  e.status === "DRAFT" ? { text: "Qaralama", cls: "" } : e.hasChanges ? { text: "Dərc olunub, yeni dəyişiklik var", cls: styles.badgeGold } : { text: "Dərc olunub", cls: styles.badgeOk };

export function ContentList({ code, type }: { code: string; type: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const types = useApi<ContentType[]>(`${base(code)}/types`);
  const list = useApi<ContentSummary[]>(`${base(code)}/${type}`);
  const def = types.data?.find((t) => t.code === type);

  async function remove(e: ContentSummary) {
    if (!confirm(`"${e.title}" silinsin?`)) return;
    try {
      await api(`${base(code)}/${type}/${e.id}`, { method: "DELETE" });
      list.reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinmədi.");
    }
  }

  async function move(i: number, d: -1 | 1) {
    const rows = list.data ?? [];
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    try {
      await api(`${base(code)}/${type}/reorder`, { method: "PUT", body: { ids } });
    } finally {
      list.reload();
    }
  }

  if (!site) return <p className={styles.error}>Sayt tapılmadı.</p>;
  if (types.error || list.error) return <p className={styles.error}>{types.error ?? list.error}</p>;
  if (!def || !list.data) return <p className={styles.loading}>Yüklənir…</p>;

  const canCreate = can(def.module, "CREATE", code) && (!def.singleton || list.data.length === 0);
  const canEdit = can(def.module, "UPDATE", code);
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{def.label}</h1>
          <p className={styles.sub}>{site.name}</p>
        </div>
        <div className={styles.row}>
          <Link href={`/sites/${code}/content`} className={`${styles.btn} ${styles.btnGhost}`}>
            Geri
          </Link>
          {canCreate && (
            <Link href={`/sites/${code}/content/${type}/new`} className={`${styles.btn} ${styles.btnGold}`}>
              + Yeni
            </Link>
          )}
        </div>
      </div>
      <div className={`${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Status</th>
              <th>Tərcümə</th>
              <th>Son dəyişiklik</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.data.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  Hələ heç nə yoxdur.
                </td>
              </tr>
            )}
            {list.data.map((e, i) => {
              const st = statusOf(e);
              return (
                <tr key={e.id}>
                  <td>
                    {e.title}
                    <div className={styles.hint}>{e.slug}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${st.cls}`}>{st.text}</span>
                  </td>
                  <td>
                    {(["en", "ru"] as const).map((l) => {
                      const gaps = e.draftGaps?.[l] ?? 0;
                      const live = e.publishedGaps ? e.publishedGaps[l] === 0 : false;
                      return (
                        <span
                          key={l}
                          className={`${styles.badge} ${live ? styles.badgeOk : gaps === 0 ? styles.badgeGold : styles.badgeBad}`}
                          title={live ? "Bu dildə saytda açıqdır" : gaps === 0 ? "Tərcümə tamdır, amma dərc olunmayıb" : `${gaps} sahənin tərcüməsi çatışmır, bu dildə sayt açılmır`}
                        >
                          {l.toUpperCase()} {live ? "✓" : gaps === 0 ? "hazır" : gaps}
                        </span>
                      );
                    })}
                  </td>
                  <td className={styles.muted}>
                    {fmtDate(e.updatedAt)}
                    {e.updatedBy && <div className={styles.hint}>{e.updatedBy}</div>}
                  </td>
                  <td>
                    <div className={styles.row} style={{ flexWrap: "nowrap" }}>
                      {canEdit && !def.singleton && (
                        <>
                          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yuxarı">
                            ↑
                          </button>
                          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, 1)} disabled={i === list.data!.length - 1} aria-label="Aşağı">
                            ↓
                          </button>
                        </>
                      )}
                      <Link href={`/sites/${code}/content/${type}/${e.id}`} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
                        {canEdit ? "Redaktə" : "Bax"}
                      </Link>
                      {can(def.module, "DELETE", code) && (
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => remove(e)}>
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
  if (types.error || entry.error) return <p className={styles.error}>{types.error ?? entry.error}</p>;
  if (!def || (!isNew && !entry.data)) return <p className={styles.loading}>Yüklənir…</p>;

  return <EditorBody key={entry.data?.updatedAt ?? "new"} code={code} def={def} entry={entry.data ?? null} onReload={entry.reload} siteName={site.name} can={can} />;
}

function EditorBody({ code, def, entry, onReload, siteName, can }: { code: string; def: ContentType; entry: ContentEntry | null; onReload: () => void; siteName: string; can: (m: string, a: "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "PUBLISH", s?: string) => boolean }) {
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

  const st = entry ? statusOf(entry) : { text: "Yeni", cls: "" };
  const setSeo = (patch: Partial<Seo>) => setDraft((d) => ({ ...d, seo: { ...d.seo, ...patch } }));
  const seoText = (k: "title" | "description") => draft.seo[k]?.[lang] ?? "";
  const setSeoText = (k: "title" | "description", v: string) => setSeo({ [k]: { ...(draft.seo[k] ?? {}), [lang]: v } });

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{entry ? "Redaktə" : "Yeni"}: {def.label}</h1>
          <p className={styles.sub}>
            {siteName} <span className={`${styles.badge} ${st.cls}`}>{st.text}</span>
            {entry?.publishedAt && <span className={styles.hint}> son dərc: {fmtDate(entry.publishedAt)}{entry.publishedBy ? `, ${entry.publishedBy}` : ""}</span>}
          </p>
        </div>
        <div className={styles.row}>
          <Link href={`/sites/${code}/content/${def.code}`} className={`${styles.btn} ${styles.btnGhost}`}>
            Siyahı
          </Link>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} disabled={busy} onClick={preview} title="Qaralamanı saytda yalnız siz görürsünüz">
            Önizlə
          </button>
          {entry && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowRevisions(true)}>
              Versiyalar
            </button>
          )}
        </div>
      </div>

      <form
        className={styles.form}
        style={{ maxWidth: 760 }}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <LangTabs lang={lang} onChange={setLang} gaps={{ en: gapsFor(draft.data, "en"), ru: gapsFor(draft.data, "ru") }} />
        <SchemaForm fields={def.fields} value={draft.data} lang={lang} site={code} onChange={(data) => setDraft((d) => ({ ...d, data }))} />

        {!def.singleton && (
          <div className={styles.field}>
            <label htmlFor="slug">Ünvan (URL)</label>
            <input id="slug" className={styles.input} value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} disabled={entry?.status === "PUBLISHED"} placeholder="Boş qalsa başlıqdan yaranır" />
            <span className={styles.hint}>{entry?.status === "PUBLISHED" ? "Dərc olunmuş məzmunun ünvanı dəyişdirilmir." : "Yalnız kiçik hərf, rəqəm və tire."}</span>
          </div>
        )}

        <details className={styles.panel} style={{ padding: 18 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Axtarış sistemi (SEO)</summary>
          <div className={styles.form} style={{ marginTop: 14 }}>
            <span className={styles.hint}>Boş buraxsanız saytın özü məzmundan başlıq və təsvir yaradır. Dil: {lang.toUpperCase()}.</span>
            <div className={styles.field}>
              <label htmlFor="seo-title">Başlıq (Google-da göstərilən, ən çox 70 simvol)</label>
              <input id="seo-title" className={styles.input} maxLength={70} value={seoText("title")} onChange={(e) => setSeoText("title", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="seo-desc">Təsvir (ən çox 200 simvol)</label>
              <textarea id="seo-desc" className={styles.input} rows={3} maxLength={200} value={seoText("description")} onChange={(e) => setSeoText("description", e.target.value)} />
            </div>
            <ImageField label="Paylaşım şəkli (sosial şəbəkələrdə görünən)" folder="misc" site={code} crop="free" value={draft.seo.ogImage ?? ""} onChange={(v) => setSeo({ ogImage: v || undefined })} />
            <div className={styles.field}>
              <label htmlFor="seo-canonical">Canonical ünvan (könüllü)</label>
              <input id="seo-canonical" className={styles.input} value={draft.seo.canonical ?? ""} onChange={(e) => setSeo({ canonical: e.target.value || undefined })} placeholder="https://..." />
            </div>
            <label className={styles.check}>
              <input type="checkbox" checked={!!draft.seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked || undefined })} />
              <span>Axtarış sistemlərində göstərilməsin (noindex)</span>
            </label>
          </div>
        </details>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className={styles.ok} role="status">
            {notice}
          </p>
        )}
        {dirty && <p className={styles.hint}>Saxlanmamış dəyişiklik var.</p>}
        <div className={styles.row}>
          {canUpdate && (
            <button className={`${styles.btn} ${styles.btnGhost}`} disabled={busy || (!dirty && !!entry)}>
              {busy ? "Saxlanılır…" : "Qaralamanı saxla"}
            </button>
          )}
          {canPublish && (
            <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy || (!!entry && !dirty && !entry.hasChanges && entry.status === "PUBLISHED")} onClick={publish}>
              Dərc et
            </button>
          )}
          {canPublish && entry?.status === "PUBLISHED" && (
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy} onClick={unpublish}>
              Dərcdən çıxar
            </button>
          )}
        </div>
      </form>

      {showRevisions && entry && <RevisionsDialog path={`${path}/${entry.id}`} canRestore={canUpdate} onClose={() => setShowRevisions(false)} onRestored={() => { setShowRevisions(false); onReload(); }} />}
    </>
  );
}

function RevisionsDialog({ path, canRestore, onClose, onRestored }: { path: string; canRestore: boolean; onClose: () => void; onRestored: () => void }) {
  const revs = useApi<Revision[]>(`${path}/revisions`);
  async function restore(r: Revision) {
    if (!confirm(`Versiya ${r.version} qaralamaya yüklənsin? Saytda dəyişiklik olmayacaq, dərc etməlisiniz.`)) return;
    try {
      await api(`${path}/revisions/${r.id}/restore`, { method: "POST" });
      onRestored();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Bərpa olunmadı.");
    }
  }
  return (
    <Modal title="Dərc olunmuş versiyalar" onClose={onClose}>
      {revs.error ? (
        <p className={styles.error}>{revs.error}</p>
      ) : !revs.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : revs.data.length === 0 ? (
        <p className={styles.muted}>Hələ dərc olunmayıb.</p>
      ) : (
        <div className={`${styles.panel} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Versiya</th>
                <th>Vaxt</th>
                <th>Kim</th>
                <th>Qeyd</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {revs.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.version}</td>
                  <td className={styles.muted}>{fmtDate(r.createdAt)}</td>
                  <td>{r.createdBy ?? "—"}</td>
                  <td>{r.note ?? ""}</td>
                  <td>
                    {canRestore && (
                      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => restore(r)}>
                        Qaralamaya yüklə
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
