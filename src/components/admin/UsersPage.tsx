"use client";

import { useState } from "react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import type { RoleView, UserView } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";

export function UsersPage() {
  const { can } = useAdmin();
  const users = useApi<UserView[]>("iam/users");
  const roles = useApi<RoleView[]>("iam/roles");
  const [editing, setEditing] = useState<UserView | "new" | null>(null);

  if (users.error) return <p className={styles.error}>{users.error}</p>;
  if (!users.data || !roles.data) return <p className={styles.loading}>Yüklənir…</p>;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>İstifadəçilər</h1>
          <p className={styles.sub}>Panelə giriş edə bilən hesablar və onların rolları.</p>
        </div>
        {can("USERS", "CREATE") && (
          <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => setEditing("new")}>
            Yeni istifadəçi
          </button>
        )}
      </div>
      <div className={`${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ad</th>
              <th>E-poçt</th>
              <th>Rollar</th>
              <th>Status</th>
              <th>Son giriş</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.data.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.roles.map((r) => (
                    <span key={r.id} className={styles.badge}>
                      {r.name}
                    </span>
                  ))}
                </td>
                <td>
                  <span className={`${styles.badge} ${u.active ? styles.badgeOk : styles.badgeBad}`}>{u.active ? "Aktiv" : "Deaktiv"}</span>
                  {u.locked && <span className={`${styles.badge} ${styles.badgeBad}`}>Kilidli</span>}
                  {u.totpEnabled && <span className={`${styles.badge} ${styles.badgeGold}`}>2FA</span>}
                </td>
                <td className={styles.muted}>{fmtDate(u.lastLoginAt)}</td>
                <td>
                  {can("USERS", "UPDATE") && (
                    <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setEditing(u)}>
                      Redaktə
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <UserDialog
          user={editing === "new" ? null : editing}
          roles={roles.data}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            users.reload();
          }}
          onChanged={users.reload}
        />
      )}
    </>
  );
}

function UserDialog({ user, roles, onClose, onSaved, onChanged }: { user: UserView | null; roles: RoleView[]; onClose: () => void; onSaved: () => void; onChanged: () => void }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(user?.active ?? true);
  const [roleIds, setRoleIds] = useState<Set<number>>(new Set(user?.roles.map((r) => r.id)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const toggle = (id: number) =>
    setRoleIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  async function run(fn: () => Promise<unknown>, done?: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      if (done) setNotice(done);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xəta baş verdi.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = user ? { name, active, roleIds: [...roleIds] } : { email, name, password, roleIds: [...roleIds] };
    const ok = await run(() => api(user ? `iam/users/${user.id}` : "iam/users", { method: user ? "PUT" : "POST", body }));
    if (ok) onSaved();
  }

  return (
    <Modal title={user ? "İstifadəçini redaktə et" : "Yeni istifadəçi"} onClose={onClose}>
      <form className={styles.form} onSubmit={save}>
        {!user && (
          <div className={styles.field}>
            <label htmlFor="u-email">E-poçt</label>
            <input id="u-email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        )}
        <div className={styles.field}>
          <label htmlFor="u-name">Ad, soyad</label>
          <input id="u-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={128} />
        </div>
        {!user && (
          <div className={styles.field}>
            <label htmlFor="u-pass">İlkin parol</label>
            <input id="u-pass" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" />
            <span className={styles.hint}>Ən azı 8 simvol. İstifadəçi girişdən sonra profildə dəyişə bilər.</span>
          </div>
        )}
        {user && (
          <label className={styles.check}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>Hesab aktivdir</span>
          </label>
        )}
        <div className={styles.field}>
          <span className={styles.label}>Rollar</span>
          <div className={styles.checks}>
            {roles.map((r) => (
              <label key={r.id} className={styles.check}>
                <input type="checkbox" checked={roleIds.has(r.id)} onChange={() => toggle(r.id)} />
                <span>
                  {r.name}
                  {r.description && <span className={styles.hint}> ({r.description})</span>}
                </span>
              </label>
            ))}
          </div>
        </div>
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
        <div className={styles.modalFoot}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            Ləğv et
          </button>
          <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
            Yadda saxla
          </button>
        </div>
      </form>

      {user && (
        <div className={styles.form} style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
          <span className={styles.label}>Təhlükəsizlik</span>
          <div className={styles.row}>
            <input type="password" className={styles.input} style={{ flex: 1, minWidth: 180 }} placeholder="Yeni parol (min. 8)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              disabled={busy || newPassword.length < 8}
              onClick={async () => {
                if (await run(() => api(`iam/users/${user.id}/reset-password`, { method: "POST", body: { newPassword } }), "Parol dəyişdirildi, istifadəçinin bütün sessiyaları bağlandı.")) setNewPassword("");
              }}
            >
              Parolu sıfırla
            </button>
          </div>
          <div className={styles.row}>
            {user.totpEnabled && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                disabled={busy}
                onClick={async () => {
                  if (confirm("Bu istifadəçinin 2FA-sı sıfırlansın?") && (await run(() => api(`iam/users/${user.id}/reset-2fa`, { method: "POST" }), "2FA sıfırlandı."))) onChanged();
                }}
              >
                2FA-nı sıfırla
              </button>
            )}
            {user.locked && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                disabled={busy}
                onClick={async () => {
                  if (await run(() => api(`iam/users/${user.id}/unlock`, { method: "POST" }), "Hesabın kilidi açıldı.")) onChanged();
                }}
              >
                Kilidi aç
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
