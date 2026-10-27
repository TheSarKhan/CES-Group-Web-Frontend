"use client";

import { useState } from "react";
import { ApiError, api, useApi } from "@/lib/admin/client";
import type { NotificationSettings } from "@/lib/admin/types";
import styles from "./admin.module.css";
import { useAdmin } from "./AdminApp";
import { Notice, PageHeader, Pill, RowMenu, useCrumbs } from "./ui";
import { Send, Trash2 } from "lucide-react";

export function NotificationsPage({ code }: { code: string }) {
  const { me, can } = useAdmin();
  const site = me.sites.find((s) => s.code === code);
  const allowed = can("NOTIFICATIONS", "VIEW", code);
  const settings = useApi<NotificationSettings>(allowed ? `panel/sites/${code}/notifications` : null);
  useCrumbs([{ label: site?.name ?? code }, { label: "Bildirişlər" }]);

  if (!site || !allowed) return <p className={styles.error}>Bu bölməyə giriş icazəniz yoxdur.</p>;

  return (
    <>
      <PageHeader title="Bildirişlər" sub="Yeni müraciətlər üçün alıcıları idarə edin." />
      {settings.error ? (
        <Notice tone="bad">{settings.error}</Notice>
      ) : !settings.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <div className={styles.notifGrid}>
          <EmailBlock key={settings.data.emails.join(",")} code={code} data={settings.data} canEdit={can("NOTIFICATIONS", "UPDATE", code)} onSaved={settings.reload} />
          <TelegramBlock code={code} data={settings.data} canEdit={can("NOTIFICATIONS", "UPDATE", code)} onChanged={settings.reload} />
          {me.superAdmin && <BotBlock />}
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
    <form className={`${styles.panel} ${styles.panelPad} ${styles.form}`} onSubmit={save}>
      <div>
        <h2 className={styles.panelTitle}>E-poçt</h2>
        <p className={styles.panelSub}>Yeni müraciətlər barədə bildirişlərin göndəriləcəyi e-poçt ünvanları.</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="n-emails">Alıcıların e-poçt ünvanları</label>
        <textarea id="n-emails" className={styles.input} rows={6} value={text} onChange={(e) => setText(e.target.value)} disabled={!canEdit} />
        <span className={styles.hint}>
          Hər sətirdə bir e-poçt ünvanı yazın. Maksimum 10 ünvan əlavə edə bilərsiniz. Boş qalsa müraciətlər ümumi ünvana gedir{data.fallbackEmail ? ` (${data.fallbackEmail})` : ""}.
        </span>
      </div>
      {msg && (
        <p className={msg.ok ? styles.ok : styles.error} role="status">
          {msg.text}
        </p>
      )}
      {canEdit && (
        <div style={{ textAlign: "right" }}>
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
    <section className={`${styles.panel} ${styles.panelPad} ${styles.form}`}>
      <div>
        <h2 className={styles.panelTitle}>Telegram</h2>
        <p className={styles.panelSub}>Yeni müraciətlər barədə bildirişlərin göndəriləcəyi Telegram istifadəçiləri.</p>
      </div>
      {!data.botConfigured && <p className={styles.error}>Telegram botu hələ qoşulmayıb. Bot tokeni serverin ayarlarında verilməlidir.</p>}
      {canEdit && (
        <form
          className={styles.field}
          onSubmit={(e) => {
            e.preventDefault();
            if (!username.trim()) return;
            void run(async () => {
              await api(`panel/sites/${code}/notifications/telegram`, { method: "POST", body: { username } });
              setUsername("");
            });
          }}
        >
          <label htmlFor="tg-user">İstifadəçi adı</label>
          <div className={styles.row} style={{ flexWrap: "nowrap" }}>
            <div className={styles.inputAddon} style={{ flex: 1 }}>
              <span>@</span>
              <input id="tg-user" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))} placeholder="istifadəçi_adı" maxLength={64} />
            </div>
            <button className={`${styles.btn} ${styles.btnGold}`} disabled={busy || !username.trim()}>
              Əlavə et
            </button>
          </div>
        </form>
      )}
      <div>
        <strong style={{ fontSize: 15 }}>Əlavə edilmiş istifadəçilər</strong>
        {data.telegram.length === 0 && (
          <p className={styles.muted} style={{ marginTop: 8 }}>
            Hələ heç kim əlavə edilməyib.
          </p>
        )}
        {data.telegram.length > 0 && (
          <div className={styles.panel} style={{ marginTop: 10 }}>
            {data.telegram.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderTop: i ? "1px solid var(--line)" : 0 }}>
                <span>@{r.username}</span>
                <span className={styles.row}>
                  <Pill tone={r.connected ? "ok" : "muted"}>{r.connected ? "Qoşulub" : "Gözləyir"}</Pill>
                  {canEdit && <RowMenu items={[{ label: "Sil", icon: <Trash2 size={16} />, danger: true, onClick: () => void run(() => api(`panel/sites/${code}/notifications/telegram/${r.id}`, { method: "DELETE" })) }]} />}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {data.botConfigured && (
        <p className={styles.hint}>
          İstifadəçini əlavə etmək üçün Telegram-da {data.botUsername ? <strong>@{data.botUsername}</strong> : "botda"} <strong>/start</strong> yazın və istifadəçi adını qeyd edin.
        </p>
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
    <section className={`${styles.panel} ${styles.panelPad} ${styles.form}`}>
      <div>
        <h2 className={styles.panelTitle}>Yoxlama</h2>
        <p className={styles.panelSub}>Bildirişlərin düzgün işlədiyini yoxlamaq üçün test göndərin.</p>
      </div>
      <div>
        <button className={`${styles.btn} ${styles.btnGhost}`} disabled={busy} onClick={test}>
          <Send size={18} /> Test bildirişi göndər
        </button>
      </div>
      {msg && <p role="status" className={styles.hint}>{msg}</p>}
      <p className={styles.hint}>Test bildirişi həm e-poçt, həm də əlavə edilmiş Telegram istifadəçilərinə göndəriləcək.</p>
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
    <section className={`${styles.panel} ${styles.panelPad} ${styles.form}`}>
      <div>
        <h2 className={styles.panelTitle}>Telegram botu (Super Admin)</h2>
        <p className={styles.panelSub}>Bütün saytlar üçün ortaqdır.</p>
      </div>
      {bot.error ? (
        <p className={styles.error}>{bot.error}</p>
      ) : !bot.data ? (
        <p className={styles.loading}>Yüklənir…</p>
      ) : (
        <>
          <p>
            <Pill tone={bot.data.enabled ? "ok" : "bad"}>{bot.data.enabled ? "Qoşulub" : "Qoşulmayıb"}</Pill>{" "}
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
