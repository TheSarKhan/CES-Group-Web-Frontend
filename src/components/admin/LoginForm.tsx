"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import styles from "./admin.module.css";
import { OtpInput } from "./OtpInput";

/** Memarlıq xətti şəkli: tünd tərəfin altında, qızılı xətlərlə */
function Art() {
  const g = "rgba(201,162,75,0.55)";
  const d = "rgba(255,255,255,0.12)";
  return (
    <svg className={styles.authArt} viewBox="0 0 800 520" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true">
      <g strokeWidth="1.2">
        <path d="M0 470 L330 330 L520 395 L800 300" stroke={d} />
        <path d="M0 500 L350 380 L800 470" stroke={d} />
        <path d="M330 250 L330 410 L520 470 L520 300 Z" stroke={g} />
        <path d="M330 250 L520 300 L700 215 L520 170 Z" stroke={g} />
        <path d="M520 300 L520 470 L700 400 L700 215 Z" stroke={d} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${352 + i * 8} ${262 + i * 2} L${352 + i * 8} ${400 + i * 2}`} stroke={g} />
        ))}
        <path d="M120 520 L120 400 L260 440 L260 520" stroke={d} />
        <path d="M120 400 L260 355 L400 400" stroke={g} />
        <path d="M60 505 L420 385 L800 505" stroke={g} />
        <path d="M0 520 L430 400 L800 520" stroke={d} />
      </g>
    </svg>
  );
}

export function LoginForm() {
  const [needCode, setNeedCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password"), totp: code || undefined }),
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
    <div className={styles.authPage}>
      <section className={styles.authSide} aria-hidden="true">
        <div className={styles.authBrand}>
          <span className={styles.logoMark}>CES</span>
          CES Admin
        </div>
        <p className={styles.authTag}>Saytlarınızı bir mərkəzdən idarə edin.</p>
        <Art />
      </section>
      <main className={styles.authMain}>
        <form className={styles.authCard} onSubmit={onSubmit}>
          <h1>Xoş gəlmisiniz</h1>
          <p className="lead" style={{ textAlign: "center", color: "#7a7872", fontSize: 17, marginTop: -10 }}>
            Davam etmək üçün hesabınıza daxil olun.
          </p>
          <div className={styles.field}>
            <label htmlFor="email">E-poçt</label>
            <div className={styles.inputIcon}>
              <Mail size={18} aria-hidden="true" />
              <input id="email" name="email" type="email" className={styles.input} autoComplete="username" placeholder="ad@sirket.az" required readOnly={needCode} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Parol</label>
            <div className={styles.inputIcon}>
              <Lock size={18} aria-hidden="true" />
              <input id="password" name="password" type={show ? "text" : "password"} className={styles.input} autoComplete="current-password" required readOnly={needCode} />
              <button type="button" aria-label={show ? "Parolu gizlət" : "Parolu göstər"} onClick={() => setShow((v) => !v)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {needCode && (
            <div className={styles.field}>
              <span className={styles.label}>Təsdiq kodu</span>
              <OtpInput value={code} onChange={setCode} autoFocus />
              <span className={styles.hint}>Authenticator tətbiqindəki 6 rəqəmli kod.</span>
            </div>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button className={`${styles.btn} ${styles.btnGold} ${styles.btnBlock}`} style={{ height: 52 }} disabled={busy || (needCode && code.length !== 6)}>
            {busy ? "Yoxlanılır…" : "Daxil ol"}
          </button>
        </form>
      </main>
    </div>
  );
}
