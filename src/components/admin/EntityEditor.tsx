"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { buildPayload, specsFromRow, str, trFromRow, valuesFromRow, type Deps, type EntityConfig, type Field, type Lang, type Row, type Spec, type TrState } from "./EntityManager";
import { useDeps } from "./EntityList";
import { GalleryField, ImageField } from "./ImageFields";
import { LangTabs } from "./SchemaForm";
import { Notice, PageHeader, Pill, Toggle, useCrumbs } from "./ui";

type Props = { cfg: EntityConfig; site: string; siteName: string; moduleLabel: string; listHref: string; keyParam: string };

export function EntityEditor(props: Props) {
  const { cfg, keyParam } = props;
  const isNew = keyParam === "new";
  const list = useApi<Row[]>(isNew || !cfg.detail ? cfg.path : null);
  const detail = useApi<Row>(!isNew && cfg.detail ? `${cfg.path}/${keyParam}` : null);
  const deps = useDeps(cfg.deps);
  const row: Row | null = isNew ? null : cfg.detail ? (detail.data ?? null) : (list.data?.find((r) => String(r[cfg.key]) === keyParam) ?? null);
  const err = list.error ?? detail.error;
  const loading = !deps.ready || (cfg.detail && !isNew ? !detail.data && !detail.error : !list.data && !list.error);

  if (err) return <Notice tone="bad">{err}</Notice>;
  if (loading) return <p className={styles.loading}>Yüklənir…</p>;
  if (!isNew && !row) return <Notice tone="bad">Qeyd tapılmadı.</Notice>;
  const nextSort = Math.max(0, ...((list.data ?? []).map((r) => Number(r.sortOrder ?? 0)))) + 10;
  return <Form {...props} deps={deps.data} row={row} nextSort={nextSort} />;
}

function Form({ cfg, site, siteName, moduleLabel, listHref, row, deps, nextSort }: Props & { row: Row | null; deps: Deps; nextSort: number }) {
  const router = useRouter();
  const { can } = useAdmin();
  const [values, setValues] = useState<Record<string, unknown>>(() => valuesFromRow(cfg, row, nextSort));
  const [tr, setTr] = useState<TrState>(() => trFromRow(cfg, row));
  const [specs, setSpecs] = useState<Spec[]>(() => specsFromRow(row));
  const [lang, setLang] = useState<Lang>("az");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (name: string, v: unknown) => setValues((p) => ({ ...p, [name]: v }));
  const canSave = row ? can(cfg.module, "UPDATE", site) : can(cfg.module, "CREATE", site);

  const title = row ? cfg.name(row) || cfg.tab : cfg.newLabel;
  useCrumbs([{ label: siteName }, { label: moduleLabel, href: listHref }, ...(cfg.tab !== moduleLabel ? [{ label: cfg.tab, href: listHref }] : []), { label: row ? "Redaktə" : "Yeni" }]);

  // Bu səhifədən çıxanda saxlanmamış dəyişiklik barədə xəbərdarlıq
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function submit() {
    setError("");
    const built = buildPayload(cfg, values, tr, specs);
    if ("error" in built) return setError(built.error);
    setBusy(true);
    try {
      await api(row ? `${cfg.path}/${row[cfg.key]}` : cfg.path, { method: row ? "PUT" : "POST", body: built.payload });
      setDirty(false);
      router.push(listHref);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  const upd = (name: string, v: unknown) => {
    setDirty(true);
    set(name, v);
  };

  const hasTr = !!cfg.tr;
  const byKind = (...k: Field["kind"][]) => cfg.fields.filter((f) => k.includes(f.kind));
  const plain = byKind("text", "textarea", "url", "number", "select", "bool");
  // Tərcümə sahəsi olan növlərdə mətn sahələri sağdakı "Əsas məlumatlar"dadır; olmayanlarda (məs. müştəri) solda
  const leftPlain = hasTr ? [] : plain.filter((f) => f.kind !== "bool" && f.name !== "sortOrder");
  const mainFields = hasTr ? plain.filter((f) => !("card" in f && f.card)) : plain.filter((f) => f.kind === "bool" || f.name === "sortOrder");
  const cards = [...new Set(plain.map((f) => ("card" in f ? f.card : undefined)).filter(Boolean))] as string[];
  const images = byKind("image");
  const galleries = byKind("gallery");
  const hidden = values.isPublished === false;

  const renderField = (f: Field) => {
    const id = `f-${f.name}`;
    if (f.kind === "bool")
      return (
        <div key={f.name} className={`${styles.fieldRow} ${styles.fieldRowNarrow}`}>
          <label htmlFor={id}>{f.label}</label>
          <div className={styles.toggleRow}>
            <Toggle id={id} checked={!!values[f.name]} onChange={(v: boolean) => upd(f.name, v)} />
          </div>
          {f.hint && <span className={styles.hint}>{f.hint}</span>}
        </div>
      );
    if (f.kind === "select")
      return (
        <div key={f.name} className={`${styles.fieldRow} ${styles.fieldRowNarrow}`}>
          <label htmlFor={id}>
            {f.label}
            {f.required && <span className={styles.req}>*</span>}
          </label>
          <select id={id} className={styles.select} style={{ width: "100%" }} value={str(values[f.name])} onChange={(e) => upd(f.name, e.target.value)} required={f.required}>
            <option value="">Seçin</option>
            {f.options(deps).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    if (f.kind === "image" || f.kind === "gallery") return null;
    return (
      <div key={f.name} className={`${styles.fieldRow} ${hasTr ? styles.fieldRowNarrow : ""}`}>
        <label htmlFor={id}>
          {f.label}
          {f.required && <span className={styles.req}>*</span>}
        </label>
        {f.kind === "textarea" ? (
          <textarea id={id} className={styles.input} rows={f.rows ?? 4} maxLength={f.max} value={str(values[f.name])} onChange={(e) => upd(f.name, e.target.value)} />
        ) : (
          <input id={id} className={styles.input} type={f.kind === "number" ? "number" : "text"} maxLength={f.max} placeholder={f.placeholder} value={str(values[f.name])} onChange={(e) => upd(f.name, e.target.value)} />
        )}
        {f.hint && <span className={styles.hint}>{f.hint}</span>}
      </div>
    );
  };

  const setTrText = (name: string, text: string) => {
    setDirty(true);
    setTr((p) => ({ ...p, [lang]: { ...p[lang], [name]: text } }));
  };

  return (
    <>
      <PageHeader
        back={{ href: listHref, label: cfg.backLabel }}
        title={title}
        status={row ? <Pill tone={hidden ? "muted" : "ok"}>{hidden ? "Gizli" : "Saytda"}</Pill> : undefined}
        sub={cfg.editSub}
        actions={
          <>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push(listHref)}>
              Ləğv et
            </button>
            {canSave && (
              <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={() => void submit()}>
                {busy ? "Saxlanılır…" : "Yadda saxla"}
              </button>
            )}
          </>
        }
      />
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="bad">{error}</Notice>
        </div>
      )}
      <div className={styles.editorGrid}>
        <div className={styles.editorCol}>
          <section className={`${styles.panel} ${styles.panelPad}`}>
            <div className={styles.panelHead} style={{ marginBottom: 6 }}>
              <div>
                <h2>{hasTr ? "Məzmun və tərcümələr" : (cfg.formTitle ?? "Məlumatlar")}</h2>
                {hasTr && <p className={styles.panelSub}>Dil üzrə mətnlər</p>}
              </div>
            </div>
            {hasTr && (
              <>
                <LangTabs lang={lang} onChange={setLang} />
                <p className={styles.langNote}>AZ məcburidir. EN və RU könüllüdür.</p>
                <div className={styles.form} style={{ gap: 20 }}>
                  {cfg.tr!.map((f) => (
                    <div key={f.name} className={styles.fieldRow}>
                      <label htmlFor={`t-${f.name}`}>
                        {f.label} ({lang.toUpperCase()})
                        {f.required && lang === "az" && <span className={styles.req}>*</span>}
                      </label>
                      {f.kind === "textarea" ? (
                        <textarea id={`t-${f.name}`} className={styles.input} rows={f.rows ?? 4} maxLength={f.max} value={tr[lang][f.name] ?? ""} onChange={(e) => setTrText(f.name, e.target.value)} />
                      ) : (
                        <input id={`t-${f.name}`} className={styles.input} maxLength={f.max} value={tr[lang][f.name] ?? ""} onChange={(e) => setTrText(f.name, e.target.value)} />
                      )}
                      {f.hint && <span className={styles.hint}>{f.hint}</span>}
                    </div>
                  ))}
                </div>
                <p className={styles.hint} style={{ marginTop: 14 }}>
                  EN və RU boş qala bilər, bu halda həmin dil üçün məzmun göstərilməyəcək. Məcburi sahələri tam doldurmasanız, dil saxlanmır.
                </p>
              </>
            )}
            {leftPlain.length > 0 && <div className={styles.form} style={{ gap: 20 }}>{leftPlain.map(renderField)}</div>}
            {cfg.specs && (
              <>
                <hr className={styles.divider} />
                <SpecsEditor lang={lang} value={specs} onChange={(v) => { setDirty(true); setSpecs(v); }} />
              </>
            )}
          </section>

          {galleries.map((g) => (
            <section key={g.name} className={`${styles.panel} ${styles.panelPad}`}>
              <div className={styles.panelHead} style={{ marginBottom: 12 }}>
                <div>
                  <h2>{g.label}</h2>
                  <p className={styles.panelSub}>Layihənin əlavə şəkilləri.</p>
                </div>
              </div>
              <GalleryField folder={(g as Extract<Field, { kind: "gallery" }>).folder} site={site} value={(values[g.name] as string[]) ?? []} onChange={(v: string[]) => upd(g.name, v)} />
            </section>
          ))}
        </div>

        <div className={styles.editorCol}>
          <section className={`${styles.panel} ${styles.panelPad}`}>
            <div className={styles.panelHead} style={{ marginBottom: 12 }}>
              <div>
                <h2>Əsas məlumatlar</h2>
                <p className={styles.panelSub}>Bütün dillər üçün ortaqdır.</p>
              </div>
            </div>
            <div className={styles.form} style={{ gap: 18 }}>
              {mainFields.map(renderField)}
            </div>
          </section>

          {images.map((f) => {
            const img = f as Extract<Field, { kind: "image" }>;
            return (
              <section key={f.name} className={`${styles.panel} ${styles.panelPad}`}>
                <div className={styles.panelHead} style={{ marginBottom: 12 }}>
                  <h2>
                    {f.label}
                    {img.required && <span className={styles.req}>*</span>}
                  </h2>
                </div>
                <ImageField folder={img.folder} site={site} crop={img.crop} contain={!img.cover} value={str(values[f.name])} onChange={(v: string) => upd(f.name, v)} />
                {img.hint && <p className={styles.hint} style={{ marginTop: 10 }}>{img.hint}</p>}
              </section>
            );
          })}

          {cards.map((title) => (
            <section key={title} className={`${styles.panel} ${styles.panelPad}`}>
              <div className={styles.panelHead} style={{ marginBottom: 12 }}>
                <h2>{title}</h2>
              </div>
              <div className={styles.fieldGrid2}>
                {plain
                  .filter((f) => "card" in f && f.card === title)
                  .map((f) => (
                    <div key={f.name} className={styles.field}>
                      <label htmlFor={`f-${f.name}`}>{f.label}</label>
                      <input id={`f-${f.name}`} className={styles.input} maxLength={"max" in f ? f.max : undefined} placeholder={"placeholder" in f ? f.placeholder : undefined} value={str(values[f.name])} onChange={(e) => upd(f.name, e.target.value)} />
                    </div>
                  ))}
              </div>
              {plain.map((f) =>
                "card" in f && f.card === title && "hint" in f && f.hint ? (
                  <p key={f.name} className={styles.hint} style={{ marginTop: 10 }}>
                    {f.hint}
                  </p>
                ) : null,
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

/** Texnikanın parametr cədvəli: açar → dəyər cütləri, sıra saxlanılır (dil sekməsinə görə) */
function SpecsEditor({ lang, value, onChange }: { lang: Lang; value: Spec[]; onChange: (v: Spec[]) => void }) {
  const [drag, setDrag] = useState<number | null>(null);
  const update = (i: number, side: "key" | "value", text: string) => onChange(value.map((s, k) => (k === i ? { ...s, [side]: { ...s[side], [lang]: text } } : s)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };
  return (
    <div>
      <h3 className={styles.panelTitle} style={{ fontSize: 18 }}>
        Texniki parametrlər ({lang.toUpperCase()})
      </h3>
      <p className={styles.panelSub} style={{ marginBottom: 14 }}>
        Parametr adı və dəyərini daxil edin. Dil sekməsini dəyişib digər dillərə də yazın. Adı boş olan sətir saxlanmır.
      </p>
      <div className={styles.specHead}>
        <span />
        <span>Parametr</span>
        <span>Dəyər</span>
        <span />
      </div>
      {value.map((s, i) => (
        <div key={i} className={styles.specRow} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }} onDragEnd={() => setDrag(null)} style={drag === i ? { opacity: 0.4 } : undefined}>
          <span className={styles.dragHandle} title="Sürüşdürün">
            <GripVertical size={20} />
          </span>
          <input className={styles.input} value={s.key[lang] ?? ""} onChange={(e) => update(i, "key", e.target.value)} aria-label={`Parametr ${i + 1}`} />
          <input className={styles.input} value={s.value[lang] ?? ""} onChange={(e) => update(i, "value", e.target.value)} aria-label={`Dəyər ${i + 1}`} />
          <div className={styles.row} style={{ gap: 4, flexWrap: "nowrap" }}>
            <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm}`} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Yuxarı">
              <ArrowUp size={14} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm}`} onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label="Aşağı">
              <ArrowDown size={14} />
            </button>
            <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm} ${styles.iconBtnDanger}`} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Sil">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={`${styles.btn} ${styles.btnOutlineGold}`} onClick={() => onChange([...value, { key: {}, value: {} }])}>
        <Plus size={18} /> Parametr əlavə et
      </button>
    </div>
  );
}
