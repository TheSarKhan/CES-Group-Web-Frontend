"use client";

import { useRef } from "react";
import styles from "./admin.module.css";

/** 6 rəqəmli təsdiq kodu: hər xana ayrıdır, yapışdırma və Backspace düzgün işləyir. Dəyər `name` adlı gizli sahədə də olur. */
export function OtpInput({ value, onChange, name = "totp", autoFocus }: { value: string; onChange: (v: string) => void; name?: string; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const set = (next: string) => onChange(next.replace(/\D/g, "").slice(0, 6));

  return (
    <div className={styles.otp} role="group" aria-label="Təsdiq kodu">
      <input type="hidden" name={name} value={value} />
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          aria-label={`${i + 1}-ci rəqəm`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (!v) return;
            const next = (value.slice(0, i) + v + value.slice(i + 1)).slice(0, 6);
            set(next);
            refs.current[Math.min(i + v.length, 5)]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              set(value.slice(0, d ? i : Math.max(0, i - 1)) + value.slice(d ? i + 1 : i));
              refs.current[d ? i : Math.max(0, i - 1)]?.focus();
            } else if (e.key === "ArrowLeft") refs.current[Math.max(0, i - 1)]?.focus();
            else if (e.key === "ArrowRight") refs.current[Math.min(5, i + 1)]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            set(t);
            refs.current[Math.min(t.length, 5)]?.focus();
          }}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
