"use client";

import type { FieldDef } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { GalleryField, ImageField } from "./ImageFields";
import { Pill, Toggle } from "./ui";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export type Lang = "az" | "en" | "ru";
export const LANGS: Lang[] = ["az", "en", "ru"];
type Data = Record<string, unknown>;

const asObj = (v: unknown): Record<string, string> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : {});
const asStr = (v: unknown) => (typeof v === "string" ? v : "");

/** Dil sekmeleri: formada hər tərcümə olunan sahə seçilmiş dildə göstərilir.
 *  `gaps` verilərsə hər dilin yanında çatışan tərcümə sahələrinin sayı (və ya ✓) göstərilir */
export function LangTabs({ lang, onChange, gaps }: { lang: Lang; onChange: (l: Lang) => void; gaps?: Partial<Record<Lang, number>> }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Dil">
      {LANGS.map((l) => (
        <button key={l} type="button" role="tab" aria-selected={lang === l} className={styles.tab} onClick={() => onChange(l)}>
          {l.toUpperCase()}
          {gaps && l !== "az" && gaps[l] !== undefined && (
            <span style={{ marginLeft: 8 }}>
              <Pill tone={gaps[l] === 0 ? "ok" : "bad"} small title={gaps[l] === 0 ? "Tərcümə tamdır" : `${gaps[l]} sahənin tərcüməsi çatışmır`}>
                {gaps[l] === 0 ? "✓" : gaps[l]}
              </Pill>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Sahələrin təsvirinə görə formanı özü qurur: backend-də tip bir dəfə təyin olunur, forma və yoxlama ondan yaranır */
export function SchemaForm({ fields, value, onChange, lang, site, idPrefix = "f" }: { fields: FieldDef[]; value: Data; onChange: (v: Data) => void; lang: Lang; site?: string; idPrefix?: string }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <div className={styles.form} style={{ gap: 20 }}>
      {fields.map((f) => (
        <FieldInput key={f.name} def={f} id={`${idPrefix}-${f.name}`} value={value[f.name]} onChange={(v) => set(f.name, v)} lang={lang} site={site} />
      ))}
    </div>
  );
}

function FieldInput({ def, id, value, onChange, lang, site }: { def: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void; lang: Lang; site?: string }) {
  const req = def.required ? <span className={styles.req}>*</span> : null;

  if (def.kind === "BOOL") {
    return (
      <div className={styles.fieldRow}>
        <label htmlFor={id}>{def.label}</label>
        <div className={styles.toggleRow}>
          <Toggle id={id} checked={!!value} onChange={onChange} />
        </div>
      </div>
    );
  }
  if (def.kind === "IMAGE")
    return (
      <div className={styles.fieldRow}>
        <span className={styles.label}>
          {def.label}
          {req}
        </span>
        <ImageField folder="misc" site={site} value={asStr(value)} onChange={onChange} crop="free" contain={false} />
      </div>
    );
  if (def.kind === "GALLERY")
    return (
      <div className={styles.fieldRow}>
        <span className={styles.label}>{def.label}</span>
        <GalleryField folder="misc" site={site} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
      </div>
    );
  if (def.kind === "LIST") return <ListInput def={def} id={id} value={Array.isArray(value) ? (value as Data[]) : []} onChange={onChange} lang={lang} site={site} />;

  if (def.kind === "SELECT") {
    return (
      <div className={styles.fieldRow}>
        <label htmlFor={id}>
          {def.label}
          {req}
        </label>
        <select id={id} className={styles.select} style={{ width: "100%" }} value={asStr(value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seçin</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const area = def.kind === "TEXTAREA";
  const current = def.translatable ? (asObj(value)[lang] ?? "") : asStr(value);
  const write = (text: string) => onChange(def.translatable ? { ...asObj(value), [lang]: text } : text);
  const common = { id, className: styles.input, maxLength: def.max ?? undefined, value: current, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => write(e.target.value) };
  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id}>
        {def.label}
        {def.translatable ? ` (${lang.toUpperCase()})` : ""}
        {def.required && (!def.translatable || lang === "az") ? req : null}
      </label>
      {area ? <textarea {...common} rows={6} /> : <input {...common} type={def.kind === "NUMBER" ? "number" : "text"} />}
      {def.hint && <span className={styles.hint}>{def.hint}</span>}
    </div>
  );
}

function ListInput({ def, id, value, onChange, lang, site }: { def: FieldDef; id: string; value: Data[]; onChange: (v: unknown) => void; lang: Lang; site?: string }) {
  const sub = def.itemFields ?? [];
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className={styles.field}>
      <span className={styles.label}>{def.label}</span>
      {value.map((item, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 16, display: "grid", gap: 14, background: "#fcfbf9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{i + 1}-ci element</strong>
            <div className={styles.row} style={{ gap: 6 }}>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm}`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yuxarı">
                <ArrowUp size={16} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm}`} onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Aşağı">
                <ArrowDown size={16} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm} ${styles.iconBtnDanger}`} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Sil">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <SchemaForm fields={sub} value={item} lang={lang} site={site} idPrefix={`${id}-${i}`} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} />
        </div>
      ))}
      {(def.max == null || value.length < def.max) && (
        <div>
          <button type="button" className={`${styles.btn} ${styles.btnOutlineGold}`} onClick={() => onChange([...value, {}])}>
            <Plus size={18} /> Əlavə et
          </button>
        </div>
      )}
    </div>
  );
}
