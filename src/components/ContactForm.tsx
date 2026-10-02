"use client";

import { useState } from "react";
import { COMPANY_OPTIONS } from "@/lib/contact-schema";
import { ArrowRight } from "./Icons";
import styles from "./ContactForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };
type FieldErrors = Partial<Record<"name" | "phone" | "email" | "company" | "message", string[]>>;

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; fields?: FieldErrors };
      if (json.ok) {
        form.reset();
        setStatus({ kind: "ok" });
      } else {
        setErrors(json.fields ?? {});
        setStatus({ kind: "error", message: json.error ?? "Xəta baş verdi." });
      }
    } catch {
      setStatus({ kind: "error", message: "Şəbəkə xətası. İnternet bağlantınızı yoxlayın." });
    }
  }

  const err = (k: keyof FieldErrors) =>
    errors[k]?.[0] ? (
      <span id={`${k}-error`} className={styles.error}>
        {errors[k]![0]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate={false}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name">Ad, soyad *</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {err("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor="phone">Telefon *</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+994" required minLength={7} maxLength={30} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
          {err("phone")}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="email">E-poçt</label>
          <input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          {err("email")}
        </div>
        <div className={styles.field}>
          <label htmlFor="company">Hansı şirkətlə bağlıdır? *</label>
          <select id="company" name="company" required defaultValue="">
            <option value="" disabled>
              Seçin
            </option>
            {COMPANY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {err("company")}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="message">Mesaj *</label>
        <textarea id="message" name="message" rows={6} required minLength={10} maxLength={3000} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
        {err("message")}
      </div>
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="website">Sayt</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.footer}>
        <button type="submit" className="btn btn-gold" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Göndərilir…" : "Müraciəti göndər"} <ArrowRight />
        </button>
        <p className={styles.status} role="status" aria-live="polite">
          {status.kind === "ok" && "Müraciətiniz qəbul olundu. Tezliklə sizinlə əlaqə saxlayacağıq."}
          {status.kind === "error" && <span className={styles.statusError}>{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
