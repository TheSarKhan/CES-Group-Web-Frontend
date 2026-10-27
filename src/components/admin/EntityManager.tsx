"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { GalleryField, ImageField } from "./ImageFields";
import { Modal } from "./Modal";

export type Row = Record<string, unknown>;
type Lang = "az" | "ru" | "en";
const LANGS: Lang[] = ["az", "ru", "en"];

export type TrField = { name: string; label: string; kind?: "text" | "textarea"; max?: number; required?: boolean; rows?: number };
type Option = { value: string; label: string };
export type Deps = Record<string, Row[]>;

export type Field =
  | { kind: "text" | "textarea" | "url" | "number"; name: string; label: string; max?: number; required?: boolean; hint?: string; rows?: number; placeholder?: string }
  | { kind: "bool"; name: string; label: string }
  | { kind: "image"; name: string; label: string; folder: string; required?: boolean }
  | { kind: "gallery"; name: string; label: string; folder: string }
  | { kind: "select"; name: string; label: string; required?: boolean; options: (deps: Deps) => Option[] };

export type EntityConfig = {
  id: string;
  title: string;
  sub: string;
  /** İcazə modulu (FAQ, PAGES, PROJECTS, FLEET) */
  module: string;
  /** Backend yolu, məs. admin/faqs */
  path: string;
  key: "id" | "slug";
  newLabel: string;
  columns: { head: string; cell: (row: Row) => ReactNode }[];
  fields: Field[];
  tr?: TrField[];
  /** Redaktə üçün əvvəl tam məlumat yüklənir (parametrlər və s.) */
  detail?: boolean;
  specs?: boolean;
  /** Seçim siyahıları üçün əvvəlcədən yüklənən yollar: ad → backend yolu */
  deps?: Record<string, string>;
  /** Serverdən gələn sətirdən forma dəyərlərini çıxarır (default: sətrin eyni adlı sahəsi) */
  fromRow?: (row: Row) => Record<string, unknown>;
  confirmName: (row: Row) => string;
  searchText?: (row: Row) => string;
};

type Spec = { key: Record<string, string>; value: Record<string, string> };
type TrState = Record<Lang, Record<string, string>>;

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const rowTr = (row: Row | null, lang: Lang, name: string) => {
  const t = (row?.translations as Record<string, Record<string, string>> | undefined)?.[lang];
  return t?.[name] ?? "";
};

export const azText = (row: Row, name: string) => rowTr(row, "az", name);

export function EntityManager({ cfg, site }: { cfg: EntityConfig; site: string }) {
  const { can } = useAdmin();
  const list = useApi<Row[]>(cfg.path);
  const deps = useDeps(cfg.deps);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [filter, setFilter] = useState("");

  const canCreate = can(cfg.module, "CREATE", site);
  const canEdit = can(cfg.module, "UPDATE", site);
  const canDelete = can(cfg.module, "DELETE", site);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const all = list.data ?? [];
    if (!q) return all;
    return all.filter((r) => (cfg.searchText ? cfg.searchText(r) : JSON.stringify(r)).toLowerCase().includes(q));
  }, [list.data, filter, cfg]);

  async function remove(row: Row) {
    if (!confirm(`"${cfg.confirmName(row)}" silinsin? Zibil qutusundan bərpa etmək olar.`)) return;
    try {
      await api(`${cfg.path}/${row[cfg.key]}`, { method: "DELETE" });
      list.reload();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Silinmədi.");
    }
  }

  if (list.error) return <p className={styles.error}>{list.error}</p>;
  if (!list.data || !deps.ready) return <p className={styles.loading}>Yüklənir…</p>;

  const nextSort = Math.max(0, ...list.data.map((r) => Number(r.sortOrder ?? 0))) + 1;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600 }}>{cfg.title}</h2>
          <p className={styles.sub} style={{ marginBottom: 0 }}>
            {cfg.sub}
          </p>
        </div>
        {canCreate && (
          <button className={`${styles.btn} ${styles.btnGold}`} onClick={() => setEditing("new")}>
            {cfg.newLabel}
          </button>
        )}
      </div>
      {list.data.length > 8 && (
        <div className={styles.filters}>
          <input className={styles.input} placeholder="Axtar" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Axtar" />
        </div>
      )}
      <div className={`${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              {cfg.columns.map((c) => (
                <th key={c.head}>{c.head}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={cfg.columns.length + 1} className={styles.muted}>
                  Heç nə tapılmadı.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={String(r[cfg.key])}>
                {cfg.columns.map((c) => (
                  <td key={c.head}>{c.cell(r)}</td>
                ))}
                <td style={{ whiteSpace: "nowrap" }}>
                  <div className={styles.row} style={{ flexWrap: "nowrap" }}>
                    {canEdit && (
                      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setEditing(r)}>
                        Redaktə
                      </button>
                    )}
                    {canDelete && (
                      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => remove(r)}>
                        Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <EntityDialog
          cfg={cfg}
          deps={deps.data}
          row={editing === "new" ? null : editing}
          nextSort={nextSort}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.reload();
          }}
        />
      )}
    </>
  );
}

/** Seçim siyahıları üçün lazım olan digər siyahıları yükləyir */
function useDeps(paths?: Record<string, string>) {
  const entries = Object.entries(paths ?? {});
  const a = useApi<Row[]>(entries[0]?.[1] ?? null);
  const b = useApi<Row[]>(entries[1]?.[1] ?? null);
  if (entries.length === 0) return { ready: true, data: {} as Deps };
  const data: Deps = {};
  if (entries[0]) data[entries[0][0]] = a.data ?? [];
  if (entries[1]) data[entries[1][0]] = b.data ?? [];
  const ready = (!entries[0] || !!a.data) && (!entries[1] || !!b.data);
  return { ready, data };
}

function EntityDialog({ cfg, deps, row, nextSort, onClose, onSaved }: { cfg: EntityConfig; deps: Deps; row: Row | null; nextSort: number; onClose: () => void; onSaved: () => void }) {
  const detail = useApi<Row>(row && cfg.detail ? `${cfg.path}/${row[cfg.key]}` : null);
  const loading = !!row && !!cfg.detail && !detail.data && !detail.error;
  return (
    <Modal title={row ? "Redaktə" : cfg.newLabel.replace(/^\+\s*/, "")} onClose={onClose}>
      {detail.error ? (
        <p className={styles.error}>{detail.error}</p>
      ) : loading ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <EntityForm cfg={cfg} deps={deps} existing={row} source={detail.data ?? row} nextSort={nextSort} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

function EntityForm({ cfg, deps, existing, source, nextSort, onClose, onSaved }: { cfg: EntityConfig; deps: Deps; existing: Row | null; source: Row | null; nextSort: number; onClose: () => void; onSaved: () => void }) {
  const fromRow = source && cfg.fromRow ? cfg.fromRow(source) : {};
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of cfg.fields) {
      const raw = source ? (f.name in fromRow ? fromRow[f.name] : source[f.name]) : undefined;
      if (f.kind === "bool") v[f.name] = raw === undefined ? true : !!raw;
      else if (f.kind === "gallery") v[f.name] = Array.isArray(raw) ? raw : [];
      else if (f.kind === "number") v[f.name] = raw === undefined ? (f.name === "sortOrder" ? nextSort : 0) : Number(raw);
      else v[f.name] = str(raw);
    }
    return v;
  });
  const [tr, setTr] = useState<TrState>(() => {
    const out = {} as TrState;
    for (const l of LANGS) {
      out[l] = {};
      for (const f of cfg.tr ?? []) out[l][f.name] = rowTr(source, l, f.name);
    }
    return out;
  });
  const [specs, setSpecs] = useState<Spec[]>(() => ((source?.specs as Spec[] | undefined) ?? []).map((s) => ({ key: { ...s.key }, value: { ...s.value } })));
  const [lang, setLang] = useState<Lang>("az");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (name: string, v: unknown) => setValues((p) => ({ ...p, [name]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload: Record<string, unknown> = {};
    for (const f of cfg.fields) {
      const v = values[f.name];
      if (f.kind === "number") payload[f.name] = Number(v) || 0;
      else if (f.kind === "bool" || f.kind === "gallery") payload[f.name] = v;
      else {
        const t = str(v).trim();
        if ("required" in f && f.required && !t) return setError(`"${f.label}" boş ola bilməz.`);
        payload[f.name] = t === "" ? null : t;
      }
    }
    if (cfg.tr) {
      const translations: Record<string, Record<string, string>> = {};
      const required = cfg.tr.filter((f) => f.required);
      for (const l of LANGS) {
        const filled = required.every((f) => tr[l][f.name]?.trim());
        // AZ məcburidir; RU və EN yalnız tam doldurulubsa göndərilir
        if (l === "az" && !filled) return setError("AZ dilində məcburi sahələri doldurun.");
        if (!filled) continue;
        translations[l] = Object.fromEntries(cfg.tr.map((f) => [f.name, (tr[l][f.name] ?? "").trim()]));
      }
      payload.translations = translations;
    }
    if (cfg.specs) {
      payload.specs = specs
        .map((s) => ({ key: clean(s.key), value: clean(s.value) }))
        .filter((s) => Object.keys(s.key).length > 0);
    }
    setBusy(true);
    try {
      await api(existing ? `${cfg.path}/${existing[cfg.key]}` : cfg.path, { method: existing ? "PUT" : "POST", body: payload });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      {cfg.fields.map((f) => {
        switch (f.kind) {
          case "bool":
            return (
              <label key={f.name} className={styles.check}>
                <input type="checkbox" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                <span>{f.label}</span>
              </label>
            );
          case "image":
            return <ImageField key={f.name} label={f.label} folder={f.folder} value={str(values[f.name])} onChange={(v) => set(f.name, v)} />;
          case "gallery":
            return <GalleryField key={f.name} label={f.label} folder={f.folder} value={(values[f.name] as string[]) ?? []} onChange={(v) => set(f.name, v)} />;
          case "select":
            return (
              <div key={f.name} className={styles.field}>
                <label htmlFor={`f-${f.name}`}>{f.label}</label>
                <select id={`f-${f.name}`} className={styles.input} value={str(values[f.name])} onChange={(e) => set(f.name, e.target.value)} required={f.required}>
                  <option value="">Seçin</option>
                  {f.options(deps).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          default:
            return (
              <div key={f.name} className={styles.field}>
                <label htmlFor={`f-${f.name}`}>{f.label}</label>
                {f.kind === "textarea" ? (
                  <textarea id={`f-${f.name}`} className={styles.input} rows={f.rows ?? 4} maxLength={f.max} value={str(values[f.name])} onChange={(e) => set(f.name, e.target.value)} />
                ) : (
                  <input id={`f-${f.name}`} className={styles.input} type={f.kind === "number" ? "number" : "text"} maxLength={f.max} placeholder={f.placeholder} value={str(values[f.name])} onChange={(e) => set(f.name, e.target.value)} />
                )}
                {f.hint && <span className={styles.hint}>{f.hint}</span>}
              </div>
            );
        }
      })}

      {(cfg.tr || cfg.specs) && (
        <div className={styles.tabs} role="tablist" aria-label="Dil">
          {LANGS.map((l) => (
            <button key={l} type="button" role="tab" aria-selected={lang === l} className={styles.tab} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      {cfg.tr &&
        cfg.tr.map((f) => (
          <div key={f.name} className={styles.field}>
            <label htmlFor={`t-${f.name}`}>
              {f.label} ({lang.toUpperCase()}){f.required && lang === "az" ? " *" : ""}
            </label>
            {f.kind === "textarea" ? (
              <textarea id={`t-${f.name}`} className={styles.input} rows={f.rows ?? 4} maxLength={f.max} value={tr[lang][f.name] ?? ""} onChange={(e) => setTr((p) => ({ ...p, [lang]: { ...p[lang], [f.name]: e.target.value } }))} />
            ) : (
              <input id={`t-${f.name}`} className={styles.input} maxLength={f.max} value={tr[lang][f.name] ?? ""} onChange={(e) => setTr((p) => ({ ...p, [lang]: { ...p[lang], [f.name]: e.target.value } }))} />
            )}
          </div>
        ))}
      {cfg.tr && <span className={styles.hint}>RU və EN boş qala bilər, bu halda həmin dil üçün məzmun göstərilməyəcək. Məcburi sahələri tam doldurmasanız, dil saxlanmır.</span>}

      {cfg.specs && <SpecsEditor lang={lang} value={specs} onChange={setSpecs} />}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.modalFoot}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
          Ləğv et
        </button>
        <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
          {busy ? "Saxlanılır…" : "Yadda saxla"}
        </button>
      </div>
    </form>
  );
}

const clean = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()]));

/** Texnikanın parametr cədvəli: açar → dəyər cütləri, sıra saxlanılır */
function SpecsEditor({ lang, value, onChange }: { lang: Lang; value: Spec[]; onChange: (v: Spec[]) => void }) {
  const update = (i: number, side: "key" | "value", text: string) =>
    onChange(value.map((s, k) => (k === i ? { ...s, [side]: { ...s[side], [lang]: text } } : s)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className={styles.field}>
      <span className={styles.label}>Parametrlər ({lang.toUpperCase()})</span>
      <span className={styles.hint}>Açar (məs. “Maks. yük”) və dəyər (məs. “40 t”). Dil sekmesini dəyişib digər dillərə də yazın. Açarı boş olan sətir saxlanmır.</span>
      {value.map((s, i) => (
        <div key={i} className={styles.row} style={{ flexWrap: "nowrap", alignItems: "center" }}>
          <input className={styles.input} style={{ flex: 1 }} placeholder="Açar" value={s.key[lang] ?? ""} onChange={(e) => update(i, "key", e.target.value)} aria-label={`Açar ${i + 1}`} />
          <input className={styles.input} style={{ flex: 1 }} placeholder="Dəyər" value={s.value[lang] ?? ""} onChange={(e) => update(i, "value", e.target.value)} aria-label={`Dəyər ${i + 1}`} />
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, -1)} aria-label="Yuxarı">
            ↑
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => move(i, 1)} aria-label="Aşağı">
            ↓
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Sil">
            ×
          </button>
        </div>
      ))}
      <div>
        <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => onChange([...value, { key: {}, value: {} }])}>
          Sətir əlavə et
        </button>
      </div>
    </div>
  );
}
