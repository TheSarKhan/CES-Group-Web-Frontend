"use client";

import { useState } from "react";
import { Clock, FileText, MessageSquare, Sparkles, Users } from "lucide-react";
import { fmtDate, fmtDay, useApi } from "@/lib/admin/client";
import type { SiteStats } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Kpi, RangePicker, TopList, TrendChart, nf, rangeQuery, type Range } from "./StatsParts";
import { Notice, PageHeader, useCrumbs } from "./ui";

export function StatsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const [days, setDays] = useState(30);
  const [range, setRange] = useState<Range>(null);
  const allowed = can("STATISTICS", "VIEW", code);
  const stats = useApi<SiteStats>(allowed ? `panel/stats/sites/${code}?${rangeQuery(days, range)}` : null);
  useCrumbs([{ label: site?.name ?? code }, { label: "Statistika" }]);

  if (!site || !allowed) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;
  const d = stats.data;

  return (
    <>
      <PageHeader title={`${site.name} statistikası`} sub={site.domain} actions={<RangePicker days={days} range={range} onDays={setDays} onRange={setRange} />} />
      {stats.error ? (
        <Notice tone="bad">{stats.error}</Notice>
      ) : !d ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Ziyarətçi" value={nf(d.totals.users)} icon={<Users size={22} />} />
            <Kpi label="Səhifə baxışı" value={nf(d.totals.pageViews)} icon={<FileText size={22} />} />
            <Kpi label="Sessiya" value={nf(d.totals.sessions)} note={`Cəlbetmə ${Math.round(d.totals.engagementRate * 100)}%`} icon={<Clock size={22} />} />
            <Kpi label="Müraciət" value={nf(d.leads)} note={`Konversiya ${d.conversionRate}%`} icon={<MessageSquare size={22} />} />
            <Kpi label="AI vasitələrindən" value={nf(d.aiSessions)} note="ChatGPT, Perplexity, Gemini, Claude" icon={<Sparkles size={22} />} />
          </div>

          <section className={styles.chartCard}>
            <div className={styles.chartHead}>
              <h2>Ziyarətçilər və səhifə baxışları</h2>
              <div className={styles.chartLegend}>
                <span>
                  <span className={styles.dot} style={{ background: "#b8903a" }} />
                  Ziyarətçilər
                </span>
                <span>
                  <span className={styles.dot} style={{ background: "#1b1b1d" }} />
                  Səhifə baxışları
                </span>
              </div>
            </div>
            <TrendChart points={d.daily} />
          </section>

          <div className={styles.statGrid}>
            <TopList title="Ən çox baxılan səhifələr" unit="Baxış" items={d.pages} />
            <TopList title="Trafik mənbələri" unit="Sessiya" items={d.sources} />
            <TopList title="Ölkələr" unit="Sessiya" items={d.countries} />
            <TopList title="Cihaz" unit="Sessiya" items={d.devices} />
            <TopList title="Brauzer" unit="Sessiya" items={d.browsers} />
          </div>
          <div className={styles.infoStrip}>
            <span className={styles.muted}>
              Dövr: {fmtDay(d.from)} – {fmtDay(d.to)}. Məlumat Google Analytics-dən gəlir, bir neçə saat gecikə bilər və 15 dəqiqə keşlənir (yenilənmə: {fmtDate(d.generatedAt)}). Cookie razılığı verməyən ziyarətçilər ölçülmür. Müraciət sayı isə panelin öz bazasından gəlir və dəqiqdir.
            </span>
          </div>
        </>
      )}
    </>
  );
}
