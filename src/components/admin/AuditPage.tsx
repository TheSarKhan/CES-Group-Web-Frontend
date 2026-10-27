"use client";

import { useState } from "react";
import { fmtDate, useApi } from "@/lib/admin/client";
import { MODULE_LABELS, type AuditRow, type Meta, type Page } from "@/lib/admin/types";
import styles from "./admin.module.css";

const SIZE = 50;

export function AuditPage() {
  const [user, setUser] = useState("");
  const [module, setModule] = useState("");
  const [site, setSite] = useState("");
  const [page, setPage] = useState(0);
  const meta = useApi<Meta>("iam/meta");

  const qs = new URLSearchParams({ page: String(page), size: String(SIZE) });
  if (user.trim()) qs.set("user", user.trim());
  if (module) qs.set("module", module);
  if (site) qs.set("site", site);
  const rows = useApi<Page<AuditRow>>(`iam/audit?${qs}`);

  const filter = (fn: () => void) => {
    fn();
    setPage(0);
  };
  const pages = rows.data ? Math.max(1, Math.ceil(rows.data.total / SIZE)) : 1;

  return (
    <>
      <h1 className={styles.h1}>Audit log</h1>
      <p className={styles.sub}>Kim, nə vaxt, nəyi dəyişib. Parollar və 2FA sirləri burada saxlanmır.</p>
      <div className={styles.filters}>
        <input className={styles.input} placeholder="İstifadəçi (e-poçt)" value={user} onChange={(e) => filter(() => setUser(e.target.value))} aria-label="İstifadəçi" />
        <select className={styles.input} value={module} onChange={(e) => filter(() => setModule(e.target.value))} aria-label="Modul">
          <option value="">Bütün modullar</option>
          {Object.entries(MODULE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className={styles.input} value={site} onChange={(e) => filter(() => setSite(e.target.value))} aria-label="Sayt">
          <option value="">Bütün saytlar</option>
          {meta.data?.sites.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
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
                  <th>Vaxt</th>
                  <th>İstifadəçi</th>
                  <th>Əməliyyat</th>
                  <th>Modul</th>
                  <th>Sayt</th>
                  <th>Detal</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.muted}>
                      Qeyd tapılmadı.
                    </td>
                  </tr>
                )}
                {rows.data.items.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.muted} style={{ whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</td>
                    <td>{r.userEmail ?? "—"}</td>
                    <td className={styles.mono}>{r.action}</td>
                    <td>{r.module ? (MODULE_LABELS[r.module] ?? r.module) : "—"}</td>
                    <td>{r.siteCode ?? "—"}</td>
                    <td className={styles.mono} style={{ maxWidth: 320, wordBreak: "break-word" }}>{r.details ?? ""}</td>
                    <td className={styles.mono}>{r.ipAddress ?? ""}</td>
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
              {page + 1} / {pages} ({rows.data.total} qeyd)
            </span>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>
              Növbəti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
