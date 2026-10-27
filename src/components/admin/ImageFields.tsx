"use client";

import { useRef, useState } from "react";
import { uploadImage, previewUrl } from "@/lib/admin/upload";
import styles from "./admin.module.css";

/** Tək şəkil: yüklə, ünvan yaz və ya sil */
export function ImageField({ label, value, folder, onChange }: { label: string; value: string; folder: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şəkil yüklənmədi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row} style={{ alignItems: "center" }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl(value)} alt="" style={{ width: 84, height: 64, objectFit: "contain", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 6 }} />
        ) : (
          <span className={styles.hint}>Şəkil yoxdur</span>
        )}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Yüklənir…" : value ? "Dəyiş" : "Yüklə"}
        </button>
        {value && (
          <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => onChange("")}>
            Sil
          </button>
        )}
      </div>
      <input className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="və ya şəkil ünvanını yazın" aria-label={`${label}, ünvan`} />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

/** Qalereya: bir neçə şəkil */
export function GalleryField({ label, value, folder, onChange }: { label: string; value: string[]; folder: string; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const next = [...value];
    try {
      for (const f of Array.from(files)) next.push(await uploadImage(f, folder));
      onChange(next);
    } catch (e) {
      onChange(next);
      setError(e instanceof Error ? e.message : "Şəkil yüklənmədi.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        {value.map((u, i) => (
          <div key={u + i} style={{ display: "grid", gap: 4, width: 110 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl(u)} alt="" style={{ width: 110, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }} />
            <div className={styles.row} style={{ gap: 4 }}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} style={{ padding: "2px 8px" }} onClick={() => move(i, -1)} aria-label="Sola">
                ←
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} style={{ padding: "2px 8px" }} onClick={() => move(i, 1)} aria-label="Sağa">
                →
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} style={{ padding: "2px 8px" }} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Sil">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => add(e.target.files)} />
      <div>
        <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Yüklənir…" : "Şəkil əlavə et"}
        </button>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
