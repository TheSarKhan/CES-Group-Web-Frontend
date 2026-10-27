"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import { FolderOpen, GripVertical, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import "cropperjs/dist/cropper.css";
import { uploadImage, uploadMedia, previewUrl } from "@/lib/admin/upload";
import styles from "./admin.module.css";
import { MediaPicker } from "./MediaLibrary";
import { Modal } from "./Modal";

/** Texnika kataloqu köhnə qovluq əsaslı yükləməni saxlayır, digər sahələr media kitabxanasına yazır */
const send = (file: File, folder: string, site?: string) => (site && !(site === "equipment" && folder !== "misc") ? uploadMedia(file, site).then((a) => a.url) : uploadImage(file, folder));

/** Tək şəkil: baxış qutusu, "Dəyiş", "Kitabxanadan seç" və silmə düymələri. `label` verilməsə başlıq kartın özündədir. */
export function ImageField({ label, value, folder, crop, site, onChange, contain = true }: { label?: string; value: string; folder: string; crop?: number | "free"; site?: string; onChange: (v: string) => void; contain?: boolean }) {
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
      {label && <span className={styles.label}>{label}</span>}
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
      <div className={styles.imageBox} style={{ minHeight: value ? undefined : 150 }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl(value)} alt="" className={contain ? undefined : styles.imageBoxCover} />
        ) : (
          <span className={styles.hint}>Şəkil yoxdur</span>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <div className={styles.imageActions} style={{ marginTop: 0 }}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} disabled={busy} onClick={() => input.current?.click()}>
          <ImageIcon size={18} /> {busy ? "Yüklənir…" : value ? "Dəyiş" : "Yüklə"}
        </button>
        {site && (
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setLibrary(true)}>
            <FolderOpen size={18} /> Kitabxanadan seç
          </button>
        )}
        {value && (
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} style={{ flex: "none", minWidth: 0, padding: "0 14px" }} onClick={() => onChange("")} aria-label="Şəkli sil">
            <Trash2 size={18} />
          </button>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
      {library && site && <MediaPicker site={site} onClose={() => setLibrary(false)} onPick={(u) => { onChange(u); setLibrary(false); }} />}
    </div>
  );
}

/** Qalereya: şəkillər şəbəkədə, sürüşdürməklə sıralanır; hər birinin silmə düyməsi var */
export function GalleryField({ value, folder, site, onChange }: { label?: string; value: string[]; folder: string; site?: string; onChange: (v: string[]) => void }) {
  const [library, setLibrary] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState<number | null>(null);

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

  function drop(to: number) {
    if (drag === null || drag === to) return setDrag(null);
    const next = [...value];
    next.splice(to, 0, next.splice(drag, 1)[0]);
    setDrag(null);
    onChange(next);
  }

  return (
    <div className={styles.field}>
      <div className={styles.galleryGrid}>
        {value.map((u, i) => (
          <div key={u + i} className={styles.galleryItem} draggable onDragStart={() => setDrag(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(i)} onDragEnd={() => setDrag(null)} style={drag === i ? { opacity: 0.4 } : undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl(u)} alt="" />
            <div className={styles.galleryItemBar}>
              <span className={styles.dragHandle} title="Sıranı dəyişmək üçün sürüşdürün">
                <GripVertical size={18} />
              </span>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnSm} ${styles.iconBtnDanger}`} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Şəkli sil">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => add(e.target.files)} />
      <div className={styles.row}>
        <button type="button" className={`${styles.btn} ${styles.btnOutlineGold}`} disabled={busy} onClick={() => input.current?.click()}>
          <Plus size={18} /> {busy ? "Yüklənir…" : "Şəkil əlavə et"}
        </button>
        {site && (
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setLibrary(true)}>
            <FolderOpen size={18} /> Kitabxanadan əlavə et
          </button>
        )}
      </div>
      {value.length > 1 && <span className={styles.hint}>Şəkillərin sırasını sürükləyərək dəyişin.</span>}
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
