"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Info, Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";
import { Notice, PageHeader, Pagination, Pill, RowMenu, SearchBox, ViewToggle, useCrumbs, type Tone } from "./ui";

type Redirect = { id: number; fromPath: string; toUrl: string; code: number; note: string | null; createdBy: string | null; updatedAt: string };

const CODES = [301, 302, 307, 308];
const CODE_LABELS: Record<number, string> = {
  301: "301, daimi (tövsiyə olunur)",
  302: "302, müvəqqəti",
  307: "307, müvəqqəti (metod saxlanır)",
  308: "308, daimi (metod saxlanır)",
};
const codeTone = (c: number): Tone => (c === 301 ? "ok" : c === 302 ? "info" : c === 307 ? "violet" : "gold");
const PAGE = 15;

export function RedirectsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const list = useApi<Redirect[]>(`panel/sites/${code}/redirects`);
  const [tab, setTab] = useState<number | 0>(0);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Redirect | "new" | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  useCrumbs([{ label: site?.name ?? code }, { label: "Yönləndirmələr" }]);

  const canCreate = can("REDIRECTS", "CREATE", code);
  const canEdit = can("REDIRECTS", "UPDATE", code);
  const canDelete = can("REDIRECTS", "DELETE", code);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list.data ?? []).filter((r) => (!tab || r.code === tab) && (!needle || `${r.fromPath} ${r.toUrl} ${r.note ?? ""}`.toLowerCase().includes(needle)));
  }, [list.data, tab, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);

  if (!site || !can("REDIRECTS", "VIEW", code)) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;
  if (list.error) return <Notice tone="bad">{list.error}</Notice>;
  if (!list.data) return <p className={styles.loading}>Yüklənir…</p>;

  const remove = async (ids: number[]) => {
    if (!confirm(ids.length === 1 ? "Bu yönləndirmə silinsin?" : `${ids.length} yönləndirmə silinsin?`)) return;
    setError("");
    try {
      for (const id of ids) await api(`panel/sites/${code}/redirects/${id}`, { method: "DELETE" });
      setPicked(new Set());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Silinmədi.");
    }
    list.reload();
  };
  const allOnPage = shown.length > 0 && shown.every((r) => picked.has(r.id));

  return (
    <>
      <PageHeader
        title="Yönləndirmələr"
        sub="Köhnə ünvanları yeni səhifələrə yönləndirin. Ünvanı dəyişdikdə Google reytinqi itməsin deyə 301 istifadə edin."
        actions={
          canCreate && (
            <button type="button" className={`${styles.btn} ${styles.btnGold}`} onClick={() => setEditing("new")}>
              <Plus size={18} /> Yeni yönləndirmə
            </button>
          )
        }
      />
      <div className={styles.tabs} role="tablist">
        {[0, ...CODES].map((c) => (
          <button key={c} type="button" role="tab" aria-selected={tab === c} className={styles.tab} onClick={() => { setTab(c); setPage(0); }}>
            {c === 0 ? "Hamısı" : c}
          </button>
        ))}
      </div>
      {error && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="bad">{error}</Notice>
        </div>
      )}
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={(v) => { setQ(v); setPage(0); }} placeholder="Ünvan və ya qeyd üzrə axtar…" />
          <span className={styles.toolbarEnd}>
            Nəticələr: <strong style={{ color: "var(--ink)" }}>{rows.length}</strong>
            <ViewToggle value={view} onChange={setView} />
          </span>
        </div>
        {picked.size > 0 && canDelete && (
          <div className={styles.toolbar} style={{ paddingTop: 0 }}>
            <Pill tone="gold">{picked.size} seçildi</Pill>
            <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => remove([...picked])}>
              <Trash2 size={16} /> Sil
            </button>
          </div>
        )}
        {view === "grid" ? (
          <div className={styles.cards} style={{ padding: "0 20px 20px" }}>
            {shown.map((r) => (
              <div key={r.id} className={styles.card} style={{ gap: 10 }}>
                <span className={styles.codeChip}>{r.fromPath}</span>
                <ArrowRight size={16} className={styles.muted} />
                <span className={styles.codeChip}>{r.toUrl}</span>
                <div className={styles.row} style={{ justifyContent: "space-between" }}>
                  <Pill tone={codeTone(r.code)}>{r.code}</Pill>
                  {canEdit && (
                    <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm}`} onClick={() => setEditing(r)} aria-label="Redaktə">
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                {r.note && <span className={styles.cellSub}>{r.note}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input type="checkbox" checked={allOnPage} aria-label="Hamısını seç" style={{ accentColor: "var(--gold)" }} onChange={() => setPicked((p) => { const n = new Set(p); shown.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id))); return n; })} />
                  </th>
                  <th>Köhnə ünvan</th>
                  <th />
                  <th>Yeni ünvan</th>
                  <th>Kod</th>
                  <th>Qeyd</th>
                  <th>Son dəyişiklik</th>
                  <th style={{ textAlign: "right" }}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.muted}>
                      Heç nə tapılmadı.
                    </td>
                  </tr>
                )}
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input type="checkbox" checked={picked.has(r.id)} aria-label="Seç" style={{ accentColor: "var(--gold)" }} onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })} />
                    </td>
                    <td>
                      <span className={styles.codeChip}>{r.fromPath}</span>
                    </td>
                    <td className={styles.muted}>
                      <ArrowRight size={16} />
                    </td>
                    <td>
                      <span className={styles.codeChip}>{r.toUrl}</span>
                    </td>
                    <td>
                      <Pill tone={codeTone(r.code)}>{r.code}</Pill>
                    </td>
                    <td className={styles.muted} style={{ maxWidth: 300 }}>
                      {r.note}
                    </td>
                    <td>{fmtDate(r.updatedAt)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        {canEdit && (
                          <button type="button" className={styles.iconBtn} onClick={() => setEditing(r)} aria-label="Redaktə">
                            <Pencil size={18} />
                          </button>
                        )}
                        <RowMenu
                          items={[
                            { label: "Redaktə et", icon: <Pencil size={16} />, hidden: !canEdit, onClick: () => setEditing(r) },
                            { label: "Sil", icon: <Trash2 size={16} />, danger: true, hidden: !canDelete, onClick: () => remove([r.id]) },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.tableFoot}>
          <span>{rows.length} yönləndirmə</span>
          <Pagination page={page} pages={pages} onChange={setPage} />
          <span className={styles.footHint}>
            <Info size={16} /> 301 daimi, 302 müvəqqəti yönləndirmədir.
          </span>
        </div>
      </section>
      {editing && (
        <RedirectDialog
          code={code}
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
          }}
        />
      )}
    </>
  );
}

function RedirectDialog({ code, row, onClose, onSaved }: { code: string; row: Redirect | null; onClose: () => void; onSaved: () => void }) {
  const [fromPath, setFrom] = useState(row?.fromPath ?? "");
  const [toUrl, setTo] = useState(row?.toUrl ?? "");
  const [kind, setKind] = useState(String(row?.code ?? 301));
  const [note, setNote] = useState(row?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { fromPath: fromPath.trim(), toUrl: toUrl.trim(), code: Number(kind), note: note.trim() || null };
      await api(row ? `panel/sites/${code}/redirects/${row.id}` : `panel/sites/${code}/redirects`, { method: row ? "PUT" : "POST", body });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  return (
    <Modal title={row ? "Yönləndirməni redaktə et" : "Yeni yönləndirmə"} onClose={onClose} width={560}>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="r-from">
            Köhnə ünvan<span className={styles.req}>*</span>
          </label>
          <input id="r-from" className={styles.input} value={fromPath} maxLength={255} placeholder="/kohne-sehife" required onChange={(e) => setFrom(e.target.value)} />
          <span className={styles.hint}>/ ilə başlamalıdır, ? olmamalıdır.</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="r-to">
            Yeni ünvan<span className={styles.req}>*</span>
          </label>
          <input id="r-to" className={styles.input} value={toUrl} maxLength={512} placeholder="/yeni-sehife" required onChange={(e) => setTo(e.target.value)} />
          <span className={styles.hint}>Daxili yol və ya https tam ünvan.</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="r-kind">
            Növ<span className={styles.req}>*</span>
          </label>
          <select id="r-kind" className={styles.select} style={{ width: "100%" }} value={kind} onChange={(e) => setKind(e.target.value)}>
            {CODES.map((c) => (
              <option key={c} value={c}>
                {CODE_LABELS[c]}
              </option>
            ))}
          </select>
          <span className={styles.hint}>Alternativlər: 302 (müvəqqəti), 307 və 308.</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="r-note">Qeyd</label>
          <textarea id="r-note" className={styles.input} rows={3} maxLength={255} placeholder="Məsələn: köhnə bloq yazısının yeni ünvanı." value={note} onChange={(e) => setNote(e.target.value)} />
          <span className={styles.hint}>İstəyə bağlıdır.</span>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.modalFoot}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            Ləğv et
          </button>
          <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
            {busy ? "Saxlanılır…" : "Yadda saxla"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
