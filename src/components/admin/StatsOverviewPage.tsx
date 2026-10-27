"use client";

import Link from "next/link";
import { useState } from "react";
import { fmtDate, useApi } from "@/lib/admin/client";
import type { StatsOverview } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { DaysSelect, Kpi, nf } from "./StatsParts";

/** Saytların yan-yana müqayisəsi: yalnız baxmaq icazəsi olan saytlar göstərilir */
export function StatsOverviewPage() {
  const [days, setDays] = useState(30);
  const data = useApi<StatsOverview>(`panel/stats/overview?days=${days}`);
  // Hələ cavablandırılmamış (yeni) müraciətlər: yan menyudakı sayğacla eyni mənbə
  const pending = useApi<Record<string, number>>("panel/summary").data ?? {};
  const newTotal = Object.values(pending).reduce((n, v) => n + v, 0);

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Ümumi icmal</h1>
          <p className={styles.sub}>Bütün saytların birgə statistikası. Ətraflı görmək üçün saytın adına basın.</p>
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
        <>
        <div className={styles.kpis}>
          <Kpi label="Ziyarətçi" value={nf(data.data.sites.reduce((n, s) => n + s.users, 0))} note={`Son ${days} gün, ${data.data.sites.length} sayt`} />
          <Kpi label="Səhifə baxışı" value={nf(data.data.sites.reduce((n, s) => n + s.pageViews, 0))} />
          <Kpi label="Sessiya" value={nf(data.data.sites.reduce((n, s) => n + s.sessions, 0))} />
          <Kpi label="Müraciət" value={nf(data.data.sites.reduce((n, s) => n + s.leads, 0))} note={newTotal ? `${newTotal} cavabsız` : undefined} />
        </div>
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
                <th>Cavabsız müraciət</th>
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
                  <td>{pending[s.code] ? <Link href={`/sites/${s.code}/submissions`}>{pending[s.code]}</Link> : <span className={styles.muted}>0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.hint} style={{ padding: "12px 16px" }}>
            Yenilənmə: {fmtDate(data.data.generatedAt)}. Cookie razılığı verməyənlər ölçülmür, müraciət sayı isə dəqiqdir.
          </p>
        </div>
        </>
      )}
    </>
  );
}
