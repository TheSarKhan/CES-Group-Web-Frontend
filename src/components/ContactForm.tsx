"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { getUi } from "@/i18n/ui";
import { companyOptions } from "@/lib/contact-schema";
import { localePath, type Lang } from "@/lib/i18n";
import { siteUrl } from "@/lib/urls";
import { trackLead } from "./Analytics";
import { ArrowRight } from "./Icons";
import { TURNSTILE_ENABLED, Turnstile, type TurnstileHandle } from "./Turnstile";
import styles from "./ContactForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "ok" } | { kind: "error"; message: string };
type FieldErrors = Partial<Record<"name" | "phone" | "email" | "company" | "message", string[]>>;

const noopSubscribe = () => () => undefined;
// ?sirket=<id> ilə gələndə şirkət əvvəlcədən seçilir (server və hidrasiya zamanı boşdur)
const presetFromUrl = () => {
  const v = new URLSearchParams(window.location.search).get("sirket") ?? "";
  return companyOptions("az").some((o) => o.value === v) ? v : "";
};

/** `company` verilərsə şirkət seçimi gizlənir və müraciət həmin şirkətə yönləndirilir (subdomain saytları) */
export function ContactForm({ company, lang = "az" }: { company?: ReturnType<typeof companyOptions>[number]["value"]; lang?: Lang }) {
  const t = getUi(lang).form;
  const preset = useSyncExternalStore(noopSubscribe, presetFromUrl, () => "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [token, setToken] = useState("");
  const turnstile = useRef<TurnstileHandle>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (TURNSTILE_ENABLED && !token) {
      setStatus({ kind: "error", message: t.turnstile });
      return;
    }
    const payload = { ...Object.fromEntries(new FormData(form).entries()), turnstileToken: token, lang };
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
        trackLead(String(new FormData(form).get("company") ?? company ?? ""));
        form.reset();
        setStatus({ kind: "ok" });
      } else {
        setErrors(json.fields ?? {});
        setStatus({ kind: "error", message: json.error ?? t.error });
      }
    } catch {
      setStatus({ kind: "error", message: t.network });
    } finally {
      // Token bir dəfəlikdir: uğurlu və ya uğursuz cəhddən sonra yenisi alınmalıdır
      setToken("");
      turnstile.current?.reset();
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
          <label htmlFor="name">{t.name}</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          {err("name")}
        </div>
        <div className={styles.field}>
          <label htmlFor="phone">{t.phone}</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+994" required minLength={7} maxLength={30} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
          {err("phone")}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          {err("email")}
        </div>
        {company ? (
          <input type="hidden" name="company" value={company} />
        ) : (
          <div className={styles.field}>
            <label htmlFor="company">{t.company}</label>
            <select key={preset} id="company" name="company" required defaultValue={preset}>
              <option value="" disabled>
                {t.choose}
              </option>
              {companyOptions(lang).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {err("company")}
          </div>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="message">{t.message}</label>
        <textarea id="message" name="message" rows={6} required minLength={10} maxLength={3000} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
        {err("message")}
      </div>
      <div className={styles.hp} aria-hidden="true">
        <label htmlFor="website">{t.honeypot}</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Turnstile ref={turnstile} onVerify={setToken} onExpire={() => setToken("")} />

      <p className={styles.consent}>
        {t.consentBefore}
        <a href={`${siteUrl}${localePath(lang, "/mexfilik-siyaseti")}`}>{t.consentLink}</a>
        {t.consentAfter}
      </p>

      <div className={styles.footer}>
        <button type="submit" className="btn btn-gold" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? t.sending : t.submit} <ArrowRight />
        </button>
        <p className={styles.status} role="status" aria-live="polite">
          {status.kind === "ok" && t.ok}
          {status.kind === "error" && <span className={styles.statusError}>{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
