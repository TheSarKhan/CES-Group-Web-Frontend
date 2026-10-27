"use client";

import { useState } from "react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import { EXTRA_LABELS, STATUS_LABELS, TYPE_LABELS, type LeadStatus, type Page, type Submission, type SubmissionDetail } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";
import { SiteTabs } from "./SiteTabs";

const SIZE = 25;
const badgeFor = (s: LeadStatus) => (s === "NEW" ? styles.badgeGold : s === "DONE" ? styles.badgeOk : s === "SPAM" ? styles.badgeBad : "");

export function SubmissionsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  const allowed = can("SUBMISSIONS", "VIEW", code);
  const qs = new URLSearchParams({ page: String(page), size: String(SIZE) });
  if (status) qs.set("status", status);
  if (type) qs.set("type", type);
  if (q.trim()) qs.set("q", q.trim());
  const rows = useApi<Page<Submission>>(allowed ? `panel/sites/${code}/submissions?${qs}` : null);

  if (!site || !allowed) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;

  const filter = (fn: () => void) => {
    fn();
    setPage(0);
  };
  const pages = rows.data ? Math.max(1, Math.ceil(rows.data.total / SIZE)) : 1;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>Saytdan gələn müraciətlər.</p>
        </div>
        <a className={`${styles.btn} ${styles.btnGhost}`} href={`/api/admin/panel/sites/${code}/submissions/export`}>
          CSV yüklə
        </a>
      </div>
      <SiteTabs code={code} current="submissions" />
      <div className={styles.filters}>
        <input className={styles.input} placeholder="Axtar (ad, telefon, e-poçt, mesaj)" value={q} onChange={(e) => filter(() => setQ(e.target.value))} aria-label="Axtar" />
        <select className={styles.input} value={status} onChange={(e) => filter(() => setStatus(e.target.value))} aria-label="Status">
          <option value="">Bütün statuslar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className={styles.input} value={type} onChange={(e) => filter(() => setType(e.target.value))} aria-label="Növ">
          <option value="">Bütün növlər</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      {rows.error ? (
        <p className={styles.error}>{rows.error}</p>
      ) : !rows.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <div className={styles.panel}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tarix</th>
                  <th>Ad</th>
                  <th>Telefon</th>
                  <th>Növ</th>
                  <th>Status</th>
                  <th>Məsul</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.muted}>
                      Müraciət tapılmadı.
                    </td>
                  </tr>
                )}
                {rows.data.items.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</td>
                    <td>
                      {r.name}
                      {r.company && r.company !== code && <span className={styles.hint}> ({r.company})</span>}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{r.phone}</td>
                    <td>{TYPE_LABELS[r.type]}</td>
                    <td>
                      <span className={`${styles.badge} ${badgeFor(r.status)}`}>{STATUS_LABELS[r.status]}</span>
                    </td>
                    <td className={styles.muted}>{r.assignee?.name ?? "—"}</td>
                    <td>
                      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setOpenId(r.id)}>
                        Aç
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.pager}>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={page === 0} onClick={() => setPage(page - 1)}>
              Əvvəlki
            </button>
            <span className={styles.muted}>
              {page + 1} / {pages} ({rows.data.total} müraciət)
            </span>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>
              Növbəti
            </button>
          </div>
        </div>
      )}
      {openId !== null && (
        <DetailDialog
          code={code}
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => {
            rows.reload();
          }}
        />
      )}
    </>
  );
}

function DetailDialog({ code, id, onClose, onChanged }: { code: string; id: number; onClose: () => void; onChanged: () => void }) {
  const { can } = useAdmin();
  const detail = useApi<SubmissionDetail>(`panel/sites/${code}/submissions/${id}`);
  const assignees = useApi<{ id: number; name: string }[]>(`panel/sites/${code}/assignees`);
  const canEdit = can("SUBMISSIONS", "UPDATE", code);

  return (
    <Modal title="Müraciət" onClose={onClose}>
      {detail.error ? (
        <p className={styles.error}>{detail.error}</p>
      ) : !detail.data || !assignees.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <DetailBody
          key={detail.data.submission.updatedAt + detail.data.notes.length}
          code={code}
          detail={detail.data}
          assignees={assignees.data}
          canEdit={canEdit}
          canDelete={can("SUBMISSIONS", "DELETE", code)}
          onSaved={() => {
            detail.reload();
            onChanged();
          }}
          onDeleted={() => {
            onChanged();
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function DetailBody({ code, detail, assignees, canEdit, canDelete, onSaved, onDeleted }: { code: string; detail: SubmissionDetail; assignees: { id: number; name: string }[]; canEdit: boolean; canDelete: boolean; onSaved: () => void; onDeleted: () => void }) {
  const s = detail.submission;
  const [status, setStatus] = useState<LeadStatus>(s.status);
  const [assigneeId, setAssigneeId] = useState(s.assignee ? String(s.assignee.id) : "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const extra = parseExtra(s.payload);

  async function run(fn: () => Promise<unknown>, after: () => void) {
    setBusy(true);
    setError("");
    try {
      await fn();
      after();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "8px 18px", margin: 0 }}>
        <dt className={styles.muted}>Tarix</dt>
        <dd style={{ margin: 0 }}>{fmtDate(s.createdAt)}</dd>
        <dt className={styles.muted}>Növ</dt>
        <dd style={{ margin: 0 }}>{TYPE_LABELS[s.type]}</dd>
        <dt className={styles.muted}>Ad</dt>
        <dd style={{ margin: 0 }}>{s.name}</dd>
        <dt className={styles.muted}>Telefon</dt>
        <dd style={{ margin: 0 }}>
          <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a>
        </dd>
        {s.email && (
          <>
            <dt className={styles.muted}>E-poçt</dt>
            <dd style={{ margin: 0 }}>
              <a href={`mailto:${s.email}`}>{s.email}</a>
            </dd>
          </>
        )}
        {s.company && (
          <>
            <dt className={styles.muted}>Şirkət</dt>
            <dd style={{ margin: 0 }}>{s.company}</dd>
          </>
        )}
        {Object.entries(extra).map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt className={styles.muted}>{EXTRA_LABELS[k] ?? k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
        {s.origin && s.origin !== code && (
          <>
            <dt className={styles.muted}>Göndərildiyi sayt</dt>
            <dd style={{ margin: 0 }}>{s.origin}</dd>
          </>
        )}
      </dl>
      {s.message && <p style={{ whiteSpace: "pre-wrap", background: "var(--paper)", padding: 14, borderRadius: "var(--radius)", margin: 0 }}>{s.message}</p>}

      {canEdit && (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => api(`panel/sites/${code}/submissions/${s.id}`, { method: "PUT", body: { status, assigneeId: assigneeId ? Number(assigneeId) : null } }), onSaved);
          }}
        >
          <div className={styles.row}>
            <div className={styles.field} style={{ flex: 1, minWidth: 160 }}>
              <label htmlFor="d-status">Status</label>
              <select id="d-status" className={styles.input} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field} style={{ flex: 1, minWidth: 160 }}>
              <label htmlFor="d-assignee">Məsul şəxs</label>
              <select id="d-assignee" className={styles.input} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Təyin edilməyib</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
              Yadda saxla
            </button>
          </div>
        </form>
      )}

      <div className={styles.form} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        <span className={styles.label}>Qeydlər</span>
        {detail.notes.length === 0 && <span className={styles.hint}>Hələ qeyd yoxdur.</span>}
        {detail.notes.map((n) => (
          <div key={n.id}>
            <span className={styles.hint}>
              {n.authorEmail ?? "—"}, {fmtDate(n.createdAt)}
            </span>
            <p style={{ margin: "2px 0 0", whiteSpace: "pre-wrap" }}>{n.body}</p>
          </div>
        ))}
        {canEdit && (
          <form
            className={styles.row}
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              void run(() => api(`panel/sites/${code}/submissions/${s.id}/notes`, { method: "POST", body: { body: note } }), () => {
                setNote("");
                onSaved();
              });
            }}
          >
            <input className={styles.input} style={{ flex: 1, minWidth: 200 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd yazın" maxLength={2000} aria-label="Yeni qeyd" />
            <button className={`${styles.btn} ${styles.btnGhost}`} disabled={busy || !note.trim()}>
              Əlavə et
            </button>
          </form>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {canDelete && (
        <div className={styles.modalFoot}>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            disabled={busy}
            onClick={() => {
              if (confirm("Bu müraciət silinsin?")) void run(() => api(`panel/sites/${code}/submissions/${s.id}`, { method: "DELETE" }), onDeleted);
            }}
          >
            Sil
          </button>
        </div>
      )}
    </>
  );
}

function parseExtra(payload: string | null): Record<string, string> {
  if (!payload) return {};
  try {
    const v = JSON.parse(payload) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === "string" && x).map(([k, x]) => [k, String(x)]));
  } catch {
    return {};
  }
}
