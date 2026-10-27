"use client";

import { useState } from "react";
import { ApiError, api } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";

type Setup = { secret: string; otpauthUri: string; qr: string };

export function ProfilePage() {
  const { user, reloadUser } = useAdmin();
  return (
    <>
      <h1 className={styles.h1}>Profil</h1>
      <p className={styles.sub}>{user.email}</p>
      <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
        <ProfileForm />
        <TwoFactor key={String(user.totpEnabled)} enabled={user.totpEnabled} onChanged={reloadUser} />
      </div>
    </>
  );
}

function ProfileForm() {
  const { user, reloadUser } = useAdmin();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("auth/profile", { method: "PUT", body: { name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined } });
      setCurrent("");
      setNew("");
      setMsg({ ok: true, text: "Yadda saxlanıldı." });
      reloadUser();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : "Xəta baş verdi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }} onSubmit={save}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Hesab məlumatları</h2>
      <div className={styles.field}>
        <label htmlFor="p-name">Ad, soyad</label>
        <input id="p-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={128} />
      </div>
      <div className={styles.field}>
        <label htmlFor="p-email">E-poçt</label>
        <input id="p-email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className={styles.field}>
        <label htmlFor="p-new">Yeni parol</label>
        <input id="p-new" type="password" className={styles.input} value={newPassword} onChange={(e) => setNew(e.target.value)} minLength={8} autoComplete="new-password" />
        <span className={styles.hint}>Dəyişmək istəmirsinizsə boş buraxın. Dəyişəndə digər cihazlardakı sessiyalar bağlanır.</span>
      </div>
      <div className={styles.field}>
        <label htmlFor="p-cur">Cari parol</label>
        <input id="p-cur" type="password" className={styles.input} value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        <span className={styles.hint}>E-poçtu və ya parolu dəyişəndə tələb olunur.</span>
      </div>
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status">
          {msg.text}
        </p>
      )}
      <div>
        <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
          Yadda saxla
        </button>
      </div>
    </form>
  );
}

function TwoFactor({ enabled, onChanged }: { enabled: boolean; onChanged: () => void }) {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError("");
    try {
      const s = await api<{ secret: string; otpauthUri: string }>("auth/2fa/setup", { method: "POST" });
      const QR = await import("qrcode");
      setSetup({ ...s, qr: await QR.toDataURL(s.otpauthUri, { margin: 1, width: 192 }) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(path: "enable" | "disable") {
    setBusy(true);
    setError("");
    try {
      await api(`auth/2fa/${path}`, { method: "POST", body: path === "enable" ? { code } : { code, password } });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
      setBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>İki mərhələli giriş (2FA)</h2>
      {enabled ? (
        <>
          <p>
            <span className={`${styles.badge} ${styles.badgeOk}`}>Aktivdir</span> Girişdə parolla yanaşı authenticator tətbiqindəki kod tələb olunur.
          </p>
          <div className={styles.field}>
            <label htmlFor="d-pass">Söndürmək üçün parol</label>
            <input id="d-pass" type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div className={styles.field}>
            <label htmlFor="d-code">Təsdiq kodu</label>
            <input id="d-code" className={styles.input} value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} />
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div>
            <button className={`${styles.btn} ${styles.btnDanger}`} disabled={busy || code.length < 6 || !password} onClick={() => confirm("disable")}>
              2FA-nı söndür
            </button>
          </div>
        </>
      ) : setup ? (
        <>
          <p>Authenticator tətbiqi (Google Authenticator, Microsoft Authenticator, 1Password və s.) ilə QR kodu oxudun, sonra göstərilən 6 rəqəmli kodu daxil edin.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="2FA QR kodu" className={styles.qr} width={192} height={192} />
          <p className={styles.hint}>
            QR oxunmursa, açarı əl ilə daxil edin: <span className={`${styles.mono} ${styles.secret}`}>{setup.secret}</span>
          </p>
          <div className={styles.field}>
            <label htmlFor="e-code">Təsdiq kodu</label>
            <input id="e-code" className={styles.input} value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.row}>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy || code.length < 6} onClick={() => confirm("enable")}>
              Aktiv et
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setSetup(null)}>
              Ləğv et
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.muted}>Aktiv deyil. Aktiv etsəniz parol oğurlansa belə hesaba giriş mümkün olmayacaq.</p>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy} onClick={start}>
              Quraşdır
            </button>
          </div>
        </>
      )}
    </section>
  );
}
