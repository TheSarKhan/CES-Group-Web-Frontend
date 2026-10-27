"use client";

import { useState } from "react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import type { NotificationSettings } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { SiteTabs } from "./SiteTabs";

export function NotificationsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const allowed = can("NOTIFICATIONS", "VIEW", code);
  const settings = useApi<NotificationSettings>(allowed ? `panel/sites/${code}/notifications` : null);

  if (!site || !allowed) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>{site.name}</h1>
          <p className={styles.sub}>Yeni müraciət gələndə kimə xəbər verilsin.</p>
        </div>
      </div>
      <SiteTabs code={code} current="notifications" />
      {settings.error ? (
        <p className={styles.error}>{settings.error}</p>
      ) : !settings.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
          <EmailBlock key={settings.data.emails.join(",")} code={code} data={settings.data} canEdit={can("NOTIFICATIONS", "UPDATE", code)} onSaved={settings.reload} />
          {me.superAdmin && <BotBlock />}
          <TelegramBlock code={code} data={settings.data} canEdit={can("NOTIFICATIONS", "UPDATE", code)} onChanged={settings.reload} />
          {can("NOTIFICATIONS", "UPDATE", code) && <TestBlock code={code} />}
        </div>
      )}
    </>
  );
}

function EmailBlock({ code, data, canEdit, onSaved }: { code: string; data: NotificationSettings; canEdit: boolean; onSaved: () => void }) {
  const [text, setText] = useState(data.emails.join("\n"));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api(`panel/sites/${code}/notifications/emails`, { method: "PUT", body: { emails: text.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean) } });
      setMsg({ ok: true, text: "Yadda saxlanıldı." });
      onSaved();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : "Xəta baş verdi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }} onSubmit={save}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>E-poçt</h2>
      <div className={styles.field}>
        <label htmlFor="n-emails">Alıcı ünvanları (hər sətirdə biri)</label>
        <textarea id="n-emails" className={styles.input} rows={4} value={text} onChange={(e) => setText(e.target.value)} disabled={!canEdit} />
        <span className={styles.hint}>
          Boş qalsa müraciətlər ümumi ünvana gedir{data.fallbackEmail ? ` (${data.fallbackEmail})` : ""}. Ən çox 10 ünvan.
        </span>
      </div>
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status">
          {msg.text}
        </p>
      )}
      {canEdit && (
        <div>
          <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy}>
            Yadda saxla
          </button>
        </div>
      )}
    </form>
  );
}

function TelegramBlock({ code, data, canEdit, onChanged }: { code: string; data: NotificationSettings; canEdit: boolean; onChanged: () => void }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Telegram</h2>
      {!data.botConfigured && <p className={styles.error}>Telegram botu hələ qoşulmayıb. Bot tokeni serverin ayarlarında verilməlidir.</p>}
      {data.botConfigured && (
        <p className={styles.hint}>
          Əlavə etdiyiniz şəxs Telegram-da {data.botUsername ? <strong>@{data.botUsername}</strong> : "botu"} tapıb <strong>/start</strong> yazmalıdır, bundan sonra “Qoşulub” statusu çıxır.
        </p>
      )}
      {data.telegram.length === 0 && <p className={styles.muted}>Hələ heç kim əlavə edilməyib.</p>}
      {data.telegram.map((r) => (
        <div key={r.id} className={styles.row} style={{ alignItems: "center", justifyContent: "space-between" }}>
          <span>
            @{r.username} <span className={`${styles.badge} ${r.connected ? styles.badgeOk : ""}`}>{r.connected ? "Qoşulub" : "Gözləyir"}</span>
          </span>
          {canEdit && (
            <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} disabled={busy} onClick={() => run(() => api(`panel/sites/${code}/notifications/telegram/${r.id}`, { method: "DELETE" }))}>
              Sil
            </button>
          )}
        </div>
      ))}
      {canEdit && (
        <form
          className={styles.row}
          onSubmit={(e) => {
            e.preventDefault();
            if (!username.trim()) return;
            void run(async () => {
              await api(`panel/sites/${code}/notifications/telegram`, { method: "POST", body: { username } });
              setUsername("");
            });
          }}
        >
          <input className={styles.input} style={{ flex: 1, minWidth: 180 }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@istifadeci_adi" aria-label="Telegram istifadəçi adı" maxLength={64} />
          <button className={`${styles.btn} ${styles.btnGhost}`} disabled={busy || !username.trim()}>
            Əlavə et
          </button>
        </form>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function TestBlock({ code }: { code: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function test() {
    setBusy(true);
    setMsg("");
    try {
      const r = await api<{ emails: number; telegrams: number }>(`panel/sites/${code}/notifications/test`, { method: "POST" });
      setMsg(`Test göndərildi: ${r.emails} e-poçt ünvanına, ${r.telegrams} Telegram istifadəçisinə. E-poçt asinxron göndərilir, bir neçə dəqiqəyə gəlməlidir.`);
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Xəta baş verdi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Yoxlama</h2>
      <p className={styles.muted}>Yuxarıdakı alıcılara test bildirişi göndərir.</p>
      {msg && <p role="status">{msg}</p>}
      <div>
        <button className={`${styles.btn} ${styles.btnGhost}`} disabled={busy} onClick={test}>
          Test bildirişi göndər
        </button>
      </div>
    </section>
  );
}

type BotStatus = { enabled: boolean; tokenMasked: string | null; source: string };

/** Telegram botunun tokeni bütün saytlar üçün ortaqdır, ona görə yalnız Super Admin-ə göstərilir */
function BotBlock() {
  const bot = useApi<BotStatus>("admin/telegram");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
      setToken("");
      bot.reload();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : "Xəta baş verdi." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.form}`} style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Telegram botu (bütün saytlar üçün)</h2>
      {bot.error ? (
        <p className={styles.error}>{bot.error}</p>
      ) : !bot.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <>
          <p>
            <span className={`${styles.badge} ${bot.data.enabled ? styles.badgeOk : styles.badgeBad}`}>{bot.data.enabled ? "Qoşulub" : "Qoşulmayıb"}</span>{" "}
            {bot.data.tokenMasked && <span className={styles.mono}>{bot.data.tokenMasked}</span>}
            {bot.data.enabled && <span className={styles.hint}> (mənbə: {bot.data.source === "panel" ? "panel" : "server ayarı"})</span>}
          </p>
          <div className={styles.field}>
            <label htmlFor="bot-token">Yeni bot tokeni</label>
            <input id="bot-token" type="password" className={styles.input} value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" placeholder="123456:ABC..." />
            <span className={styles.hint}>Tokeni Telegram-da @BotFather verir. Saxlamazdan əvvəl Telegram ilə yoxlanılır.</span>
          </div>
          {msg && (
            <p className={msg.ok ? styles.ok : styles.error} role="status">
              {msg.text}
            </p>
          )}
          <div className={styles.row}>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy || !token.trim()} onClick={() => run(() => api("admin/telegram", { method: "PUT", body: { botToken: token.trim() } }), "Bot qoşuldu.")}>
              Saxla
            </button>
            {bot.data.enabled && (
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                disabled={busy}
                onClick={() => {
                  if (confirm("Telegram botu söndürülsün? Heç bir sayt üçün Telegram bildirişi getməyəcək.")) void run(() => api("admin/telegram", { method: "DELETE" }), "Bot söndürüldü.");
                }}
              >
                Söndür
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
