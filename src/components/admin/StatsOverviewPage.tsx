"use client";

import Link from "next/link";
import { useState } from "react";
import { fmtDate, useApi } from "@/lib/admin/client";
import type { StatsOverview } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { DaysSelect, nf } from "./StatsParts";

/** Saytların yan-yana müqayisəsi: yalnız baxmaq icazəsi olan saytlar göstərilir */
export function StatsOverviewPage() {
  const [days, setDays] = useState(30);
  const data = useApi<StatsOverview>(`panel/stats/overview?days=${days}`);

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Statistika</h1>
          <p className={styles.sub}>Saytların ümumi müqayisəsi. Ətraflı görmək üçün saytın adına basın.</p>
        </div>
        <DaysSelect days={days} onChange={setDays} />
      </div>
      {data.error ? (
        <p className={styles.notice} role="alert">
          {data.error}
        </p>
      ) : !data.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <div className={`${styles.panel} ${styles.tableWrap}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sayt</th>
                <th>Ziyarətçi</th>
                <th>Səhifə baxışı</th>
                <th>Sessiya</th>
                <th>Müraciət</th>
                <th>Konversiya</th>
              </tr>
            </thead>
            <tbody>
              {data.data.sites.map((s) => (
                <tr key={s.code}>
                  <td>
                    <Link href={`/sites/${s.code}/stats`}>{s.name}</Link>
                  </td>
                  <td>{nf(s.users)}</td>
                  <td>{nf(s.pageViews)}</td>
                  <td>{nf(s.sessions)}</td>
                  <td>{nf(s.leads)}</td>
                  <td>{s.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.hint} style={{ padding: "12px 16px" }}>
            Yenilənmə: {fmtDate(data.data.generatedAt)}. Cookie razılığı verməyənlər ölçülmür, müraciət sayı isə dəqiqdir.
          </p>
        </div>
      )}
    </>
  );
}
