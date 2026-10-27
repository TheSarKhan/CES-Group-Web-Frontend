"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Clock, FileText, Inbox, Info, MessageSquare, RefreshCw, Users } from "lucide-react";
import { fmtDate, useApi } from "@/lib/admin/client";
import type { StatsOverview } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { siteIcon } from "./Sidebar";
import { Kpi, RangePicker, nf, rangeQuery, type Range } from "./StatsParts";
import { Notice, PageHeader, Pill, useCrumbs } from "./ui";
import { useAdmin } from "./AdminApp";

const pct = (n: number) => `${n.toFixed(2).replace(".", ",")}%`;

/** Saytların yan-yana müqayisəsi: yalnız baxmaq icazəsi olan saytlar göstərilir */
export function StatsOverviewPage() {
  const { me } = useAdmin();
  const [days, setDays] = useState(30);
  const [range, setRange] = useState<Range>(null);
  const data = useApi<StatsOverview>(`panel/stats/overview?${rangeQuery(days, range)}`);
  // Hələ cavablandırılmamış (yeni) müraciətlər: yan menyudakı sayğacla eyni mənbə
  const summary = useApi<Record<string, number>>("panel/summary").data;
  const pending = summary ?? {};
  const newTotal = Object.values(pending).reduce((n, v) => n + v, 0);
  useCrumbs([{ label: "Bütün saytlar" }, { label: "Ümumi icmal" }]);
  const sum = (pick: (s: StatsOverview["sites"][number]) => number) => (data.data ? data.data.sites.reduce((n, s) => n + pick(s), 0) : 0);

  return (
    <>
      <PageHeader
        title="Ümumi icmal"
        sub={`${data.data?.sites.length ?? me.sites.length} saytın statistikası və müraciətləri bir yerdə.`}
        actions={<RangePicker days={days} range={range} onDays={setDays} onRange={setRange} />}
      />
      {data.error ? (
        <Notice tone="bad">{data.error}</Notice>
      ) : !data.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <>
          <div className={styles.kpis}>
            <Kpi label="Ziyarətçi" value={nf(sum((s) => s.users))} note={`${data.data.sites.length} sayt üzrə`} icon={<Users size={22} />} />
            <Kpi label="Səhifə baxışı" value={nf(sum((s) => s.pageViews))} note={`Son ${days} gün`} icon={<FileText size={22} />} />
            <Kpi label="Sessiya" value={nf(sum((s) => s.sessions))} note={`Son ${days} gün`} icon={<Clock size={22} />} />
            <Kpi label="Müraciət" value={nf(sum((s) => s.leads))} note={newTotal ? <Pill tone="gold">{newTotal} cavabsız</Pill> : `Son ${days} gün`} icon={<MessageSquare size={22} />} />
          </div>

          {newTotal > 0 && (
            <div style={{ marginBottom: 20 }}>
              <Notice icon={<Inbox size={26} />} title={`${newTotal} müraciət cavab gözləyir`}>
                Müraciət sayına klikləyərək sayt üzrə açın.
              </Notice>
            </div>
          )}

          <section className={styles.panel}>
            <div className={styles.panelPad} style={{ paddingBottom: 8 }}>
              <div className={styles.panelHead} style={{ marginBottom: 6 }}>
                <div>
                  <h2>Saytlar üzrə nəticələr</h2>
                  <p className={styles.panelSub}>Ətraflı statistika üçün saytın adına klikləyin.</p>
                </div>
                <span className={styles.muted}>{data.data.sites.length} sayt</span>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sayt</th>
                    <th style={{ textAlign: "right" }}>Ziyarətçi</th>
                    <th style={{ textAlign: "right" }}>Baxış</th>
                    <th style={{ textAlign: "right" }}>Sessiya</th>
                    <th style={{ textAlign: "right" }}>Müraciət</th>
                    <th style={{ textAlign: "right" }}>Konversiya</th>
                    <th style={{ textAlign: "center" }}>Cavabsız</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.data.sites.map((s) => {
                    const meta = me.sites.find((x) => x.code === s.code);
                    return (
                      <tr key={s.code}>
                        <td>
                          <Link href={`/sites/${s.code}/stats`} className={styles.cellFlex}>
                            <span className={styles.iconTile}>{siteIcon(s.code, 22)}</span>
                            <span>
                              <span className={styles.cellMain}>{s.name}</span>
                              <span className={styles.cellSub}>{meta?.domain}</span>
                            </span>
                          </Link>
                        </td>
                        <td style={{ textAlign: "right" }}>{nf(s.users)}</td>
                        <td style={{ textAlign: "right" }}>{nf(s.pageViews)}</td>
                        <td style={{ textAlign: "right" }}>{nf(s.sessions)}</td>
                        <td style={{ textAlign: "right" }}>{nf(s.leads)}</td>
                        <td style={{ textAlign: "right" }}>{pct(s.conversionRate)}</td>
                        <td style={{ textAlign: "center" }}>
                          <Link href={`/sites/${s.code}/submissions`}>
                            <Pill tone={pending[s.code] ? "gold" : "muted"}>{pending[s.code] ?? 0}</Pill>
                          </Link>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link href={`/sites/${s.code}/stats`} aria-label={`${s.name} statistikası`} className={styles.muted}>
                            <ChevronRight size={20} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFoot}>
              <span className={styles.footHint}>
                <RefreshCw size={16} /> Yenilənmə: {fmtDate(data.data.generatedAt)}
              </span>
              <span>Mənbə: Google Analytics 4</span>
            </div>
          </section>
          <p className={styles.footHint} style={{ marginTop: 16, color: "var(--muted-2)", fontSize: 14 }}>
            <Info size={16} /> Cookie razılığı verməyən ziyarətçilər ölçülmür. Müraciət sayı panelin bazasından gəlir.
          </p>
        </>
      )}
    </>
  );
}
