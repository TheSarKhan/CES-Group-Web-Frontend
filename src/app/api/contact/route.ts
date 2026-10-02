import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY_OPTIONS, contactSchema, type ContactInput } from "@/lib/contact-schema";

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

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Çox sayda müraciət. Bir az sonra yenidən cəhd edin." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Yanlış sorğu." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Formada səhv var.", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  // Bot honeypot-u doldurubsa, uğurlu kimi cavab ver, amma heç nə göndərmə
  if (data.website) return NextResponse.json({ ok: true });

  const companyLabel = COMPANY_OPTIONS.find((o) => o.value === data.company)?.label ?? data.company;
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
    return NextResponse.json({ ok: false, error: "Müraciət hazırda qəbul olunmur. Zəhmət olmasa telefonla əlaqə saxlayın." }, { status: 503 });
  }

  const results = await Promise.allSettled(tasks);
  const delivered = results.filter((r) => r.status === "fulfilled").length;
  results.forEach((r, i) => r.status === "rejected" && console.error(`[contact] ${channels[i]} xətası:`, r.reason));

  if (delivered === 0) {
    return NextResponse.json({ ok: false, error: "Müraciət göndərilmədi. Bir az sonra yenidən cəhd edin." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
