"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Info, Pencil, Plus, Trash2 } from "lucide-react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import { ACTION_LABELS, MODULE_LABELS, type Action, type Meta, type RoleView } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Notice, PageHeader, Pill, RowMenu, SearchBox, useCrumbs } from "./ui";

const ALL = "*";
const key = (module: string, action: string, site: string) => `${module}:${action}:${site}`;

export function RolesPage() {
  const { can } = useAdmin();
  const roles = useApi<RoleView[]>("iam/roles");
  const [q, setQ] = useState("");
  useCrumbs([{ label: "Sistem" }, { label: "Rollar" }]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (roles.data ?? []).filter((r) => !needle || `${r.name} ${r.description ?? ""}`.toLowerCase().includes(needle));
  }, [roles.data, q]);

  if (roles.error) return <Notice tone="bad">{roles.error}</Notice>;
  if (!roles.data) return <p className={styles.loading}>Yüklənir…</p>;

  return (
    <>
      <PageHeader
        title="Rollar"
        sub="Rol sayt, modul və əməliyyat icazələrini müəyyən edir."
        actions={
          can("ROLES", "CREATE") && (
            <Link href="/roles/new" className={`${styles.btn} ${styles.btnGold}`}>
              <Plus size={18} /> Yeni rol
            </Link>
          )
        }
      />
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={setQ} placeholder="Rol axtar…" />
          <span className={styles.toolbarEnd}>
            Nəticələr: <strong style={{ color: "var(--ink)" }}>{rows.length}</strong>
          </span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Təsvir</th>
                <th>İcazə sayı</th>
                <th>İstifadəçi</th>
                <th style={{ textAlign: "right" }}>Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const readOnly = r.system || !can("ROLES", "UPDATE");
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/roles/${r.id}`} className={styles.cellMain}>
                        {r.name}
                      </Link>
                      {r.system && (
                        <div style={{ marginTop: 4 }}>
                          <Pill tone="gold" small>
                            Sistem
                          </Pill>
                        </div>
                      )}
                    </td>
                    <td className={styles.muted}>{r.description ?? "—"}</td>
                    <td>{r.superRole ? "Hamısı" : r.permissions.length}</td>
                    <td>{r.userCount}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/roles/${r.id}`} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
                          {readOnly ? "Bax" : "Redaktə"}
                        </Link>
                        <RowMenu items={[{ label: readOnly ? "Bax" : "Redaktə et", icon: <Pencil size={16} />, href: `/roles/${r.id}` }]} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFoot}>
          <span>{roles.data.length} rol</span>
          <span className={styles.footHint}>
            <Info size={16} /> Bir istifadəçiyə bir neçə rol verilə bilər.
          </span>
        </div>
      </section>
    </>
  );
}

/** Rolun redaktəsi: ad, təsvir və sayt üzrə modul × əməliyyat matrisi */
export function RoleEditorPage({ id }: { id: string }) {
  const roles = useApi<RoleView[]>("iam/roles");
  const meta = useApi<Meta>("iam/meta");
  const isNew = id === "new";
  const role = isNew ? null : (roles.data?.find((r) => String(r.id) === id) ?? null);
  useCrumbs([{ label: "Sistem" }, { label: "Rollar", href: "/roles" }, { label: isNew ? "Yeni rol" : (role?.name ?? "") }]);

  if (roles.error || meta.error) return <Notice tone="bad">{roles.error ?? meta.error}</Notice>;
  if (!roles.data || !meta.data) return <p className={styles.loading}>Yüklənir…</p>;
  if (!isNew && !role) return <Notice tone="bad">Rol tapılmadı.</Notice>;
  return <RoleForm key={role?.id ?? "new"} role={role} meta={meta.data} />;
}

function RoleForm({ role, meta }: { role: RoleView | null; meta: Meta }) {
  const { can } = useAdmin();
  const router = useRouter();
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

  async function save() {
    setBusy(true);
    setError("");
    const permissions = [...granted].map((k) => {
      const [module, action, site] = k.split(":");
      return { module, action, siteCode: site === ALL ? null : site };
    });
    try {
      await api(role ? `iam/roles/${role.id}` : "iam/roles", { method: role ? "PUT" : "POST", body: { name, description, permissions } });
      router.push("/roles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  async function remove() {
    if (!role || !confirm(`"${role.name}" rolu silinsin?`)) return;
    setBusy(true);
    try {
      await api(`iam/roles/${role.id}`, { method: "DELETE" });
      router.push("/roles");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  const scopeCount = (s: string) => [...granted].filter((k) => k.endsWith(`:${s}`)).length;
  const sites = [{ code: ALL, name: "Bütün saytlar" }, ...meta.sites];

  return (
    <>
      <PageHeader
        back={{ href: "/roles" }}
        eyebrow={role ? "Rol redaksiyası" : "Yeni rol"}
        title={role?.name || "Yeni rol"}
        sub={role?.description ?? "Rolun adını və icazələrini təyin edin."}
        actions={
          <>
            <Link href="/roles" className={`${styles.btn} ${styles.btnGhost}`}>
              {readOnly ? "Geri" : "Ləğv et"}
            </Link>
            {!readOnly && (
              <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={() => void save()}>
                Yadda saxla
              </button>
            )}
          </>
        }
      />
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="bad">{error}</Notice>
        </div>
      )}
      <section className={`${styles.panel} ${styles.panelPad}`}>
        {role?.superRole ? (
          <p className={styles.panelSub}>Super Admin rolu bütün saytlarda və modullarda tam səlahiyyətə malikdir və dəyişdirilə bilməz.</p>
        ) : (
          <>
            <div className={styles.fieldGrid2}>
              <div className={styles.field}>
                <label htmlFor="r-name">Rolun adı</label>
                <input id="r-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={64} disabled={readOnly} />
              </div>
              <div className={styles.field}>
                <label htmlFor="r-desc">Təsvir</label>
                <textarea id="r-desc" className={styles.input} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={255} disabled={readOnly} />
                <span className={styles.hint} style={{ textAlign: "right" }}>
                  {description.length}/255
                </span>
              </div>
            </div>

            <h3 className={styles.panelTitle} style={{ fontSize: 17, margin: "24px 0 10px" }}>
              Sayt əhatəsi
            </h3>
            <div className={styles.tabs} role="tablist" style={{ marginBottom: 14 }}>
              {sites.map((s) => (
                <button key={s.code} type="button" role="tab" aria-selected={scope === s.code} className={styles.tab} onClick={() => setScope(s.code)}>
                  {s.name}
                  {scopeCount(s.code) > 0 && (
                    <span style={{ marginLeft: 8 }}>
                      <Pill tone="gold" small>
                        {scopeCount(s.code)}
                      </Pill>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Notice tone="info">
              {scope === ALL ? "Burada verilən icazə bütün saytlara şamil olur. İstifadəçilər, Rollar və Audit log modulları saytdan asılı deyil, yalnız burada verilir." : "Bu icazələr yalnız seçilmiş sayta şamil olur."}
            </Notice>
            <div className={styles.tableWrap} style={{ marginTop: 14, border: "1px solid var(--line)", borderRadius: 10 }}>
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
          </>
        )}
        {role && !role.system && can("ROLES", "DELETE") && (
          <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => void remove()} disabled={busy} style={{ background: "var(--bad-bg)" }}>
              <Trash2 size={16} /> Rolu sil
            </button>
          </div>
        )}
      </section>
    </>
  );
}
