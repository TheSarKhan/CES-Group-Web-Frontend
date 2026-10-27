import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getUi } from "@/i18n/ui";
import { companyOptions, makeContactSchema, type ContactInput } from "@/lib/contact-schema";
import { isLang, type Lang } from "@/lib/i18n";

export const runtime = "nodejs";

const RECIPIENT_ENV: Record<ContactInput["company"], string | undefined> = {
  equipment: process.env.CONTACT_EMAIL_EQUIPMENT,
  architect: process.env.CONTACT_EMAIL_ARCHITECT,
  construction: process.env.CONTACT_EMAIL_CONSTRUCTION,
  farmart: process.env.CONTACT_EMAIL_FARMART,
  general: undefined,
};

// Sadə yaddaş daxili limit: bir IP-dən dəqiqədə 5 müraciət (serverless instansiya üzrə)
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

/** Cloudflare Turnstile tokenini yoxlayır. Gizli açar verilməyibsə (lokal dev) yoxlama keçilir. */
async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch (err) {
    console.error("[contact] Turnstile yoxlaması alınmadı:", err);
    return false;
  }
}

const BACKEND_URL = process.env.BACKEND_URL;

/** Müraciətin hansı saytın formasından gəldiyi (construction.cesgroup.az → construction) */
function originSite(host: string | null) {
  const name = (host ?? "").split(":")[0].toLowerCase().split(".")[0];
  return name === "construction" || name === "farmart" ? name : "group";
}

type Forwarded = { kind: "ok" } | { kind: "rejected"; status: number; message: string } | { kind: "unavailable" };

/**
 * Müraciəti backend-ə (vahid müraciətlər + sayt üzrə bildiriş) ötürür. Backend əlçatmaz olarsa və ya 5xx qaytarsa
 * "unavailable" qaytarılır və aşağıdakı birbaşa e-poçt/Telegram yolu işə düşür ki, müraciət itməsin.
 */
async function forwardToBackend(data: ContactInput, ip: string, host: string | null, userAgent: string | null, lang: Lang): Promise<Forwarded> {
  const msg = getUi(lang).form.server;
  if (!BACKEND_URL) return { kind: "unavailable" };
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json", "X-Forwarded-For": ip };
    if (userAgent) headers["User-Agent"] = userAgent;
    const res = await fetch(`${BACKEND_URL}/api/v1/public/submissions`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      body: JSON.stringify({
        site: originSite(host),
        company: data.company,
        type: "CONTACT",
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        message: data.message,
        turnstileToken: data.turnstileToken,
      }),
    });
    if (res.ok) return { kind: "ok" };
    if (res.status >= 500) return { kind: "unavailable" };
    return { kind: "rejected", status: res.status, message: res.status === 429 ? msg.rate : msg.invalid };
  } catch (err) {
    console.error("[contact] Backend əlçatmazdır, birbaşa kanallara keçilir:", err);
    return { kind: "unavailable" };
  }
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: getUi("az").form.server.rate }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: getUi("az").form.server.badRequest }, { status: 400 });
  }

  // Formun dili: xəta mesajları həmin dildə qaytarılır
  const rawLang = (body as { lang?: unknown } | null)?.lang;
  const lang: Lang = typeof rawLang === "string" && isLang(rawLang) ? rawLang : "az";
  const msg = getUi(lang).form.server;

  const parsed = makeContactSchema(lang).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: msg.invalid, fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  // Bot honeypot-u doldurubsa, uğurlu kimi cavab ver, amma heç nə göndərmə
  if (data.website) return NextResponse.json({ ok: true });

  const forwarded = await forwardToBackend(data, ip, req.headers.get("host"), req.headers.get("user-agent"), lang);
  if (forwarded.kind === "ok") return NextResponse.json({ ok: true });
  if (forwarded.kind === "rejected") return NextResponse.json({ ok: false, error: forwarded.message }, { status: forwarded.status });

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return NextResponse.json({ ok: false, error: msg.turnstileFailed }, { status: 400 });
  }

  // Daxili bildirişlər həmişə azərbaycanca yazılır (komanda üçün)
  const companyLabel = companyOptions("az").find((o) => o.value === data.company)?.label ?? data.company;
  const lines = [
    `Şirkət: ${companyLabel}`,
    `Ad: ${data.name}`,
    `Telefon: ${data.phone}`,
    `E-poçt: ${data.email || "—"}`,
    "",
    data.message,
  ];

  const tasks: Promise<unknown>[] = [];
  const channels: string[] = [];

  // Email
  const to = RECIPIENT_ENV[data.company] || process.env.CONTACT_FALLBACK_EMAIL;
  if (process.env.SMTP_HOST && to) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: (process.env.SMTP_SECURE ?? "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    channels.push("email");
    tasks.push(
      transporter.sendMail({
        from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
        to,
        replyTo: data.email || undefined,
        subject: `Saytdan müraciət — ${companyLabel}`,
        text: lines.join("\n"),
        html: `<p>${lines.map(escapeHtml).join("<br>")}</p>`,
      }),
    );
  }

  // Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    channels.push("telegram");
    tasks.push(
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: ["Saytdan yeni müraciət", ...lines].join("\n"),
          disable_web_page_preview: true,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Telegram ${r.status}`);
      }),
    );
  }

  if (tasks.length === 0) {
    console.error("[contact] Heç bir kanal konfiqurasiya olunmayıb (SMTP_* və ya TELEGRAM_* env dəyişənləri).");
    return NextResponse.json({ ok: false, error: msg.unavailable }, { status: 503 });
  }

  const results = await Promise.allSettled(tasks);
  const delivered = results.filter((r) => r.status === "fulfilled").length;
  results.forEach((r, i) => r.status === "rejected" && console.error(`[contact] ${channels[i]} xətası:`, r.reason));

  if (delivered === 0) {
    return NextResponse.json({ ok: false, error: msg.notSent }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
