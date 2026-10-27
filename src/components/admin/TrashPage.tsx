"use client";

import { ApiError, api, fmtDate, useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

type Item = { kind: string; id: number; slug: string | null; label: string; hint: string | null; deletedAt: string };

const KINDS: Record<string, string> = {
  "fleet-category": "Kateqoriya",
  "fleet-subcategory": "Alt kateqoriya",
  "fleet-item": "Texnika",
  project: "Layihə",
  offering: "Xidmət",
  testimonial: "Rəy",
  client: "Müştəri",
  faq: "Sual",
  "quote-submission": "Qiymət sorğusu",
};

export function TrashPanel({ site }: { site: string }) {
  const { can } = useAdmin();
  const list = useApi<Item[]>("admin/trash");

  async function act(path: string, method: "POST" | "DELETE", confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    try {
      await api(path, { method });
      list.reload();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Əməliyyat alınmadı.");
    }
  }

  if (list.error) return <p className={styles.error}>{list.error}</p>;
  if (!list.data) return <p className={styles.loading}>Yüklənir…</p>;

  return (
    <>
      <p className={styles.sub}>Silinən məzmun burada saxlanılır. Bərpa etmək və ya birdəfəlik silmək olar. 90 gündən köhnələr avtomatik təmizlənir.</p>
      <div className={`${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Növ</th>
              <th>Ad</th>
              <th>Silinmə vaxtı</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.data.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.muted}>
                  Zibil qutusu boşdur.
                </td>
              </tr>
            )}
            {list.data.map((i) => (
              <tr key={`${i.kind}-${i.id}`}>
                <td>{KINDS[i.kind] ?? i.kind}</td>
                <td>
                  {i.label}
                  {i.hint && <span className={styles.hint}> ({i.hint})</span>}
                </td>
                <td className={styles.muted}>{fmtDate(i.deletedAt)}</td>
                <td>
                  <div className={styles.row} style={{ flexWrap: "nowrap" }}>
                    {can("TRASH", "UPDATE", site) && (
                      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => act(`admin/trash/${i.kind}/${i.id}/restore`, "POST")}>
                        Bərpa et
                      </button>
                    )}
                    {can("TRASH", "DELETE", site) && (
                      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => act(`admin/trash/${i.kind}/${i.id}`, "DELETE", `"${i.label}" birdəfəlik silinsin? Bunu geri qaytarmaq olmaz.`)}>
                        Birdəfəlik sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
