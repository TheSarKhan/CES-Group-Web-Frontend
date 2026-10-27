"use client";

import { useState } from "react";
import { ChevronRight, Download, Mail, Phone, Trash2, X } from "lucide-react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import { EXTRA_LABELS, STATUS_LABELS, TYPE_LABELS, type LeadStatus, type Page, type Submission, type SubmissionDetail } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Avatar, Notice, PageHeader, Pagination, Pill, RowMenu, SearchBox, useCrumbs, type Tone } from "./ui";

const SIZE = 25;
const tone = (s: LeadStatus): Tone => (s === "NEW" ? "gold" : s === "IN_PROGRESS" ? "info" : s === "DONE" ? "ok" : "muted");

export function SubmissionsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  useCrumbs([{ label: site?.name ?? code }, { label: "Müraciətlər" }]);

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
  const from = rows.data && rows.data.total > 0 ? page * SIZE + 1 : 0;
  const to = rows.data ? page * SIZE + rows.data.items.length : 0;

  return (
    <>
      <PageHeader
        title="Müraciətlər"
        sub="Saytdan gələn sorğuları izləyin və idarə edin."
        actions={
          <a className={`${styles.btn} ${styles.btnGhost}`} href={`/api/admin/panel/sites/${code}/submissions/export`}>
            <Download size={18} /> CSV yüklə
          </a>
        }
      />
      <div className={openId !== null ? styles.split : undefined}>
        <section className={styles.panel}>
          <div className={styles.toolbar}>
            <SearchBox value={q} onChange={(v) => filter(() => setQ(v))} placeholder="Ad, telefon və ya mesaj axtar…" />
            <select className={styles.select} value={status} onChange={(e) => filter(() => setStatus(e.target.value))} aria-label="Status">
              <option value="">Bütün statuslar</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select className={styles.select} value={type} onChange={(e) => filter(() => setType(e.target.value))} aria-label="Növ">
              <option value="">Bütün növlər</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {rows.error ? (
            <div style={{ padding: 20 }}>
              <Notice tone="bad">{rows.error}</Notice>
            </div>
          ) : !rows.data ? (
            <p className={styles.loading} style={{ padding: "0 20px" }}>
              Yüklənir…
            </p>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Müraciət</th>
                      <th>Növ</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.data.items.length === 0 && (
                      <tr>
                        <td colSpan={4} className={styles.muted}>
                          Müraciət tapılmadı.
                        </td>
                      </tr>
                    )}
                    {rows.data.items.map((r) => (
                      <tr key={r.id} className={r.id === openId ? styles.rowSel : r.status === "NEW" ? styles.rowHi : undefined} onClick={() => setOpenId(r.id)} style={{ cursor: "pointer" }}>
                        <td>
                          <span className={styles.cellMain}>{r.name}</span>
                          <span className={styles.cellSub}>
                            {fmtDate(r.createdAt)}
                            {r.company && r.company !== code && ` · ${r.company}`}
                          </span>
                        </td>
                        <td>{TYPE_LABELS[r.type]}</td>
                        <td>
                          <Pill tone={tone(r.status)}>{STATUS_LABELS[r.status]}</Pill>
                        </td>
                        <td style={{ textAlign: "right" }} className={styles.muted}>
                          <ChevronRight size={20} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableFoot}>
                <span>
                  {from}–{to} / {rows.data.total} müraciət
                </span>
                <Pagination page={page} pages={pages} onChange={setPage} />
              </div>
            </>
          )}
        </section>

        {openId !== null && (
          <DetailPanel
            key={openId}
            code={code}
            id={openId}
            onClose={() => setOpenId(null)}
            onChanged={() => rows.reload()}
          />
        )}
      </div>
    </>
  );
}

function DetailPanel({ code, id, onClose, onChanged }: { code: string; id: number; onClose: () => void; onChanged: () => void }) {
  const { can } = useAdmin();
  const detail = useApi<SubmissionDetail>(`panel/sites/${code}/submissions/${id}`);
  const assignees = useApi<{ id: number; name: string }[]>(`panel/sites/${code}/assignees`);
  const canEdit = can("SUBMISSIONS", "UPDATE", code);

  return (
    <aside className={`${styles.panel} ${styles.panelPad} ${styles.sticky}`} aria-label="Müraciət detalları">
      {detail.error ? (
        <Notice tone="bad">{detail.error}</Notice>
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
          onClose={onClose}
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
    </aside>
  );
}

function DetailBody({ code, detail, assignees, canEdit, canDelete, onClose, onSaved, onDeleted }: { code: string; detail: SubmissionDetail; assignees: { id: number; name: string }[]; canEdit: boolean; canDelete: boolean; onClose: () => void; onSaved: () => void; onDeleted: () => void }) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div className={styles.eyebrow}>Müraciət #{String(s.id).padStart(4, "0")}</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", margin: "2px 0 6px" }}>{s.name}</h2>
          <div className={styles.row}>
            <span className={styles.muted}>{TYPE_LABELS[s.type]}</span>
            <Pill tone={tone(s.status)}>{STATUS_LABELS[s.status]}</Pill>
          </div>
          <div className={styles.muted} style={{ marginTop: 6 }}>
            {fmtDate(s.createdAt)}
          </div>
        </div>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Bağla">
          <X size={22} />
        </button>
      </div>

      <h3 className={styles.sectionTitle}>Əlaqə məlumatları</h3>
      <dl className={styles.kv}>
        <dt>
          <Phone size={15} style={{ verticalAlign: -2 }} /> Telefon
        </dt>
        <dd>
          <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a>
        </dd>
        {s.email && (
          <>
            <dt>
              <Mail size={15} style={{ verticalAlign: -2 }} /> E-poçt
            </dt>
            <dd>
              <a href={`mailto:${s.email}`}>{s.email}</a>
            </dd>
          </>
        )}
        {s.company && (
          <>
            <dt>Şirkət</dt>
            <dd>{s.company}</dd>
          </>
        )}
        {s.origin && s.origin !== code && (
          <>
            <dt>Göndərildiyi sayt</dt>
            <dd>{s.origin}</dd>
          </>
        )}
      </dl>

      {Object.keys(extra).length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Sorğu detalları</h3>
          <dl className={styles.kv}>
            {Object.entries(extra).map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{EXTRA_LABELS[k] ?? k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {s.message && (
        <>
          <h3 className={styles.sectionTitle}>Mesaj</h3>
          <p className={styles.msgBox}>{s.message}</p>
        </>
      )}

      {canEdit && (
        <form
          className={styles.form}
          style={{ marginTop: 18 }}
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => api(`panel/sites/${code}/submissions/${s.id}`, { method: "PUT", body: { status, assigneeId: assigneeId ? Number(assigneeId) : null } }), onSaved);
          }}
        >
          <div className={styles.fieldGrid2}>
            <div className={styles.field}>
              <label htmlFor="d-status">Status</label>
              <select id="d-status" className={styles.select} style={{ width: "100%" }} value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="d-assignee">Məsul şəxs</label>
              <select id="d-assignee" className={styles.select} style={{ width: "100%" }} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Təyin edilməyib</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className={`${styles.btn} ${styles.btnGold} ${styles.btnBlock}`} disabled={busy}>
            Yadda saxla
          </button>
        </form>
      )}

      <h3 className={styles.sectionTitle}>Daxili qeydlər</h3>
      <p className={styles.hint}>Bu qeydlər müştəriyə göndərilmir.</p>
      <div className={styles.form} style={{ marginTop: 10 }}>
        {detail.notes.map((n) => (
          <div key={n.id} className={styles.noteItem}>
            <Avatar name={n.authorEmail ?? "?"} className={styles.avatarSm} />
            <div>
              <strong>{n.authorEmail ?? "—"}</strong> <span className={styles.muted}>{fmtDate(n.createdAt)}</span>
              <p style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
            </div>
          </div>
        ))}
        {canEdit && (
          <form
            className={styles.row}
            style={{ flexWrap: "nowrap" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              void run(() => api(`panel/sites/${code}/submissions/${s.id}/notes`, { method: "POST", body: { body: note } }), () => {
                setNote("");
                onSaved();
              });
            }}
          >
            <input className={styles.input} style={{ flex: 1, minWidth: 0 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd yazın…" maxLength={2000} aria-label="Yeni qeyd" />
            <button className={`${styles.btn} ${styles.btnOutlineGold}`} disabled={busy || !note.trim()}>
              Əlavə et
            </button>
            <RowMenu
              items={[
                {
                  label: "Müraciəti sil",
                  icon: <Trash2 size={16} />,
                  danger: true,
                  hidden: !canDelete,
                  onClick: () => {
                    if (confirm("Bu müraciət silinsin?")) void run(() => api(`panel/sites/${code}/submissions/${s.id}`, { method: "DELETE" }), onDeleted);
                  },
                },
              ]}
            />
          </form>
        )}
      </div>
      {error && (
        <p className={styles.error} role="alert" style={{ marginTop: 10 }}>
          {error}
        </p>
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
