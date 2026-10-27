"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Info, LayoutGrid, List, MoreHorizontal, Search, X } from "lucide-react";
import styles from "./admin.module.css";

/* ---------- Çörək qırıntısı: səhifələr özünü bildirir, üst panel göstərir ---------- */
export type Crumb = { label: string; href?: string };
let crumbState: Crumb[] = [];
const crumbSubs = new Set<() => void>();
const setCrumbState = (c: Crumb[]) => {
  crumbState = c;
  crumbSubs.forEach((f) => f());
};
export const useCrumbList = () =>
  useSyncExternalStore(
    (cb) => {
      crumbSubs.add(cb);
      return () => crumbSubs.delete(cb);
    },
    () => crumbState,
    () => [],
  );
/** Səhifə öz çörək qırıntısını üst panelə verir */
export function useCrumbs(items: Crumb[]) {
  const key = JSON.stringify(items);
  useEffect(() => {
    setCrumbState(JSON.parse(key) as Crumb[]);
    return () => setCrumbState([]);
  }, [key]);
}

/* ---------- Kiçik elementlər ---------- */
export type Tone = "ok" | "bad" | "gold" | "info" | "violet" | "muted" | "";
const toneCls: Record<Tone, string> = { ok: styles.pillOk, bad: styles.pillBad, gold: styles.pillGold, info: styles.pillInfo, violet: styles.pillViolet, muted: styles.pillMuted, "": "" };
export function Pill({ tone = "", small, children, title }: { tone?: Tone; small?: boolean; children: ReactNode; title?: string }) {
  return (
    <span className={`${styles.pill} ${toneCls[tone]} ${small ? styles.pillSm : ""}`} title={title}>
      {children}
    </span>
  );
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

export function Avatar({ name, large, className = "" }: { name: string; large?: boolean; className?: string }) {
  return <span className={`${styles.avatar} ${large ? styles.avatarLg : ""} ${className}`}>{initials(name)}</span>;
}

export function Toggle({ checked, onChange, id, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; id?: string; disabled?: boolean; label?: string }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" id={id} checked={checked} disabled={disabled} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className={`${styles.search} ${styles.toolbarGrow}`}>
      <Search size={18} aria-hidden="true" />
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button type="button" className={styles.searchClear} aria-label="Təmizlə" onClick={() => onChange("")}>
          <X size={16} />
        </button>
      )}
    </label>
  );
}

export function ViewToggle({ value, onChange }: { value: "list" | "grid"; onChange: (v: "list" | "grid") => void }) {
  return (
    <div className={styles.viewToggle} role="group" aria-label="Görünüş">
      <button type="button" aria-pressed={value === "list"} aria-label="Siyahı" onClick={() => onChange("list")}>
        <List size={18} />
      </button>
      <button type="button" aria-pressed={value === "grid"} aria-label="Şəbəkə" onClick={() => onChange("grid")}>
        <LayoutGrid size={18} />
      </button>
    </div>
  );
}

export function Notice({ tone = "gold", title, children, icon }: { tone?: "gold" | "info" | "bad"; title?: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className={`${styles.noticeBox} ${tone === "info" ? styles.noticeInfo : tone === "bad" ? styles.noticeBad : ""}`} role={tone === "bad" ? "alert" : undefined}>
      {icon ?? <Info size={20} />}
      <div>
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  );
}

/* ---------- Səhifə başlığı ---------- */
export function PageHeader({
  title,
  sub,
  back,
  eyebrow,
  status,
  actions,
}: {
  title: ReactNode;
  sub?: ReactNode;
  back?: { href: string; label?: string };
  eyebrow?: string;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.pageHead}>
      <div className={styles.pageHeadMain}>
        {back && (
          <Link href={back.href} className={styles.backBtn} aria-label={back.label ?? "Geri"}>
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          {(eyebrow || back?.label) && <div className={styles.eyebrow}>{eyebrow ?? back?.label}</div>}
          <h1 className={styles.h1}>
            {title}
            {status}
          </h1>
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
}

/* ---------- "..." menyusu ---------- */
export type MenuItem = { label: string; icon?: ReactNode; onClick?: () => void; href?: string; danger?: boolean; hidden?: boolean };
export function RowMenu({ items, label = "Əməliyyatlar" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const shown = items.filter((i) => !i.hidden);
  if (shown.length === 0) return null;
  return (
    <div className={styles.menuWrap} ref={ref}>
      <button type="button" className={styles.iconBtn} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {shown.map((i) =>
            i.href ? (
              <Link key={i.label} href={i.href} role="menuitem" onClick={() => setOpen(false)}>
                {i.icon}
                {i.label}
              </Link>
            ) : (
              <button
                key={i.label}
                type="button"
                role="menuitem"
                className={i.danger ? styles.menuDanger : undefined}
                onClick={() => {
                  setOpen(false);
                  i.onClick?.();
                }}
              >
                {i.icon}
                {i.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Səhifələmə (müştəri tərəfində) ---------- */
export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i).filter((i) => i === 0 || i === pages - 1 || Math.abs(i - page) <= 1);
  return (
    <nav className={styles.pager} aria-label="Səhifələr">
      <button type="button" className={styles.pagerBtn} disabled={page === 0} aria-label="Əvvəlki" onClick={() => onChange(page - 1)}>
        <ChevronLeft size={18} />
      </button>
      {nums.map((n, i) => (
        <span key={n} style={{ display: "contents" }}>
          {i > 0 && n - nums[i - 1] > 1 && <span className={styles.muted}>…</span>}
          <button type="button" className={styles.pagerBtn} aria-current={n === page ? "page" : undefined} onClick={() => onChange(n)}>
            {n + 1}
          </button>
        </span>
      ))}
      <button type="button" className={styles.pagerBtn} disabled={page >= pages - 1} aria-label="Növbəti" onClick={() => onChange(page + 1)}>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

/** Birdəfəlik silmə kimi təhlükəli əməliyyatlar üçün düymənin üstündə açılan təsdiq */
export function ConfirmPopover({ title, text, confirmLabel, onConfirm, trigger }: { title: string; text: string; confirmLabel: string; onConfirm: () => void; trigger: (open: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  return (
    <div className={styles.menuWrap} ref={ref}>
      {trigger(() => setOpen(true))}
      {open && (
        <div className={styles.popover} role="alertdialog" aria-label={title}>
          <strong>{title}</strong>
          <p>{text}</p>
          <div className={styles.row}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setOpen(false)}>
              Ləğv et
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDangerSolid} ${styles.btnSm}`}
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
