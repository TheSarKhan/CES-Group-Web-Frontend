"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./admin.module.css";

/** Açıq olduqda render olunur; native <dialog> fokusu və Esc-i özü idarə edir */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} className={styles.modal} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className={styles.modalBody}>
        <div className={styles.modalHead}>
          <h2>{title}</h2>
          <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={onClose} aria-label="Bağla">
            Bağla
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
