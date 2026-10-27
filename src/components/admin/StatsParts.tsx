"use client";

import { fmtDay } from "@/lib/admin/client";
import type { StatItem } from "@/lib/admin/types";
import styles from "./admin.module.css";

export const nf = (n: number) => new Intl.NumberFormat("az-AZ").format(n);

export function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      {note && <div className={styles.kpiNote}>{note}</div>}
    </div>
  );
}

/** Ən böyük dəyərə nisbətən çubuq göstərən sadə sıralama cədvəli */
export function TopList({ title, items, emptyText = "Məlumat yoxdur." }: { title: string; items: StatItem[]; emptyText?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <section className={styles.statCard}>
      <h2>{title}</h2>
      {items.length === 0 && <p className={styles.muted}>{emptyText}</p>}
      {items.map((i) => (
        <div key={i.name} className={styles.barRow}>
          <span className={styles.barName} title={i.name}>
            {i.name}
          </span>
          <span className={styles.barVal}>{nf(i.value)}</span>
          <span className={styles.bar}>
            <span style={{ width: `${(i.value / max) * 100}%` }} />
          </span>
        </div>
      ))}
    </section>
  );
}

/** İki xətli (ziyarətçi və baxış) SVG qrafik. Kitabxana lazım deyil. */
export function TrendChart({ points }: { points: { date: string; users: number; pageViews: number }[] }) {
  const W = 760;
  const H = 220;
  const pad = { l: 44, r: 12, t: 10, b: 26 };
  if (points.length === 0) return <p className={styles.muted}>Bu dövr üçün məlumat yoxdur.</p>;

  const max = Math.max(1, ...points.map((p) => Math.max(p.users, p.pageViews)));
  const x = (i: number) => pad.l + (points.length === 1 ? 0 : (i * (W - pad.l - pad.r)) / (points.length - 1));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (pick: (p: (typeof points)[number]) => number) => points.map((p, i) => `${x(i).toFixed(1)},${y(pick(p)).toFixed(1)}`).join(" ");
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  const first = fmtDay(points[0].date);
  const last = fmtDay(points[points.length - 1].date);
  const label = `Ziyarətçi və baxış qrafiki, ${first} ilə ${last} arası. Ən yüksək dəyər ${nf(max)}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: "block", maxWidth: "100%" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-2)">
            {nf(t)}
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="var(--gold)" strokeWidth="2.5" points={line((p) => p.pageViews)} />
      <polyline fill="none" stroke="var(--ink)" strokeWidth="2.5" points={line((p) => p.users)} />
      <text x={pad.l} y={H - 6} fontSize="11" fill="var(--muted-2)">
        {first}
      </text>
      <text x={W - pad.r} y={H - 6} textAnchor="end" fontSize="11" fill="var(--muted-2)">
        {last}
      </text>
    </svg>
  );
}

export function DaysSelect({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  return (
    <select className={styles.input} style={{ width: "auto" }} value={days} onChange={(e) => onChange(Number(e.target.value))} aria-label="Dövr">
      <option value={7}>Son 7 gün</option>
      <option value={30}>Son 30 gün</option>
      <option value={90}>Son 90 gün</option>
    </select>
  );
}
