"use client";

import { useRef, useState } from "react";
import { CloudUpload, Plus, X } from "lucide-react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import { previewUrl, uploadMedia, type MediaAsset } from "@/lib/admin/upload";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";
import { Notice, PageHeader, Pagination, SearchBox, useCrumbs } from "./ui";

type PageView = { items: MediaAsset[]; total: number; page: number; size: number };
const SIZE = 12;
const kb = (n: number) => (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const dims = (a: MediaAsset) => (a.width && a.height ? `${a.width} × ${a.height}` : "");

function useLibrary(site: string) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const qs = new URLSearchParams({ page: String(page), size: String(SIZE) });
  if (q.trim()) qs.set("q", q.trim());
  const data = useApi<PageView>(`panel/sites/${site}/media?${qs}`);
  return {
    q,
    setQ: (v: string) => {
      setQ(v);
      setPage(0);
    },
    page,
    setPage,
    data,
  };
}

function Grid({ items, selected, onPick }: { items: MediaAsset[]; selected?: number | null; onPick: (a: MediaAsset) => void }) {
  return (
    <div className={styles.mediaGrid} style={{ padding: 0 }}>
      {items.map((a) => (
        <button key={a.id} type="button" className={styles.mediaItem} aria-pressed={a.id === selected} onClick={() => onPick(a)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl(a.url)} alt={a.alt.az ?? ""} loading="lazy" />
          <strong title={a.name ?? ""}>{a.name ?? "fayl"}</strong>
          <span>
            {dims(a)}
            {dims(a) && " · "}
            {kb(a.size)}
          </span>
        </button>
      ))}
    </div>
  );
}

function UploadButton({ site, onDone, variant = "gold" }: { site: string; onDone: () => void; variant?: "gold" | "picker" }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      for (const f of Array.from(files)) await uploadMedia(f, site);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənmədi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
      onDone();
    }
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <input ref={input} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={(e) => pick(e.target.files)} />
      <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={() => input.current?.click()}>
        {variant === "picker" ? <CloudUpload size={18} /> : <Plus size={18} />}
        {busy ? "Yüklənir…" : "Şəkil yüklə"}
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </span>
  );
}

export function MediaPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const lib = useLibrary(code);
  const [openId, setOpenId] = useState<number | null>(null);
  useCrumbs([{ label: site?.name ?? code }, { label: "Media" }]);
  if (!site || !can("MEDIA", "VIEW", code)) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;
  const d = lib.data.data;
  const pages = d ? Math.max(1, Math.ceil(d.total / SIZE)) : 1;
  const open = d?.items.find((a) => a.id === openId) ?? null;
  return (
    <>
      <PageHeader title="Media kitabxanası" sub="Saytın şəkillərini və alt mətnlərini idarə edin." actions={can("MEDIA", "CREATE", code) && <UploadButton site={code} onDone={lib.data.reload} />} />
      <div className={open ? styles.mediaLayout : undefined}>
        <section className={styles.panel}>
          <div className={styles.toolbar}>
            <SearchBox value={lib.q} onChange={lib.setQ} placeholder="Ad və ya alt mətn axtar…" />
          </div>
          {lib.data.error ? (
            <div style={{ padding: 20 }}>
              <Notice tone="bad">{lib.data.error}</Notice>
            </div>
          ) : !d ? (
            <p className={styles.loading} style={{ padding: "0 20px" }}>
              Yüklənir…
            </p>
          ) : d.items.length === 0 ? (
            <p className={styles.muted} style={{ padding: "0 20px 24px" }}>
              Şəkil tapılmadı.
            </p>
          ) : (
            <div style={{ padding: "0 20px 8px" }}>
              <Grid items={d.items} selected={openId} onPick={(a) => setOpenId(a.id)} />
            </div>
          )}
          {d && (
            <div className={styles.tableFoot}>
              <span>
                {d.items.length} / {d.total}
              </span>
              <Pagination page={lib.page} pages={pages} onChange={lib.setPage} />
            </div>
          )}
        </section>
        {open && (
          <AssetPanel
            key={open.id}
            site={code}
            asset={open}
            onClose={() => setOpenId(null)}
            onSaved={lib.data.reload}
            onDeleted={() => {
              setOpenId(null);
              lib.data.reload();
            }}
          />
        )}
      </div>
    </>
  );
}

function AssetPanel({ site, asset, onClose, onSaved, onDeleted }: { site: string; asset: MediaAsset; onClose: () => void; onSaved: () => void; onDeleted: () => void }) {
  const { can } = useAdmin();
  const [alt, setAlt] = useState<Record<string, string>>({ az: "", en: "", ru: "", ...asset.alt });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, ok?: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      if (ok) setMsg({ ok: true, text: ok });
      return true;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError ? e.message : "Xəta baş verdi." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className={`${styles.panel} ${styles.panelPad} ${styles.sticky}`} aria-label="Şəkil detalları">
      <div className={styles.panelHead} style={{ marginBottom: 12 }}>
        <h2 style={{ overflowWrap: "anywhere" }}>{asset.name ?? "Şəkil"}</h2>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Bağla">
          <X size={22} />
        </button>
      </div>
      <div className={styles.imageBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl(asset.url)} alt={alt.az} />
      </div>
      <dl className={styles.defList} style={{ margin: "16px 0" }}>
        <dt>Format</dt>
        <dd>{asset.mime}</dd>
        {dims(asset) && (
          <>
            <dt>Ölçü</dt>
            <dd>{dims(asset)}</dd>
          </>
        )}
        <dt>Fayl ölçüsü</dt>
        <dd>{kb(asset.size)}</dd>
        {asset.uploadedBy && (
          <>
            <dt>Yükləyən</dt>
            <dd>{asset.uploadedBy}</dd>
          </>
        )}
      </dl>
      <div className={styles.fieldRow} style={{ gridTemplateColumns: "60px minmax(0,1fr) auto", alignItems: "center", marginBottom: 12 }}>
        <label htmlFor="m-url" style={{ paddingTop: 0 }}>
          URL
        </label>
        <input id="m-url" className={styles.input} readOnly value={asset.url} onFocus={(e) => e.target.select()} />
        <button
          type="button"
          className={`${styles.btn} ${styles.btnOutlineGold}`}
          onClick={() => {
            void navigator.clipboard?.writeText(asset.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      {(["az", "en", "ru"] as const).map((l) => (
        <div key={l} className={styles.fieldRow} style={{ gridTemplateColumns: "100px minmax(0,1fr)", alignItems: "center", marginBottom: 12 }}>
          <label htmlFor={`alt-${l}`} style={{ paddingTop: 0 }}>
            Alt mətn ({l.toUpperCase()})
          </label>
          <input id={`alt-${l}`} className={styles.input} maxLength={200} value={alt[l] ?? ""} onChange={(e) => setAlt((p) => ({ ...p, [l]: e.target.value }))} disabled={!can("MEDIA", "UPDATE", site)} />
        </div>
      ))}
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status" style={{ marginBottom: 10 }}>
          {msg.text}
        </p>
      )}
      {can("MEDIA", "UPDATE", site) && (
        <button
          className={`${styles.btn} ${styles.btnGold} ${styles.btnBlock}`}
          disabled={busy}
          onClick={() => {
            void run(() => api(`panel/sites/${site}/media/${asset.id}`, { method: "PUT", body: alt }), "Saxlanıldı.").then((ok) => ok && onSaved());
          }}
        >
          Alt mətni saxla
        </button>
      )}
      {can("MEDIA", "DELETE", site) && (
        <div style={{ marginTop: 16, background: "var(--bad-bg)", borderRadius: 10, padding: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
            disabled={busy}
            onClick={() => {
              if (confirm("Bu şəkil silinsin?")) void run(() => api(`panel/sites/${site}/media/${asset.id}`, { method: "DELETE" })).then((ok) => ok && onDeleted());
            }}
          >
            Şəkli sil
          </button>
          <span className={styles.error} style={{ fontSize: 13 }}>
            İstifadə olunan şəkil silinə bilməz.
          </span>
        </div>
      )}
    </aside>
  );
}

/** Formda "Kitabxanadan seç": mövcud şəkli seçmək üçün pəncərə */
export function MediaPicker({ site, onPick, onClose }: { site: string; onPick: (url: string) => void; onClose: () => void }) {
  const { can } = useAdmin();
  const lib = useLibrary(site);
  const [sel, setSel] = useState<MediaAsset | null>(null);
  const d = lib.data.data;
  return (
    <Modal title="Şəkil seç" onClose={onClose} width={1000}>
      <div className={styles.split} style={{ gridTemplateColumns: "minmax(0, 1fr) 300px" }}>
        <div>
          <div className={styles.row} style={{ marginBottom: 14, flexWrap: "nowrap" }}>
            <SearchBox value={lib.q} onChange={lib.setQ} placeholder="Şəkil axtar…" />
            {can("MEDIA", "CREATE", site) && <UploadButton site={site} onDone={lib.data.reload} variant="picker" />}
          </div>
          {lib.data.error ? (
            <Notice tone="bad">{lib.data.error}</Notice>
          ) : !d ? (
            <p className={styles.loading}>Yüklənir…</p>
          ) : d.items.length === 0 ? (
            <p className={styles.muted}>Şəkil yoxdur. Yeni şəkil yükləyin.</p>
          ) : (
            <Grid items={d.items} selected={sel?.id} onPick={setSel} />
          )}
          {d && (
            <div className={styles.tableFoot} style={{ padding: "12px 0 0", border: 0 }}>
              <span />
              <Pagination page={lib.page} pages={Math.max(1, Math.ceil(d.total / SIZE))} onChange={lib.setPage} />
            </div>
          )}
        </div>
        <div className={styles.panel} style={{ padding: 16, alignSelf: "start" }}>
          <strong style={{ display: "block", marginBottom: 10 }}>Seçilmiş şəkil</strong>
          {sel ? (
            <>
              <div className={styles.imageBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl(sel.url)} alt={sel.alt.az ?? ""} />
              </div>
              <p style={{ fontWeight: 600, marginTop: 12, overflowWrap: "anywhere" }}>{sel.name}</p>
              <p className={styles.muted} style={{ fontSize: 13 }}>
                {dims(sel)}
                {dims(sel) && " · "}
                {kb(sel.size)}
              </p>
            </>
          ) : (
            <p className={styles.muted}>Soldan şəkil seçin.</p>
          )}
        </div>
      </div>
      <div className={styles.modalFoot}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
          Ləğv et
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={!sel} onClick={() => sel && onPick(sel.url)}>
          Seçilmiş şəkli istifadə et
        </button>
      </div>
    </Modal>
  );
}
