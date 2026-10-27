"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import type { RoleView, UserView } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Avatar, Notice, PageHeader, Pill, RowMenu, SearchBox, Toggle, useCrumbs } from "./ui";

export function UsersPage() {
  const { can } = useAdmin();
  const users = useApi<UserView[]>("iam/users");
  const [q, setQ] = useState("");
  useCrumbs([{ label: "Sistem" }, { label: "İstifadəçilər" }]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (users.data ?? []).filter((u) => !needle || `${u.name} ${u.email} ${u.roles.map((r) => r.name).join(" ")}`.toLowerCase().includes(needle));
  }, [users.data, q]);

  if (users.error) return <Notice tone="bad">{users.error}</Notice>;
  if (!users.data) return <p className={styles.loading}>Yüklənir…</p>;

  return (
    <>
      <PageHeader
        title="İstifadəçilər"
        sub="Sistemdəki istifadəçiləri idarə edin."
        actions={
          can("USERS", "CREATE") && (
            <Link href="/users/new" className={`${styles.btn} ${styles.btnGold}`}>
              <Plus size={18} /> Yeni istifadəçi
            </Link>
          )
        }
      />
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={setQ} placeholder="İstifadəçi axtar…" />
          <span className={styles.toolbarEnd}>
            Nəticələr: <strong style={{ color: "var(--ink)" }}>{rows.length}</strong>
          </span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ad</th>
                <th>E-poçt</th>
                <th>Rollar</th>
                <th>Status</th>
                <th>2FA</th>
                <th>Son giriş</th>
                <th style={{ textAlign: "right" }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.cellFlex}>
                      <Avatar name={u.name} large />
                      <Link href={`/users/${u.id}`} className={styles.cellMain}>
                        {u.name}
                      </Link>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <div className={styles.row} style={{ gap: 6 }}>
                      {u.roles.map((r) => (
                        <Pill key={r.id} tone={r.name === "Super Admin" ? "gold" : "muted"}>
                          {r.name}
                        </Pill>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Pill tone={u.active ? "ok" : "gold"}>{u.active ? "Aktiv" : "Deaktiv"}</Pill>
                  </td>
                  <td>{u.locked ? <Pill tone="gold">Kilidli</Pill> : u.totpEnabled ? <Pill tone="ok">2FA</Pill> : <Pill tone="muted">Yoxdur</Pill>}</td>
                  <td>{fmtDate(u.lastLoginAt)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      {can("USERS", "UPDATE") && (
                        <Link href={`/users/${u.id}`} className={styles.iconBtn} aria-label="Redaktə">
                          <Pencil size={18} />
                        </Link>
                      )}
                      <RowMenu items={[{ label: "Redaktə et", icon: <Pencil size={16} />, href: `/users/${u.id}`, hidden: !can("USERS", "UPDATE") }]} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFoot}>
          <span>{users.data.length} istifadəçi</span>
        </div>
      </section>
    </>
  );
}

/** İstifadəçi redaktəsi: ayrıca səhifə (ümumi məlumat, rollar, təhlükəsizlik) */
export function UserEditorPage({ id }: { id: string }) {
  const users = useApi<UserView[]>("iam/users");
  const roles = useApi<RoleView[]>("iam/roles");
  const isNew = id === "new";
  const user = isNew ? null : (users.data?.find((u) => String(u.id) === id) ?? null);
  useCrumbs([{ label: "Sistem" }, { label: "İstifadəçilər", href: "/users" }, { label: isNew ? "Yeni istifadəçi" : (user?.name ?? "") }]);

  if (users.error || roles.error) return <Notice tone="bad">{users.error ?? roles.error}</Notice>;
  if (!users.data || !roles.data) return <p className={styles.loading}>Yüklənir…</p>;
  if (!isNew && !user) return <Notice tone="bad">İstifadəçi tapılmadı.</Notice>;
  return <UserForm key={user?.id ?? "new"} user={user} roles={roles.data} onChanged={users.reload} />;
}

function UserForm({ user, roles, onChanged }: { user: UserView | null; roles: RoleView[]; onChanged: () => void }) {
  const router = useRouter();
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

  async function save() {
    if (!name.trim() || (!user && (!email.trim() || password.length < 8))) return setError(user ? "Ad boş ola bilməz." : "E-poçt, ad və ən azı 8 simvollu parol lazımdır.");
    const body = user ? { name, active, roleIds: [...roleIds] } : { email, name, password, roleIds: [...roleIds] };
    const ok = await run(() => api(user ? `iam/users/${user.id}` : "iam/users", { method: user ? "PUT" : "POST", body }), user ? "Yadda saxlanıldı." : undefined);
    if (ok) {
      if (user) onChanged();
      else router.push("/users");
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/users" }}
        title={user?.name || "Yeni istifadəçi"}
        sub="İstifadəçi məlumatlarını redaktə edin."
        actions={
          <>
            <Link href="/users" className={`${styles.btn} ${styles.btnGhost}`}>
              Ləğv et
            </Link>
            <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={() => void save()}>
              Yadda saxla
            </button>
          </>
        }
      />
      {(error || notice) && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone={error ? "bad" : "info"}>{error || notice}</Notice>
        </div>
      )}
      <div className={styles.fieldGrid2} style={{ alignItems: "start" }}>
        <section className={`${styles.panel} ${styles.panelPad}`}>
          <h2 className={styles.panelTitle}>Ümumi məlumat</h2>
          <p className={styles.panelSub} style={{ marginBottom: 18 }}>
            İstifadəçinin əsas məlumatları və rol təyinatları.
          </p>
          <div className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="u-name">Ad, soyad</label>
              <input id="u-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={128} />
            </div>
            <div className={styles.field}>
              <label htmlFor="u-email">E-poçt</label>
              <input id="u-email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} style={user ? { background: "#f3f2ee" } : undefined} />
              {user && <span className={styles.hint}>Bu istifadəçinin e-poçt ünvanı dəyişdirilə bilməz.</span>}
            </div>
            {!user && (
              <div className={styles.field}>
                <label htmlFor="u-pass">İlkin parol</label>
                <input id="u-pass" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" />
                <span className={styles.hint}>Ən azı 8 simvol. İstifadəçi girişdən sonra profildə dəyişə bilər.</span>
              </div>
            )}
            {user && (
              <div className={styles.field}>
                <span className={styles.label}>Hesab statusu</span>
                <div className={styles.toggleRow}>
                  <Toggle checked={active} onChange={setActive} label="Hesab aktivdir" />
                  <span>
                    <strong style={{ display: "block", fontSize: 15 }}>{active ? "Hesab aktivdir" : "Hesab deaktivdir"}</strong>
                    <span className={styles.hint}>Deaktiv edilən hesab sistemə daxil ola bilməyəcək.</span>
                  </span>
                </div>
              </div>
            )}
            <hr className={styles.divider} style={{ margin: "6px 0" }} />
            <div className={styles.field}>
              <h3 className={styles.panelTitle} style={{ fontSize: 18 }}>
                Rollar
              </h3>
              <span className={styles.hint}>İstifadəçiyə bir və ya bir neçə rol təyin edin.</span>
              <div className={styles.checks} style={{ marginTop: 10 }}>
                {roles.map((r) => (
                  <label key={r.id} className={styles.check}>
                    <input type="checkbox" checked={roleIds.has(r.id)} onChange={() => toggle(r.id)} />
                    <span>
                      <span className={styles.checkMain}>{r.name}</span>
                      {r.description && <span className={styles.checkSub}>{r.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {user && (
          <section className={`${styles.panel} ${styles.panelPad}`}>
            <h2 className={styles.panelTitle}>Təhlükəsizlik</h2>
            <p className={styles.panelSub} style={{ marginBottom: 18 }}>
              İstifadəçinin parolunu və təhlükəsizlik parametrlərini idarə edin.
            </p>
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="u-newpass">Yeni parol</label>
                <input id="u-newpass" type="password" className={styles.input} placeholder="Yeni parol daxil edin" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                <span className={styles.hint}>Minimum 8 simvol.</span>
              </div>
              <div className={styles.row}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGold}`}
                  disabled={busy || newPassword.length < 8}
                  onClick={async () => {
                    if (await run(() => api(`iam/users/${user.id}/reset-password`, { method: "POST", body: { newPassword } }), "Parol dəyişdirildi, istifadəçinin bütün sessiyaları bağlandı.")) setNewPassword("");
                  }}
                >
                  Parolu sıfırla
                </button>
                <span className={styles.hint}>Bütün sessiyalar bağlanacaq.</span>
              </div>
              <hr className={styles.divider} style={{ margin: "6px 0" }} />
              <div className={styles.field}>
                <h3 className={styles.panelTitle} style={{ fontSize: 17 }}>
                  Hesab kilidi
                </h3>
                <span className={styles.hint}>Kilidlənmiş hesab sistemə daxil ola bilməyəcək.</span>
                <div>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    disabled={busy || !user.locked}
                    onClick={async () => {
                      if (await run(() => api(`iam/users/${user.id}/unlock`, { method: "POST" }), "Hesabın kilidi açıldı.")) onChanged();
                    }}
                  >
                    Kilidi aç
                  </button>
                </div>
              </div>
              <hr className={styles.divider} style={{ margin: "6px 0" }} />
              <div className={styles.field}>
                <h3 className={styles.panelTitle} style={{ fontSize: 17 }}>
                  İki faktorlu autentifikasiya (2FA)
                </h3>
                <span className={styles.hint}>Bu istifadəçi üçün 2FA parametrlərini sıfırlayın.</span>
                <div className={styles.row}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    disabled={busy || !user.totpEnabled}
                    onClick={async () => {
                      if (confirm("Bu istifadəçinin 2FA-sı sıfırlansın?") && (await run(() => api(`iam/users/${user.id}/reset-2fa`, { method: "POST" }), "2FA sıfırlandı."))) onChanged();
                    }}
                  >
                    2FA-nı sıfırla
                  </button>
                  <span className={styles.hint}>İstifadəçi növbəti daxilolmada 2FA-nı yenidən qurmalı olacaq.</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
