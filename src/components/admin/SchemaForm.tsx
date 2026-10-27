"use client";

import type { FieldDef } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { GalleryField, ImageField } from "./ImageFields";

export type Lang = "az" | "en" | "ru";
export const LANGS: Lang[] = ["az", "en", "ru"];
type Data = Record<string, unknown>;

const asObj = (v: unknown): Record<string, string> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : {});
const asStr = (v: unknown) => (typeof v === "string" ? v : "");

/** Dil sekmeleri: formada hər tərcümə olunan sahə seçilmiş dildə göstərilir */
export function LangTabs({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Dil">
      {LANGS.map((l) => (
        <button key={l} type="button" role="tab" aria-selected={lang === l} className={styles.tab} onClick={() => onChange(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Sahələrin təsvirinə görə formanı özü qurur: backend-də tip bir dəfə təyin olunur, forma və yoxlama ondan yaranır */
export function SchemaForm({ fields, value, onChange, lang, site, idPrefix = "f" }: { fields: FieldDef[]; value: Data; onChange: (v: Data) => void; lang: Lang; site?: string; idPrefix?: string }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <>
      {fields.map((f) => (
        <FieldInput key={f.name} def={f} id={`${idPrefix}-${f.name}`} value={value[f.name]} onChange={(v) => set(f.name, v)} lang={lang} site={site} />
      ))}
    </>
  );
}

function FieldInput({ def, id, value, onChange, lang, site }: { def: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void; lang: Lang; site?: string }) {
  const star = def.required ? " *" : "";

  if (def.kind === "BOOL") {
    return (
      <label className={styles.check}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        <span>{def.label}</span>
      </label>
    );
  }
  if (def.kind === "IMAGE") return <ImageField label={def.label + star} folder="misc" site={site} value={asStr(value)} onChange={onChange} crop="free" />;
  if (def.kind === "GALLERY") return <GalleryField label={def.label} folder="misc" site={site} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;
  if (def.kind === "LIST") return <ListInput def={def} id={id} value={Array.isArray(value) ? (value as Data[]) : []} onChange={onChange} lang={lang} site={site} />;

  if (def.kind === "SELECT") {
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{def.label + star}</label>
        <select id={id} className={styles.input} value={asStr(value)} onChange={(e) => onChange(e.target.value)}>
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
    <div className={styles.field}>
      <label htmlFor={id}>
        {def.label}
        {def.translatable ? ` (${lang.toUpperCase()})` : ""}
        {def.required && (!def.translatable || lang === "az") ? " *" : ""}
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
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 14, display: "grid", gap: 12 }}>
          <SchemaForm fields={sub} value={item} lang={lang} site={site} idPrefix={`${id}-${i}`} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} />
          <div className={styles.row}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, -1)} aria-label="Yuxarı">
              ↑
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, 1)} aria-label="Aşağı">
              ↓
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => onChange(value.filter((_, k) => k !== i))}>
              Sil
            </button>
          </div>
        </div>
      ))}
      {(def.max == null || value.length < def.max) && (
        <div>
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => onChange([...value, {}])}>
            + Əlavə et
          </button>
        </div>
      )}
    </div>
  );
}
