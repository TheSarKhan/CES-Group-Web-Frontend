"use client";

/** Texnika (Equipment) saytının kataloq modulları üçün ortaq tiplər və köməkçilər. Siyahı: EntityList, redaktə: EntityEditor. */

import type { ReactNode } from "react";

export type Row = Record<string, unknown>;
export type Lang = "az" | "en" | "ru";
export const LANGS: Lang[] = ["az", "en", "ru"];

export type TrField = { name: string; label: string; kind?: "text" | "textarea"; max?: number; required?: boolean; rows?: number; hint?: string };
export type Option = { value: string; label: string };
export type Deps = Record<string, Row[]>;

export type Field =
  | { kind: "text" | "textarea" | "url" | "number"; name: string; label: string; max?: number; required?: boolean; hint?: string; rows?: number; placeholder?: string; card?: string }
  | { kind: "bool"; name: string; label: string; hint?: string }
  | { kind: "image"; name: string; label: string; folder: string; required?: boolean; crop?: number | "free"; hint?: string; cover?: boolean }
  | { kind: "gallery"; name: string; label: string; folder: string; hint?: string }
  | { kind: "select"; name: string; label: string; required?: boolean; options: (deps: Deps) => Option[]; card?: string };

export type EntityConfig = {
  id: string;
  /** Sekmə başlığı */
  tab: string;
  /** Redaktə səhifəsinin "…ə qayıt" yazısı */
  backLabel: string;
  /** Sağ-üst düymə: "Yeni texnika" */
  newLabel: string;
  /** Siyahı kartının üstündəki izah */
  sub: string;
  /** Redaktə səhifəsinin alt başlığı */
  editSub: string;
  /** Məzmun kartı başlığı (tərcümə yoxdursa) */
  formTitle?: string;
  /** İcazə modulu (FAQ, PAGES, PROJECTS, FLEET) */
  module: string;
  /** Backend yolu, məs. admin/faqs */
  path: string;
  key: "id" | "slug";
  name: (row: Row) => string;
  sub2?: (row: Row) => string;
  thumb?: (row: Row) => string;
  thumbKind?: "photo" | "logo" | "avatar";
  columns: { head: string; cell: (row: Row) => ReactNode; align?: "right" }[];
  /** Siyahıda kateqoriya kimi əlavə süzgəc */
  filter?: { all: string; options: (deps: Deps) => Option[]; match: (row: Row, value: string) => boolean };
  fields: Field[];
  tr?: TrField[];
  /** Redaktə üçün əvvəl tam məlumat yüklənir (parametrlər və s.) */
  detail?: boolean;
  specs?: boolean;
  /** Seçim siyahıları üçün əvvəlcədən yüklənən yollar: ad → backend yolu */
  deps?: Record<string, string>;
  /** Sürüklə-burax sıralama (PATCH {path}/reorder, yalnız slug açarlı kataloq və layihələr) */
  reorder?: boolean;
  /** Siyahıda "Saytda/Gizli" düyməsi (PATCH {path}/{slug}/publish) */
  publishToggle?: boolean;
  /** "Sıra" siyahıda birbaşa dəyişdirilir */
  inlineSort?: boolean;
  /** Şəbəkə görünüşü var */
  grid?: boolean;
  /** Serverdən gələn sətirdən forma dəyərlərini çıxarır (default: sətrin eyni adlı sahəsi) */
  fromRow?: (row: Row) => Record<string, unknown>;
  confirmName: (row: Row) => string;
  searchText?: (row: Row) => string;
};

export type Spec = { key: Record<string, string>; value: Record<string, string> };
export type TrState = Record<Lang, Record<string, string>>;

export const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
export const rowTr = (row: Row | null, lang: Lang, name: string) => {
  const t = (row?.translations as Record<string, Record<string, string>> | undefined)?.[lang];
  return t?.[name] ?? "";
};
export const azText = (row: Row, name: string) => rowTr(row, "az", name);
export const cleanMap = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()]));

/** Sətirdən forma dəyərləri */
export function valuesFromRow(cfg: EntityConfig, source: Row | null, nextSort: number): Record<string, unknown> {
  const fromRow = source && cfg.fromRow ? cfg.fromRow(source) : {};
  const v: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const raw = source ? (f.name in fromRow ? fromRow[f.name] : source[f.name]) : undefined;
    if (f.kind === "bool") v[f.name] = raw === undefined ? true : !!raw;
    else if (f.kind === "gallery") v[f.name] = Array.isArray(raw) ? raw : [];
    else if (f.kind === "number") v[f.name] = raw === undefined ? (f.name === "sortOrder" ? nextSort : 0) : Number(raw);
    else v[f.name] = str(raw);
  }
  return v;
}

export function trFromRow(cfg: EntityConfig, source: Row | null): TrState {
  const out = {} as TrState;
  for (const l of LANGS) {
    out[l] = {};
    for (const f of cfg.tr ?? []) out[l][f.name] = rowTr(source, l, f.name);
  }
  return out;
}

export const specsFromRow = (source: Row | null): Spec[] => ((source?.specs as Spec[] | undefined) ?? []).map((s) => ({ key: { ...s.key }, value: { ...s.value } }));

/** Forma vəziyyətindən backend-ə göndəriləcək məzmun; səhv varsa mətn qaytarır */
export function buildPayload(cfg: EntityConfig, values: Record<string, unknown>, tr: TrState, specs: Spec[]): { payload: Record<string, unknown> } | { error: string } {
  const payload: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const v = values[f.name];
    if (f.kind === "number") payload[f.name] = Number(v) || 0;
    else if (f.kind === "bool" || f.kind === "gallery") payload[f.name] = v;
    else {
      const t = str(v).trim();
      if ("required" in f && f.required && !t) return { error: `"${f.label}" boş ola bilməz.` };
      payload[f.name] = t === "" ? null : t;
    }
  }
  if (cfg.tr) {
    const translations: Record<string, Record<string, string>> = {};
    const required = cfg.tr.filter((f) => f.required);
    for (const l of LANGS) {
      const filled = required.every((f) => tr[l][f.name]?.trim());
      // AZ məcburidir; RU və EN yalnız tam doldurulubsa göndərilir
      if (l === "az" && !filled) return { error: "AZ dilində məcburi sahələri doldurun." };
      if (!filled) continue;
      translations[l] = Object.fromEntries(cfg.tr.map((f) => [f.name, (tr[l][f.name] ?? "").trim()]));
    }
    payload.translations = translations;
  }
  if (cfg.specs) payload.specs = specs.map((s) => ({ key: cleanMap(s.key), value: cleanMap(s.value) })).filter((s) => Object.keys(s.key).length > 0);
  return { payload };
}
