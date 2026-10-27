"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, EyeOff, GripVertical, Info, Pencil, Trash2 } from "lucide-react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import { previewUrl } from "@/lib/admin/upload";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { buildPayload, specsFromRow, trFromRow, valuesFromRow, type Deps, type EntityConfig, type Row } from "./EntityManager";
import { Avatar, Notice, Pagination, Pill, RowMenu, SearchBox, ViewToggle } from "./ui";

const PAGE = 15;

/** Seçim siyahıları üçün lazım olan digər siyahıları yükləyir */
export function useDeps(paths?: Record<string, string>) {
  const entries = Object.entries(paths ?? {});
  const a = useApi<Row[]>(entries[0]?.[1] ?? null);
  const b = useApi<Row[]>(entries[1]?.[1] ?? null);
  if (entries.length === 0) return { ready: true, data: {} as Deps };
  const data: Deps = {};
  if (entries[0]) data[entries[0][0]] = a.data ?? [];
  if (entries[1]) data[entries[1][0]] = b.data ?? [];
  const ready = (!entries[0] || !!a.data) && (!entries[1] || !!b.data);
  return { ready, data };
}

function Thumb({ cfg, row }: { cfg: EntityConfig; row: Row }) {
  if (cfg.thumbKind === "avatar") return <Avatar name={cfg.name(row)} large />;
  const url = cfg.thumb?.(row);
  if (!cfg.thumb) return null;
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={previewUrl(url)} alt="" className={`${styles.thumb} ${cfg.thumbKind === "logo" ? styles.thumbLogo : ""}`} />
  ) : (
    <span className={styles.thumb} />
  );
}

export function EntityList({ cfg, site, base }: { cfg: EntityConfig; site: string; /** Redaktə ünvanının əsası: /sites/equipment/m/fleet/items */ base: string }) {
  const { can } = useAdmin();
  const list = useApi<Row[]>(cfg.path);
  const deps = useDeps(cfg.deps);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [cat, setCat] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(0);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const canEdit = can(cfg.module, "UPDATE", site);
  const canDelete = can(cfg.module, "DELETE", site);
  const canPublish = can(cfg.module, "PUBLISH", site);

  const sorted = useMemo(() => [...(list.data ?? [])].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)), [list.data]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sorted.filter((r) => {
      if (needle && !(cfg.searchText ? cfg.searchText(r) : `${cfg.name(r)} ${cfg.sub2?.(r) ?? ""} ${JSON.stringify(r.translations ?? "")}`).toLowerCase().includes(needle)) return false;
      if (status === "on" && r.isPublished === false) return false;
      if (status === "off" && r.isPublished !== false) return false;
      if (cat && cfg.filter && !cfg.filter.match(r, cat)) return false;
      return true;
    });
  }, [sorted, q, status, cat, cfg]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const reorderable = !!cfg.reorder && canEdit && !q.trim() && !status && !cat;
  const keyOf = (r: Row) => String(r[cfg.key]);
  const nextSort = Math.max(0, ...(list.data ?? []).map((r) => Number(r.sortOrder ?? 0)));

  const filter = (fn: () => void) => {
    fn();
    setPage(0);
  };

  async function drop(targetKey: string) {
    if (!dragKey || dragKey === targetKey) return setDragKey(null);
    const order = sorted.map(keyOf);
    const from = order.indexOf(dragKey);
    const to = order.indexOf(targetKey);
    if (from < 0 || to < 0) return setDragKey(null);
    order.splice(to, 0, order.splice(from, 1)[0]);
    setDragKey(null);
    setOverKey(null);
    try {
      await api(`${cfg.path}/reorder`, { method: "PATCH", body: { slugs: order } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Sıra saxlanmadı.");
    }
    list.reload();
  }

  /** Sətrin görünürlüyünü və ya sırasını dəyişir: kataloqda PATCH, qalanlarında tam PUT */
  async function patchRow(row: Row, change: { isPublished?: boolean; sortOrder?: number }) {
    if (cfg.publishToggle && change.isPublished !== undefined && change.sortOrder === undefined) {
      await api(`${cfg.path}/${row[cfg.key]}/publish`, { method: "PATCH", body: { isPublished: change.isPublished } });
      return;
    }
    const values = { ...valuesFromRow(cfg, row, nextSort + 1), ...change };
    const built = buildPayload(cfg, values, trFromRow(cfg, row), specsFromRow(row));
    if ("error" in built) throw new ApiError(400, built.error);
    await api(`${cfg.path}/${row[cfg.key]}`, { method: "PUT", body: built.payload });
  }

  async function run(fn: () => Promise<unknown>, fail: string) {
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : fail);
    }
    list.reload();
  }

  const toggle = (row: Row) => run(() => patchRow(row, { isPublished: row.isPublished === false }), "Status dəyişmədi.");
  const remove = (row: Row) => {
    if (!confirm(`"${cfg.confirmName(row)}" silinsin? Zibil qutusundan bərpa etmək olar.`)) return;
    void run(() => api(`${cfg.path}/${row[cfg.key]}`, { method: "DELETE" }), "Silinmədi.");
  };
  const bulk = (action: "show" | "hide" | "delete") => {
    const targets = (list.data ?? []).filter((r) => picked.has(keyOf(r)));
    if (action === "delete" && !confirm(`${targets.length} qeyd silinsin? Zibil qutusundan bərpa etmək olar.`)) return;
    void run(async () => {
      for (const r of targets) {
        if (action === "delete") await api(`${cfg.path}/${r[cfg.key]}`, { method: "DELETE" });
        else await patchRow(r, { isPublished: action === "show" });
      }
      setPicked(new Set());
    }, "Əməliyyat tamamlanmadı.");
  };

  if (list.error) return <Notice tone="bad">{list.error}</Notice>;
  if (!list.data || !deps.ready) return <p className={styles.loading}>Yüklənir…</p>;

  const allOnPage = shown.length > 0 && shown.every((r) => picked.has(keyOf(r)));
  const toggleAll = () =>
    setPicked((p) => {
      const n = new Set(p);
      shown.forEach((r) => (allOnPage ? n.delete(keyOf(r)) : n.add(keyOf(r))));
      return n;
    });
  const editHref = (r: Row) => `${base}/${r[cfg.key]}`;
  const statusPill = (r: Row) => {
    const hidden = r.isPublished === false;
    const pill = <Pill tone={hidden ? "muted" : "ok"}>{hidden ? "Gizli" : "Saytda"}</Pill>;
    return canPublish ? (
      <button type="button" onClick={() => toggle(r)} title="Dəyişmək üçün basın" style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
        {pill}
      </button>
    ) : (
      pill
    );
  };

  return (
    <>
      {error && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="bad">{error}</Notice>
        </div>
      )}
      <p className={styles.panelSub} style={{ margin: "0 0 12px" }}>
        {cfg.sub}
      </p>
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={(v) => filter(() => setQ(v))} placeholder={`${cfg.tab} axtar…`} />
          {cfg.filter && (
            <select className={styles.select} value={cat} onChange={(e) => filter(() => setCat(e.target.value))} aria-label={cfg.filter.all}>
              <option value="">{cfg.filter.all}</option>
              {cfg.filter.options(deps.data).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <select className={styles.select} value={status} onChange={(e) => filter(() => setStatus(e.target.value))} aria-label="Status">
            <option value="">Bütün statuslar</option>
            <option value="on">Saytda</option>
            <option value="off">Gizli</option>
          </select>
          <span className={styles.toolbarEnd}>
            Nəticələr: <strong style={{ color: "var(--ink)" }}>{rows.length}</strong>
            {cfg.grid && <ViewToggle value={view} onChange={setView} />}
          </span>
        </div>

        {picked.size > 0 && (
          <div className={styles.toolbar} style={{ paddingTop: 0 }}>
            <Pill tone="gold">{picked.size} seçildi</Pill>
            {canPublish && (
              <>
                <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => bulk("show")}>
                  <Eye size={16} /> Saytda göstər
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => bulk("hide")}>
                  <EyeOff size={16} /> Gizlət
                </button>
              </>
            )}
            {canDelete && (
              <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => bulk("delete")}>
                <Trash2 size={16} /> Sil
              </button>
            )}
          </div>
        )}

        {view === "grid" && cfg.grid ? (
          <div className={styles.mediaGrid} style={{ paddingTop: 4 }}>
            {shown.map((r) => (
              <div key={keyOf(r)} className={styles.mediaItem} style={{ cursor: "default" }}>
                {cfg.thumb?.(r) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl(cfg.thumb(r))} alt="" />
                ) : (
                  <span className={styles.thumb} style={{ width: "100%", height: 140, display: "block" }} />
                )}
                <strong>{cfg.name(r)}</strong>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  {statusPill(r)}
                  {canEdit && (
                    <Link href={editHref(r)} className={`${styles.iconBtn} ${styles.iconBtnSm}`} aria-label="Redaktə">
                      <Pencil size={16} />
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Hamısını seç" style={{ accentColor: "var(--gold)" }} />
                  </th>
                  {reorderable && <th style={{ width: 36 }} aria-label="Sıralama" />}
                  <th>{cfg.tab}</th>
                  {cfg.columns.map((c) => (
                    <th key={c.head} style={c.align ? { textAlign: c.align } : undefined}>
                      {c.head}
                    </th>
                  ))}
                  <th>Sıra</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={cfg.columns.length + 6} className={styles.muted}>
                      Heç nə tapılmadı.
                    </td>
                  </tr>
                )}
                {shown.map((r) => {
                  const k = keyOf(r);
                  return (
                    <tr
                      key={k}
                      draggable={reorderable}
                      onDragStart={() => setDragKey(k)}
                      onDragOver={(e) => {
                        if (reorderable) {
                          e.preventDefault();
                          setOverKey(k);
                        }
                      }}
                      onDrop={() => reorderable && drop(k)}
                      onDragEnd={() => {
                        setDragKey(null);
                        setOverKey(null);
                      }}
                      className={`${dragKey === k ? styles.rowDragging : ""} ${overKey === k && dragKey !== k ? styles.rowOver : ""}`}
                    >
                      <td>
                        <input type="checkbox" checked={picked.has(k)} onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n; })} aria-label="Seç" style={{ accentColor: "var(--gold)" }} />
                      </td>
                      {reorderable && (
                        <td>
                          <span className={styles.dragHandle} title="Sıranı dəyişmək üçün sürüşdürün">
                            <GripVertical size={20} />
                          </span>
                        </td>
                      )}
                      <td>
                        <div className={styles.cellFlex}>
                          <Thumb cfg={cfg} row={r} />
                          <span style={{ minWidth: 0 }}>
                            <Link href={editHref(r)} className={styles.cellMain}>
                              {cfg.name(r)}
                            </Link>
                            {cfg.sub2?.(r) && <span className={styles.cellSub}>{cfg.sub2(r)}</span>}
                          </span>
                        </div>
                      </td>
                      {cfg.columns.map((c) => (
                        <td key={c.head} style={c.align ? { textAlign: c.align } : undefined}>
                          {c.cell(r)}
                        </td>
                      ))}
                      <td>
                        {cfg.inlineSort && canEdit ? (
                          <input
                            className={styles.input}
                            type="number"
                            style={{ width: 84, height: 40 }}
                            defaultValue={Number(r.sortOrder ?? 0)}
                            aria-label="Sıra"
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (Number.isFinite(v) && v !== Number(r.sortOrder ?? 0)) void run(() => patchRow(r, { sortOrder: v }), "Sıra saxlanmadı.");
                            }}
                          />
                        ) : (
                          String(r.sortOrder ?? "")
                        )}
                      </td>
                      <td>{statusPill(r)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          {canEdit && (
                            <Link href={editHref(r)} className={styles.iconBtn} aria-label="Redaktə">
                              <Pencil size={18} />
                            </Link>
                          )}
                          <RowMenu
                            items={[
                              { label: "Redaktə et", icon: <Pencil size={16} />, href: editHref(r), hidden: !canEdit },
                              { label: r.isPublished === false ? "Saytda göstər" : "Gizlət", icon: r.isPublished === false ? <Eye size={16} /> : <EyeOff size={16} />, hidden: !canPublish, onClick: () => toggle(r) },
                              { label: "Sil", icon: <Trash2 size={16} />, danger: true, hidden: !canDelete, onClick: () => remove(r) },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.tableFoot}>
          <span>
            {rows.length} {cfg.tab.toLowerCase()} {rows.length > PAGE ? `(${page * PAGE + 1}–${Math.min(rows.length, page * PAGE + PAGE)})` : ""}
          </span>
          <Pagination page={page} pages={pages} onChange={setPage} />
          <span className={styles.footHint}>
            <Info size={16} />
            {reorderable ? "Sıralamanı dəyişmək üçün tutacaqdan sürüşdürün." : "Sıra dəyəri kiçik olan əvvəl göstərilir."}
          </span>
        </div>
      </section>
    </>
  );
}
