"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Folder, Info, MessageSquare, Settings, Trash2, Truck, Users, CircleHelp, Star } from "lucide-react";
import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { ConfirmPopover, Notice, PageHeader, SearchBox, useCrumbs } from "./ui";

type Item = { kind: string; id: number; slug: string | null; label: string; hint: string | null; deletedAt: string };

const KINDS: Record<string, { label: string; icon: ReactNode }> = {
  "fleet-category": { label: "Kateqoriya", icon: <Folder size={22} /> },
  "fleet-subcategory": { label: "Alt kateqoriya", icon: <Folder size={22} /> },
  "fleet-item": { label: "Texnika", icon: <Truck size={22} /> },
  project: { label: "Layihə", icon: <Folder size={22} /> },
  offering: { label: "Xidmət", icon: <Settings size={22} /> },
  testimonial: { label: "Rəy", icon: <Star size={22} /> },
  client: { label: "Müştəri", icon: <Users size={22} /> },
  faq: { label: "Sual", icon: <CircleHelp size={22} /> },
  "quote-submission": { label: "Qiymət sorğusu", icon: <MessageSquare size={22} /> },
};

export function TrashPanel({ site }: { site: string }) {
  const { me, can } = useAdmin();
  const list = useApi<Item[]>("admin/trash");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [error, setError] = useState("");
  useCrumbs([{ label: me.sites.find((s) => s.code === site)?.name ?? site }, { label: "Zibil qutusu" }]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list.data ?? []).filter((i) => (!kind || i.kind === kind) && (!needle || `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(needle)));
  }, [list.data, q, kind]);

  async function act(path: string, method: "POST" | "DELETE") {
    setError("");
    try {
      await api(path, { method });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Əməliyyat alınmadı.");
    }
    list.reload();
  }

  if (list.error) return <Notice tone="bad">{list.error}</Notice>;
  if (!list.data) return <p className={styles.loading}>Yüklənir…</p>;

  const kinds = [...new Set(list.data.map((i) => i.kind))];
  return (
    <>
      <PageHeader title="Zibil qutusu" sub="Silinmiş qeydləri nəzərdən keçirin və bərpa edin." />
      <div style={{ marginBottom: 18 }}>
        <Notice tone="info" icon={<Info size={20} />}>
          Birdəfəlik silinən məlumat geri qaytarılmır. 90 gündən köhnələr avtomatik təmizlənir.
        </Notice>
      </div>
      {error && (
        <div style={{ marginBottom: 14 }}>
          <Notice tone="bad">{error}</Notice>
        </div>
      )}
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <SearchBox value={q} onChange={setQ} placeholder="Ad üzrə axtar…" />
          <select className={styles.select} value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Növ">
            <option value="">Bütün növlər</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {KINDS[k]?.label ?? k}
              </option>
            ))}
          </select>
          <span className={styles.toolbarEnd}>
            Nəticələr: <strong style={{ color: "var(--ink)" }}>{rows.length}</strong>
          </span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Növ</th>
                <th>Ad</th>
                <th>Silinmə tarixi</th>
                <th style={{ textAlign: "right" }}>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.muted}>
                    Zibil qutusu boşdur.
                  </td>
                </tr>
              )}
              {rows.map((i) => (
                <tr key={`${i.kind}-${i.id}`}>
                  <td>
                    <div className={styles.cellFlex}>
                      <span className={styles.iconTile}>{KINDS[i.kind]?.icon ?? <Trash2 size={22} />}</span>
                      <span style={{ fontWeight: 500 }}>{KINDS[i.kind]?.label ?? i.kind}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.cellMain}>{i.label}</span>
                    {i.hint && <span className={styles.cellSub}>{i.hint}</span>}
                  </td>
                  <td>{fmtDate(i.deletedAt)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      {can("TRASH", "UPDATE", site) && (
                        <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => void act(`admin/trash/${i.kind}/${i.id}/restore`, "POST")}>
                          Bərpa et
                        </button>
                      )}
                      {can("TRASH", "DELETE", site) && (
                        <ConfirmPopover
                          title="Birdəfəlik silinsin?"
                          text="Geri qaytarmaq mümkün deyil."
                          confirmLabel="Birdəfəlik sil"
                          onConfirm={() => void act(`admin/trash/${i.kind}/${i.id}`, "DELETE")}
                          trigger={(open) => (
                            <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={open} aria-label="Birdəfəlik sil">
                              <Trash2 size={18} />
                            </button>
                          )}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFoot}>
          <span>{rows.length} qeyd</span>
        </div>
      </section>
    </>
  );
}
