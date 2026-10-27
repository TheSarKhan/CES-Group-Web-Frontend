"use client";

import { useRef, useState } from "react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import { previewUrl, uploadMedia, type MediaAsset } from "@/lib/admin/upload";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Modal } from "./Modal";
import { SiteTabs } from "./SiteTabs";

type PageView = { items: MediaAsset[]; total: number; page: number; size: number };
const kb = (n: number) => (n > 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function useLibrary(site: string) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const qs = new URLSearchParams({ page: String(page), size: "30" });
  if (q.trim()) qs.set("q", q.trim());
  const data = useApi<PageView>(`panel/sites/${site}/media?${qs}`);
  return { q, setQ: (v: string) => { setQ(v); setPage(0); }, page, setPage, data };
}

function Grid({ items, onPick }: { items: MediaAsset[]; onPick: (a: MediaAsset) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
      {items.map((a) => (
        <button key={a.id} type="button" onClick={() => onPick(a)} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 8, background: "var(--white)", cursor: "pointer", textAlign: "left", display: "grid", gap: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl(a.url)} alt={a.alt.az ?? ""} loading="lazy" style={{ width: "100%", height: 100, objectFit: "contain", background: "var(--paper)", borderRadius: 4 }} />
          <span className={styles.barName} style={{ fontSize: 13 }} title={a.name ?? ""}>
            {a.name ?? "fayl"}
          </span>
          <span className={styles.hint}>
            {a.width && a.height ? `${a.width}×${a.height}, ` : ""}
            {kb(a.size)}
          </span>
        </button>
      ))}
    </div>
  );
}

function UploadButton({ site, onDone }: { site: string; onDone: () => void }) {
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
    <span>
      <input ref={input} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={(e) => pick(e.target.files)} />
      <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Yüklənir…" : "Şəkil yüklə"}
      </button>
      {error && <span className={styles.error}> {error}</span>}
    </span>
  );
}

export function MediaPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const lib = useLibrary(code);
  const [open, setOpen] = useState<MediaAsset | null>(null);
  if (!site || !can("MEDIA", "VIEW", code)) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;
  const pages = lib.data.data ? Math.max(1, Math.ceil(lib.data.data.total / 30)) : 1;
  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>Saytın şəkilləri. Şəkillər yüklənəndə avtomatik kiçildilir.</p>
        </div>
        {can("MEDIA", "CREATE", code) && <UploadButton site={code} onDone={lib.data.reload} />}
      </div>
      <SiteTabs code={code} current="media" />
      <div className={styles.filters}>
        <input className={styles.input} placeholder="Axtar (ad və ya alt mətn)" value={lib.q} onChange={(e) => lib.setQ(e.target.value)} aria-label="Axtar" />
      </div>
      {lib.data.error ? (
        <p className={styles.error}>{lib.data.error}</p>
      ) : !lib.data.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : lib.data.data.items.length === 0 ? (
        <p className={styles.muted}>Şəkil tapılmadı.</p>
      ) : (
        <>
          <Grid items={lib.data.data.items} onPick={setOpen} />
          <div className={styles.pager}>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={lib.page === 0} onClick={() => lib.setPage(lib.page - 1)}>
              Əvvəlki
            </button>
            <span className={styles.muted}>
              {lib.page + 1} / {pages} ({lib.data.data.total} şəkil)
            </span>
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={lib.page + 1 >= pages} onClick={() => lib.setPage(lib.page + 1)}>
              Növbəti
            </button>
          </div>
        </>
      )}
      {open && <AssetDialog site={code} asset={open} onClose={() => setOpen(null)} onChanged={() => { setOpen(null); lib.data.reload(); }} />}
    </>
  );
}

function AssetDialog({ site, asset, onClose, onChanged }: { site: string; asset: MediaAsset; onClose: () => void; onChanged: () => void }) {
  const { can } = useAdmin();
  const [alt, setAlt] = useState<Record<string, string>>({ az: "", en: "", ru: "", ...asset.alt });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
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
    <Modal title={asset.name ?? "Şəkil"} onClose={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl(asset.url)} alt={alt.az} style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain", background: "var(--paper)", borderRadius: 6, justifySelf: "center" }} />
      <div className={styles.field}>
        <label htmlFor="m-url">Ünvan</label>
        <div className={styles.row} style={{ flexWrap: "nowrap" }}>
          <input id="m-url" className={styles.input} readOnly value={asset.url} onFocus={(e) => e.target.select()} />
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => navigator.clipboard?.writeText(asset.url)}>
            Kopyala
          </button>
        </div>
        <span className={styles.hint}>
          {asset.mime}, {kb(asset.size)}
          {asset.width && asset.height ? `, ${asset.width}×${asset.height}` : ""}
          {asset.uploadedBy ? `, yükləyən: ${asset.uploadedBy}` : ""}
        </span>
      </div>
      {(["az", "en", "ru"] as const).map((l) => (
        <div key={l} className={styles.field}>
          <label htmlFor={`alt-${l}`}>Alt mətn ({l.toUpperCase()})</label>
          <input id={`alt-${l}`} className={styles.input} maxLength={200} value={alt[l] ?? ""} onChange={(e) => setAlt((p) => ({ ...p, [l]: e.target.value }))} disabled={!can("MEDIA", "UPDATE", site)} />
        </div>
      ))}
      <span className={styles.hint}>Alt mətn şəkli görə bilməyən istifadəçilərə və axtarış sistemlərinə şəklin nə olduğunu deyir. Qısa və dəqiq yazın.</span>
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status">
          {msg.text}
        </p>
      )}
      <div className={styles.modalFoot}>
        {can("MEDIA", "DELETE", site) && (
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            style={{ marginRight: "auto" }}
            disabled={busy}
            onClick={async () => {
              if (confirm("Bu şəkil silinsin?") && (await run(() => api(`panel/sites/${site}/media/${asset.id}`, { method: "DELETE" }))) ) onChanged();
            }}
          >
            Sil
          </button>
        )}
        {can("MEDIA", "UPDATE", site) && (
          <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={async () => { if (await run(() => api(`panel/sites/${site}/media/${asset.id}`, { method: "PUT", body: alt }), "Saxlanıldı.")) onChanged(); }}>
            Alt mətni saxla
          </button>
        )}
      </div>
    </Modal>
  );
}

/** Formda "Kitabxanadan seç": mövcud şəkli seçmək üçün pəncərə */
export function MediaPicker({ site, onPick, onClose }: { site: string; onPick: (url: string) => void; onClose: () => void }) {
  const { can } = useAdmin();
  const lib = useLibrary(site);
  return (
    <Modal title="Şəkil seç" onClose={onClose}>
      <div className={styles.row} style={{ alignItems: "center" }}>
        <input className={styles.input} style={{ flex: 1 }} placeholder="Axtar" value={lib.q} onChange={(e) => lib.setQ(e.target.value)} aria-label="Axtar" />
        {can("MEDIA", "CREATE", site) && <UploadButton site={site} onDone={lib.data.reload} />}
      </div>
      {lib.data.error ? (
        <p className={styles.error}>{lib.data.error}</p>
      ) : !lib.data.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : lib.data.data.items.length === 0 ? (
        <p className={styles.muted}>Şəkil yoxdur. Yeni şəkil yükləyin.</p>
      ) : (
        <>
          <Grid items={lib.data.data.items} onPick={(a) => onPick(a.url)} />
          <div className={styles.pager}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={lib.page === 0} onClick={() => lib.setPage(lib.page - 1)}>
              Əvvəlki
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={(lib.page + 1) * 30 >= lib.data.data.total} onClick={() => lib.setPage(lib.page + 1)}>
              Növbəti
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
