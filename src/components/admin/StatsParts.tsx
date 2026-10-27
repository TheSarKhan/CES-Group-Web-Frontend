"use client";

import { useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { fmtDay } from "@/lib/admin/client";
import type { StatItem } from "@/lib/admin/types";
import styles from "./admin.module.css";

export const nf = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ");

export function Kpi({ label, value, note, icon }: { label: string; value: string; note?: ReactNode; icon?: ReactNode }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
      {note && <div className={styles.kpiNote}>{note}</div>}
      {icon && <span className={styles.kpiIcon}>{icon}</span>}
    </div>
  );
}

/** Ən böyük dəyərə nisbətən çubuq göstərən sıralama; ilk 5 göstərilir, "Hamısını göstər" bütün siyahını açır */
export function TopList({ title, unit, items, emptyText = "Məlumat yoxdur." }: { title: string; unit: string; items: StatItem[]; emptyText?: string }) {
  const [all, setAll] = useState(false);
  const max = Math.max(1, ...items.map((i) => i.value));
  const shown = all ? items : items.slice(0, 5);
  return (
    <section className={styles.statCard}>
      <h2>
        {title}
        <span>{unit}</span>
      </h2>
      {items.length === 0 && <p className={styles.muted}>{emptyText}</p>}
      {shown.map((i) => (
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
      {items.length > 5 && (
        <div className={styles.statMore}>
          <button type="button" onClick={() => setAll((v) => !v)}>
            {all ? "Daha az göstər" : "Hamısını göstər"}
          </button>
        </div>
      )}
    </section>
  );
}

/** İki xətli (ziyarətçi və baxış) SVG qrafik: şəbəkə xətləri, nöqtələr və tarix işarələri. Kitabxana lazım deyil. */
export function TrendChart({ points }: { points: { date: string; users: number; pageViews: number }[] }) {
  const W = 1000;
  const H = 280;
  const pad = { l: 52, r: 16, t: 14, b: 32 };
  if (points.length === 0) return <p className={styles.muted}>Bu dövr üçün məlumat yoxdur.</p>;

  const rawMax = Math.max(1, ...points.map((p) => Math.max(p.users, p.pageViews)));
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / step) * step;
  const x = (i: number) => pad.l + (points.length === 1 ? 0 : (i * (W - pad.l - pad.r)) / (points.length - 1));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (pick: (p: (typeof points)[number]) => number) => points.map((p, i) => `${x(i).toFixed(1)},${y(pick(p)).toFixed(1)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const every = Math.max(1, Math.ceil(points.length / 12));
  const label = `Ziyarətçi və baxış qrafiki, ${fmtDay(points[0].date)} ilə ${fmtDay(points[points.length - 1].date)} arası. Ən yüksək dəyər ${nf(rawMax)}.`;
  const short = (d: string) => fmtDay(d).slice(0, 5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} style={{ display: "block", maxWidth: "100%" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#ebe9e3" />
          <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#7a7872">
            {nf(t)}
          </text>
        </g>
      ))}
      <polyline fill="none" stroke="#1b1b1d" strokeWidth="2.4" strokeLinejoin="round" points={line((p) => p.pageViews)} />
      <polyline fill="none" stroke="#b8903a" strokeWidth="2.4" strokeLinejoin="round" points={line((p) => p.users)} />
      {points.length <= 45 &&
        points.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.pageViews)} r="2.8" fill="#1b1b1d" />
            <circle cx={x(i)} cy={y(p.users)} r="2.8" fill="#b8903a" />
          </g>
        ))}
      {points.map((p, i) =>
        i % every === 0 ? (
          <text key={p.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#7a7872">
            {short(p.date)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export const DAY_OPTIONS = [7, 30, 90];
export type Range = { from: string; to: string } | null;

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Dövr seçimi: 7 / 30 / 90 gün düymələri və xüsusi tarix aralığı (dd.mm.yyyy – dd.mm.yyyy, ən çox 365 gün) */
export function RangePicker({ days, range, onDays, onRange }: { days: number; range: Range; onDays: (d: number) => void; onRange: (r: Range) => void }) {
  const [open, setOpen] = useState(false);
  const [now] = useState(() => Date.now());
  const today = iso(new Date(now));
  const [from, setFrom] = useState(range?.from ?? iso(new Date(now - 29 * 86400000)));
  const [to, setTo] = useState(range?.to ?? today);
  const label = range ? `${fmtDay(range.from)} – ${fmtDay(range.to)}` : `${fmtDay(iso(new Date(now - (days - 1) * 86400000)))} – ${fmtDay(today)}`;
  const valid = !!from && !!to && from <= to && to <= today && (new Date(to).getTime() - new Date(from).getTime()) / 86400000 < 365;
  return (
    <>
      <div className={styles.segmented} role="group" aria-label="Dövr">
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={!range && days === d}
            onClick={() => {
              onRange(null);
              onDays(d);
            }}
          >
            {d} gün
          </button>
        ))}
      </div>
      <div className={styles.menuWrap}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <CalendarDays size={18} />
          {label}
        </button>
        {open && (
          <div className={styles.popover} style={{ bottom: "auto", top: "calc(100% + 8px)", width: 320 }} role="dialog" aria-label="Tarix aralığı">
            <strong>Tarix aralığı</strong>
            <div className={styles.fieldGrid2} style={{ gap: 10 }}>
              <label className={styles.field}>
                <span className={styles.hint}>Başlanğıc</span>
                <input type="date" className={styles.input} value={from} max={today} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className={styles.field}>
                <span className={styles.hint}>Son</span>
                <input type="date" className={styles.input} value={to} max={today} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
            {!valid && <span className={styles.error}>Aralıq düzgün deyil (ən çox 365 gün, gələcək tarix olmaz).</span>}
            <div className={styles.row}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setOpen(false)}>
                Bağla
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGold} ${styles.btnSm}`}
                disabled={!valid}
                onClick={() => {
                  onRange({ from, to });
                  setOpen(false);
                }}
              >
                Tətbiq et
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Aralıq seçilibsə sorğu parametrləri, yoxsa gün sayı */
export const rangeQuery = (days: number, range: Range) => (range ? `days=${days}&from=${range.from}&to=${range.to}` : `days=${days}`);
