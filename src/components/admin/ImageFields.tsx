"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { uploadImage, uploadMedia, previewUrl } from "@/lib/admin/upload";
import styles from "./admin.module.css";
import { MediaPicker } from "./MediaLibrary";
import { Modal } from "./Modal";

/** Texnika kataloqu köhnə qovluq əsaslı yükləməni saxlayır, digər sahələr media kitabxanasına yazır */
const send = (file: File, folder: string, site?: string) => (site && !(site === "equipment" && folder !== "misc") ? uploadMedia(file, site).then((a) => a.url) : uploadImage(file, folder));

/** Tək şəkil: yüklə, ünvan yaz və ya sil */
export function ImageField({ label, value, folder, crop, site, onChange }: { label: string; value: string; folder: string; crop?: number | "free"; site?: string; onChange: (v: string) => void }) {
  const [library, setLibrary] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [pending, setPending] = useState<{ file: File; url: string } | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    if (input.current) input.current.value = "";
    // Foto sahələrində əvvəl kəsmə pəncərəsi açılır; loqo və SVG/GIF birbaşa yüklənir
    if (crop !== undefined && /^image\/(jpeg|png|webp)$/.test(file.type)) setPending({ file, url: URL.createObjectURL(file) });
    else void upload(file);
  }

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      onChange(await send(file, folder, site));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şəkil yüklənmədi.");
    } finally {
      setBusy(false);
    }
  }

  function closeCrop() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {pending && (
        <CropDialog
          src={pending.url}
          aspect={crop ?? 4 / 3}
          onCancel={closeCrop}
          onSkip={() => {
            const f = pending.file;
            closeCrop();
            void upload(f);
          }}
          onApply={(blob) => {
            const name = pending.file.name.replace(/\.[^.]+$/, "") + ".jpg";
            closeCrop();
            void upload(new File([blob], name, { type: "image/jpeg" }));
          }}
        />
      )}
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
        {site && (
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setLibrary(true)}>
            Kitabxanadan seç
          </button>
        )}
        {value && (
          <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => onChange("")}>
            Sil
          </button>
        )}
      </div>
      <input className={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="və ya şəkil ünvanını yazın" aria-label={`${label}, ünvan`} />
      {error && <span className={styles.error}>{error}</span>}
      {library && site && <MediaPicker site={site} onClose={() => setLibrary(false)} onPick={(u) => { onChange(u); setLibrary(false); }} />}
    </div>
  );
}

/** Qalereya: bir neçə şəkil */
export function GalleryField({ label, value, folder, site, onChange }: { label: string; value: string[]; folder: string; site?: string; onChange: (v: string[]) => void }) {
  const [library, setLibrary] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const next = [...value];
    try {
      for (const f of Array.from(files)) next.push(await send(f, folder, site));
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
        </button>{" "}
        {site && (
          <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => setLibrary(true)}>
            Kitabxanadan əlavə et
          </button>
        )}
      </div>
      {library && site && <MediaPicker site={site} onClose={() => setLibrary(false)} onPick={(u) => { onChange([...value, u]); setLibrary(false); }} />}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

const ASPECTS: { label: string; value: number | "free" }[] = [
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "Sərbəst", value: "free" },
];

/** Cropper.js ilə kəsmə pəncərəsi: sürüşdür, yaxınlaşdır, çevir, nisbəti seç */
function CropDialog({ src, aspect, onCancel, onSkip, onApply }: { src: string; aspect: number | "free"; onCancel: () => void; onSkip: () => void; onApply: (blob: Blob) => void }) {
  const img = useRef<HTMLImageElement>(null);
  const cropper = useRef<Cropper | null>(null);
  const [ready, setReady] = useState(false);
  const [ratio, setRatio] = useState<number | "free">(aspect);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!img.current) return;
    const c = new Cropper(img.current, {
      viewMode: 1,
      dragMode: "move",
      aspectRatio: aspect === "free" ? NaN : aspect,
      autoCropArea: 1,
      toggleDragModeOnDblclick: false,
      ready: () => setReady(true),
    });
    cropper.current = c;
    return () => {
      c.destroy();
      cropper.current = null;
    };
  }, [src, aspect]);

  function choose(v: number | "free") {
    setRatio(v);
    cropper.current?.setAspectRatio(v === "free" ? NaN : v);
  }

  function apply() {
    const canvas = cropper.current?.getCroppedCanvas({ maxWidth: 1600, maxHeight: 1600, fillColor: "#ffffff", imageSmoothingQuality: "high" });
    canvas?.toBlob((b) => (b ? onApply(b) : setError("Şəkil emal olunmadı.")), "image/jpeg", 0.9);
  }

  return (
    <Modal title="Şəkli kəs" onClose={onCancel}>
      <div className={styles.cropStage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} src={src} alt="" />
      </div>
      <div className={styles.row}>
        {ASPECTS.map((a) => (
          <button key={a.label} type="button" disabled={!ready} className={`${styles.btn} ${ratio === a.value ? styles.btnGold : styles.btnGhost} ${styles.btnSm}`} onClick={() => choose(a.value)}>
            {a.label}
          </button>
        ))}
        <button type="button" disabled={!ready} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => cropper.current?.rotate(-90)}>
          Sola 90°
        </button>
        <button type="button" disabled={!ready} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => cropper.current?.rotate(90)}>
          Sağa 90°
        </button>
        <button type="button" disabled={!ready} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => cropper.current?.zoom(0.1)}>
          +
        </button>
        <button type="button" disabled={!ready} className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={() => cropper.current?.zoom(-0.1)}>
          −
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.modalFoot}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onSkip}>
          Kəsmədən yüklə
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnGold}`} disabled={!ready} onClick={apply}>
          Kəs və yüklə
        </button>
      </div>
    </Modal>
  );
}
