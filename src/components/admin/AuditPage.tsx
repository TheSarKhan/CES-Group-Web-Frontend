"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { fmtDate, useApi } from "@/lib/admin/client";
import { MODULE_LABELS, type AuditRow, type Meta, type Page } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { Notice, PageHeader, Pagination, Pill, SearchBox, useCrumbs, type Tone } from "./ui";

const toneOf = (a: string): Tone => (/^(CREATE|UPLOAD|PUBLISH|RESTORE)/i.test(a) ? "ok" : /^(UPDATE|EDIT|REORDER)/i.test(a) ? "gold" : /^(DELETE|UNPUBLISH)/i.test(a) ? "bad" : /LOGIN|LOGOUT|2FA|PASSWORD/i.test(a) ? "info" : "muted");

export function AuditPage() {
  const [user, setUser] = useState("");
  const [module, setModule] = useState("");
  const [site, setSite] = useState("");
  const [size, setSize] = useState(25);
  const [page, setPage] = useState(0);
  const meta = useApi<Meta>("iam/meta");
  useCrumbs([{ label: "Sistem" }, { label: "Audit log" }]);

  const qs = new URLSearchParams({ page: String(page), size: String(size) });
  if (user.trim()) qs.set("user", user.trim());
  if (module) qs.set("module", module);
  if (site) qs.set("site", site);
  const rows = useApi<Page<AuditRow>>(`iam/audit?${qs}`);

  const filter = (fn: () => void) => {
    fn();
    setPage(0);
  };
  const pages = rows.data ? Math.max(1, Math.ceil(rows.data.total / size)) : 1;
  const from = rows.data && rows.data.total > 0 ? page * size + 1 : 0;
  const to = rows.data ? page * size + rows.data.items.length : 0;

  return (
    <>
      <PageHeader title="Audit log" sub="Kim, nə vaxt, nəyi dəyişib." />
      <section className={styles.panel} style={{ marginBottom: 18 }}>
        <div className={styles.toolbar}>
          <SearchBox value={user} onChange={(v) => filter(() => setUser(v))} placeholder="İstifadəçi (e-poçt)…" />
          <select className={styles.select} value={module} onChange={(e) => filter(() => setModule(e.target.value))} aria-label="Modul">
            <option value="">Bütün modullar</option>
            {Object.entries(MODULE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select className={styles.select} value={site} onChange={(e) => filter(() => setSite(e.target.value))} aria-label="Sayt">
            <option value="">Bütün saytlar</option>
            {meta.data?.sites.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </section>
      {rows.error ? (
        <Notice tone="bad">{rows.error}</Notice>
      ) : !rows.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <section className={styles.panel}>
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
                    <td style={{ whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</td>
                    <td>{r.userEmail ?? "—"}</td>
                    <td>
                      <Pill tone={toneOf(r.action)} small>
                        {r.action}
                      </Pill>
                    </td>
                    <td>{r.module ? (MODULE_LABELS[r.module] ?? r.module) : "—"}</td>
                    <td>{r.siteCode ?? "—"}</td>
                    <td style={{ maxWidth: 320 }}>{r.details ? <span className={styles.codeChip} style={{ wordBreak: "break-word" }}>{r.details}</span> : ""}</td>
                    <td className={styles.mono}>{r.ipAddress ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableFoot}>
            <span>
              {rows.data.total} qeyddən {from}–{to} göstərilir
            </span>
            <span className={styles.row} style={{ gap: 14 }}>
              <label className={styles.row} style={{ gap: 8 }}>
                Səhifədə:
                <select className={styles.select} style={{ minWidth: 76, height: 38 }} value={size} onChange={(e) => filter(() => setSize(Number(e.target.value)))} aria-label="Səhifədə qeyd sayı">
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </span>
          </div>
        </section>
      )}
      <div className={styles.infoStrip}>
        <Info size={20} />
        <span>Parollar və 2FA sirləri saxlanmır.</span>
      </div>
    </>
  );
}
