"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export function LoginForm() {
  const [needCode, setNeedCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), totp: form.get("totp") || undefined }),
      });
      if (res.ok) {
        window.location.replace("/");
        return;
      }
      const json = (await res.json().catch(() => null)) as { message?: string } | null;
      if (res.status === 428) {
        setNeedCode(true);
      } else if (res.status === 401) {
        setError(json?.message === "Təsdiq kodu yanlışdır." ? json.message : "E-poçt və ya parol yanlışdır.");
      } else if (res.status === 429) {
        setError(json?.message ?? "Çox sayda cəhd. Bir az sonra yenidən yoxlayın.");
      } else {
        setError(json?.message ?? "Xəta baş verdi.");
      }
    } catch {
      setError("Şəbəkə xətası. İnternet bağlantınızı yoxlayın.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.login}>
      <form className={styles.loginCard} onSubmit={onSubmit}>
        <h1>CES Admin</h1>
        <div className={styles.field}>
          <label htmlFor="email">E-poçt</label>
          <input id="email" name="email" type="email" className={styles.input} autoComplete="username" required readOnly={needCode} />
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Parol</label>
          <input id="password" name="password" type="password" className={styles.input} autoComplete="current-password" required readOnly={needCode} />
        </div>
        {needCode && (
          <div className={styles.field}>
            <label htmlFor="totp">Təsdiq kodu</label>
            <input id="totp" name="totp" className={styles.input} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} autoFocus required />
            <span className={styles.hint}>Authenticator tətbiqindəki 6 rəqəmli kodu daxil edin.</span>
          </div>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
          {busy ? "Yoxlanılır…" : "Daxil ol"}
        </button>
      </form>
    </div>
  );
}
