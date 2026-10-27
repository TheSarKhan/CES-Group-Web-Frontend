"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ApiError, api } from "@/lib/admin/client";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { OtpInput } from "./OtpInput";
import { Notice, PageHeader, Pill, useCrumbs } from "./ui";

type Setup = { secret: string; otpauthUri: string; qr: string };

export function ProfilePage() {
  const { user, reloadUser } = useAdmin();
  useCrumbs([{ label: "Sistem" }, { label: "Profil və 2FA" }]);
  return (
    <>
      <PageHeader title="Profil və təhlükəsizlik" sub="Hesab məlumatlarınızı yeniləyin və iki mərhələli girişi (2FA) aktiv edin." />
      <div className={styles.fieldGrid2} style={{ alignItems: "start" }}>
        <ProfileForm />
        <TwoFactor key={String(user.totpEnabled)} enabled={user.totpEnabled} onChanged={reloadUser} />
      </div>
    </>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, minLength }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; minLength?: number }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.inputIcon}>
      <input id={id} type={show ? "text" : "password"} className={styles.input} style={{ paddingLeft: 14, background: "#fff", paddingRight: 46 }} value={value} onChange={(e) => onChange(e.target.value)} minLength={minLength} autoComplete={autoComplete} />
      <button type="button" aria-label={show ? "Parolu gizlət" : "Parolu göstər"} onClick={() => setShow((v) => !v)}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
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
    <form className={`${styles.panel} ${styles.panelPad} ${styles.form}`} onSubmit={save}>
      <div>
        <h2 className={styles.panelTitle}>Hesab məlumatları</h2>
        <p className={styles.panelSub}>Ad, e-poçt və parolunuzu burada yeniləyə bilərsiniz.</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="p-name">Ad və soyad</label>
        <input id="p-name" className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={128} />
      </div>
      <div className={styles.field}>
        <label htmlFor="p-email">E-poçt ünvanı</label>
        <input id="p-email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className={styles.field}>
        <label htmlFor="p-new">Yeni parol</label>
        <PasswordInput id="p-new" value={newPassword} onChange={setNew} minLength={8} autoComplete="new-password" />
        <span className={styles.hint}>Dəyişmək istəmirsinizsə boş buraxın. Minimum 8 simvol. Dəyişəndə digər cihazlardakı sessiyalar bağlanır.</span>
      </div>
      <div className={styles.field}>
        <label htmlFor="p-cur">Cari parol</label>
        <PasswordInput id="p-cur" value={currentPassword} onChange={setCurrent} autoComplete="current-password" />
        <span className={styles.hint}>E-poçt ünvanı və ya parol dəyişikliklərini yadda saxlamaq üçün cari parolunuzu daxil etməlisiniz.</span>
      </div>
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status">
          {msg.text}
        </p>
      )}
      <div className={styles.row} style={{ justifyContent: "space-between" }}>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setName(user.name); setEmail(user.email); setNew(""); setCurrent(""); setMsg(null); }}>
          Ləğv et
        </button>
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
      setSetup({ ...s, qr: await QR.toDataURL(s.otpauthUri, { margin: 1, width: 200 }) });
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
    <section className={`${styles.panel} ${styles.panelPad} ${styles.form}`}>
      <div>
        <h2 className={styles.panelTitle}>İki mərhələli giriş (2FA)</h2>
        <p className={styles.panelSub}>Hesabınıza əlavə qorunma qatmaq üçün iki mərhələli girişi aktiv edin.</p>
      </div>
      {enabled ? (
        <>
          <Notice tone="info">
            <Pill tone="ok">Aktivdir</Pill> Girişdə parolla yanaşı authenticator tətbiqindəki kod tələb olunur.
          </Notice>
          <div className={styles.field}>
            <label htmlFor="d-pass">Söndürmək üçün parol</label>
            <PasswordInput id="d-pass" value={password} onChange={setPassword} autoComplete="current-password" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Təsdiq kodu</span>
            <OtpInput value={code} onChange={setCode} name="disable-code" />
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
          <Notice tone="info">2FA ilə daxil olarkən parolunuza əlavə olaraq authenticator tətbiqində yaradılan 6 rəqəmli kod tələb olunacaq.</Notice>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNo}>1</span>
              <div>
                <h3>QR kodu oxudun</h3>
                <p className={styles.hint}>Telefonunuzda Google Authenticator, Microsoft Authenticator və ya hər hansı uyğun authenticator tətbiqini açın və aşağıdakı QR kodu oxudun.</p>
                <div className={styles.qrBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={setup.qr} alt="2FA QR kodu" className={styles.qr} width={200} height={200} />
                  <p className={styles.hint} style={{ textAlign: "center" }}>
                    QR oxunmursa, açarı əl ilə daxil edin: <span className={`${styles.mono} ${styles.secret}`}>{setup.secret}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNo}>2</span>
              <div>
                <h3>Kodu daxil edin</h3>
                <p className={styles.hint} style={{ marginBottom: 12 }}>
                  Tətbiqdə göstərilən 6 rəqəmli kodu aşağıdakı sahəyə daxil edin.
                </p>
                <OtpInput value={code} onChange={setCode} name="enable-code" />
              </div>
            </div>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.row} style={{ justifyContent: "space-between" }}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setSetup(null); setCode(""); }}>
              Ləğv et
            </button>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy || code.length < 6} onClick={() => confirm("enable")}>
              Aktiv et
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.muted}>2FA aktiv deyil. Aktiv etsəniz parol oğurlansa belə hesaba giriş mümkün olmayacaq.</p>
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
