"use client";

import { useState } from "react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import { ACTION_LABELS, MODULE_LABELS, type Action, type Meta, type RoleView } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";

const ALL = "*";
const key = (module: string, action: string, site: string) => `${module}:${action}:${site}`;

export function RolesPage() {
  const { can } = useAdmin();
  const roles = useApi<RoleView[]>("iam/roles");
  const meta = useApi<Meta>("iam/meta");
  const [editing, setEditing] = useState<RoleView | "new" | null>(null);

  if (roles.error || meta.error) return <p className={styles.error}>{roles.error ?? meta.error}</p>;
  if (!roles.data || !meta.data) return <p className={styles.loading}>Yüklənir…</p>;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Rollar</h1>
          <p className={styles.sub}>Rol hansı saytda hansı modulda nə edə biləcəyini müəyyən edir. İstifadəçiyə bir neçə rol vermək olar.</p>
        </div>
        {can("ROLES", "CREATE") && (
          <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => setEditing("new")}>
            Yeni rol
          </button>
        )}
      </div>
      <div className={`${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rol</th>
              <th>Təsvir</th>
              <th>İcazə sayı</th>
              <th>İstifadəçi</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {roles.data.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name} {r.system && <span className={`${styles.badge} ${styles.badgeGold}`}>Sistem</span>}
                </td>
                <td className={styles.muted}>{r.description ?? "—"}</td>
                <td>{r.superRole ? "Hamısı" : r.permissions.length}</td>
                <td>{r.userCount}</td>
                <td>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setEditing(r)}>
                    {r.system || !can("ROLES", "UPDATE") ? "Bax" : "Redaktə"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <RoleDialog
          role={editing === "new" ? null : editing}
          meta={meta.data}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            roles.reload();
          }}
        />
      )}
    </>
  );
}

function RoleDialog({ role, meta, onClose, onSaved }: { role: RoleView | null; meta: Meta; onClose: () => void; onSaved: () => void }) {
  const { can } = useAdmin();
  const readOnly = !!role && (role.system || !can("ROLES", "UPDATE"));
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [granted, setGranted] = useState<Set<string>>(new Set(role?.permissions.map((p) => key(p.module, p.action, p.siteCode ?? ALL))));
  const [scope, setScope] = useState(ALL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const modules = meta.modules.filter((m) => scope === ALL || !m.global);
  const toggle = (k: string) =>
    setGranted((prev) => {
      const next = new Set(prev);
      if (!next.delete(k)) next.add(k);
      return next;
    });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const permissions = [...granted].map((k) => {
      const [module, action, site] = k.split(":");
      return { module, action, siteCode: site === ALL ? null : site };
    });
    try {
      await api(role ? `iam/roles/${role.id}` : "iam/roles", { method: role ? "PUT" : "POST", body: { name, description, permissions } });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!role || !confirm(`"${role.name}" rolu silinsin?`)) return;
    setBusy(true);
    try {
      await api(`iam/roles/${role.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  const scopeCount = (s: string) => [...granted].filter((k) => k.endsWith(`:${s}`)).length;

  return (
    <Modal title={role ? (readOnly ? role.name : "Rolu redaktə et") : "Yeni rol"} onClose={onClose}>
      <form className={styles.form} onSubmit={save}>
        {role?.superRole ? (
          <p className={styles.sub}>Super Admin rolu bütün saytlarda və modullarda tam səlahiyyətə malikdir və dəyişdirilə bilməz.</p>
        ) : (
          <>
            <div className={styles.field}>
              <label htmlFor="r-name">Ad</label>
              <input id="r-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={64} disabled={readOnly} />
            </div>
            <div className={styles.field}>
              <label htmlFor="r-desc">Təsvir</label>
              <input id="r-desc" className={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={255} disabled={readOnly} />
            </div>
            <div className={styles.field}>
              <span className={styles.label}>İcazələr</span>
              <div className={styles.tabs} role="tablist">
                {[{ code: ALL, name: "Bütün saytlar" }, ...meta.sites].map((s) => (
                  <button key={s.code} type="button" role="tab" aria-selected={scope === s.code} className={styles.tab} onClick={() => setScope(s.code)}>
                    {s.name}
                    {scopeCount(s.code) > 0 && <span className={styles.badge} style={{ marginLeft: 6 }}>{scopeCount(s.code)}</span>}
                  </button>
                ))}
              </div>
              <span className={styles.hint}>
                {scope === ALL
                  ? "Burada verilən icazə bütün saytlara şamil olur. İstifadəçilər, Rollar və Audit log modulları saytdan asılı deyil, yalnız burada verilir."
                  : "Burada verilən icazə yalnız bu sayta şamil olur."}
              </span>
              <div className={styles.tableWrap}>
                <table className={styles.matrix}>
                  <thead>
                    <tr>
                      <th>Modul</th>
                      {meta.actions.map((a) => (
                        <th key={a}>{ACTION_LABELS[a as Action]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m) => (
                      <tr key={m.code}>
                        <td>{MODULE_LABELS[m.code] ?? m.code}</td>
                        {meta.actions.map((a) => {
                          const k = key(m.code, a, scope);
                          return (
                            <td key={a}>
                              <input type="checkbox" checked={granted.has(k)} onChange={() => toggle(k)} disabled={readOnly} aria-label={`${MODULE_LABELS[m.code] ?? m.code}: ${ACTION_LABELS[a as Action]}`} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.modalFoot}>
          {role && !role.system && can("ROLES", "DELETE") && (
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={remove} disabled={busy} style={{ marginRight: "auto" }}>
              Sil
            </button>
          )}
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            {readOnly ? "Bağla" : "Ləğv et"}
          </button>
          {!readOnly && (
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
              Yadda saxla
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
