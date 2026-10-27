"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./admin.module.css";

/** Açıq olduqda render olunur; native <dialog> fokusu və Esc-i özü idarə edir */
export function Modal({ title, onClose, children, width }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} className={styles.modal} style={width ? { width: `min(${width}px, calc(100vw - 32px))` } : undefined} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={styles.modalBody}>
        <div className={styles.modalHead}>
          <h2>{title}</h2>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Bağla">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
