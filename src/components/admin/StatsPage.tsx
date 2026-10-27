"use client";

import { useState } from "react";
import { fmtDate, useApi } from "@/lib/admin/client";
import type { SiteStats } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { SiteTabs } from "./SiteTabs";
import { DaysSelect, Kpi, TopList, TrendChart, nf } from "./StatsParts";

export function StatsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const [days, setDays] = useState(30);
  const allowed = can("STATISTICS", "VIEW", code);
  const stats = useApi<SiteStats>(allowed ? `panel/stats/sites/${code}?days=${days}` : null);

  if (!site || !allowed) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>Saytın ziyarətçi statistikası ({site.domain}).</p>
        </div>
        <DaysSelect days={days} onChange={setDays} />
      </div>
      <SiteTabs code={code} current="stats" />
      {stats.error ? (
        <p className={styles.notice} role="alert">
          {stats.error}
        </p>
      ) : !stats.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Ziyarətçi" value={nf(stats.data.totals.users)} />
            <Kpi label="Səhifə baxışı" value={nf(stats.data.totals.pageViews)} />
            <Kpi label="Sessiya" value={nf(stats.data.totals.sessions)} note={`Cəlbetmə: ${Math.round(stats.data.totals.engagementRate * 100)}%`} />
            <Kpi label="Müraciət" value={nf(stats.data.leads)} note={`Konversiya: ${stats.data.conversionRate}%`} />
            <Kpi label="AI vasitələrindən" value={nf(stats.data.aiSessions)} note="ChatGPT, Perplexity, Gemini, Claude və s." />
          </div>

          <section className={styles.chartCard}>
            <div className={styles.chartLegend}>
              <span>
                <span className={styles.dot} style={{ background: "var(--ink)" }} />
                Ziyarətçi
              </span>
              <span>
                <span className={styles.dot} style={{ background: "var(--gold)" }} />
                Səhifə baxışı
              </span>
            </div>
            <TrendChart points={stats.data.daily} />
          </section>

          <div className={styles.statGrid}>
            <TopList title="Ən çox baxılan səhifələr" items={stats.data.pages} />
            <TopList title="Trafik mənbələri (sessiya)" items={stats.data.sources} />
            <TopList title="Ölkələr (ziyarətçi)" items={stats.data.countries} />
            <TopList title="Cihaz" items={stats.data.devices} />
            <TopList title="Brauzer" items={stats.data.browsers} />
          </div>
          <p className={styles.hint} style={{ marginTop: 16 }}>
            Məlumat Google Analytics-dən gəlir, bir neçə saat gecikə bilər və 15 dəqiqə keşlənir (yenilənmə: {fmtDate(stats.data.generatedAt)}). Cookie razılığı verməyən ziyarətçilər ölçülmür. Müraciət sayı isə panelin öz bazasından gəlir və dəqiqdir.
          </p>
        </>
      )}
    </>
  );
}
