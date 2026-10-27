"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { localePath, type Lang } from "@/lib/i18n";
import { siteUrl } from "@/lib/urls";
import styles from "./Analytics.module.css";

/** Google Analytics 4 ölçmə ID-si (açıq məlumatdır, saytın kodunda görünməsi normaldır) */
const GA_ID = "G-M20W01RGRS";
const KEY = "ces_analytics_consent";
const EVENT = "ces-consent-change";

type State = "pending" | "off" | "unset" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const isAdminHost = () => window.location.hostname.startsWith("admin.");

function readChoice(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function writeChoice(v: "granted" | "denied" | null) {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    /* brauzer saxlamağa icazə vermir: seçim yalnız bu səhifə üçün keçərlidir */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

const snapshot = (): State => (isAdminHost() ? "off" : (readChoice() ?? "unset"));
// Server və hidrasiya zamanı heç nə göstərilmir ki, markup uyğunsuzluğu olmasın
const serverSnapshot = (): State => "pending";

function loadGa() {
  if (document.getElementById("ga4-script")) {
    window[`ga-disable-${GA_ID}`] = false;
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    (window.dataLayer as unknown[]).push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  const s = document.createElement("script");
  s.id = "ga4-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Razılıq geri götürüləndə ölçmə dayandırılır və Google cookie-ləri silinir */
function stopGa() {
  window[`ga-disable-${GA_ID}`] = true;
  const parts = window.location.hostname.split(".");
  const domains = [window.location.hostname, parts.length > 2 ? parts.slice(-2).join(".") : ""].filter(Boolean);
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
    if (!/^_ga/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${d}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

/** Uğurlu müraciətdən sonra GA4-ə hadisə göndərir (yalnız razılıq varsa gtag mövcuddur) */
export function trackLead(company: string) {
  if (!window[`ga-disable-${GA_ID}`]) window.gtag?.("event", "generate_lead", { company });
}

const BANNER: Record<Lang, { aria: string; text: string; more: string; deny: string; accept: string; settings: string }> = {
  az: {
    aria: "Cookie seçimləri",
    text: "Saytın istifadəsini ölçmək və təkmilləşdirmək üçün Google Analytics cookie-lərindən istifadə edirik. Yalnız razılığınızdan sonra işə düşür.",
    more: "Ətraflı",
    deny: "Rədd et",
    accept: "Qəbul et",
    settings: "Cookie seçimləri",
  },
  en: {
    aria: "Cookie choices",
    text: "We use Google Analytics cookies to measure and improve how the site is used. They only run after you consent.",
    more: "Details",
    deny: "Decline",
    accept: "Accept",
    settings: "Cookie settings",
  },
  ru: {
    aria: "Выбор cookie",
    text: "Мы используем cookie Google Analytics, чтобы измерять и улучшать использование сайта. Они включаются только после вашего согласия.",
    more: "Подробнее",
    deny: "Отклонить",
    accept: "Принять",
    settings: "Настройки cookie",
  },
};

export function Analytics({ lang = "az" }: { lang?: Lang }) {
  const b = BANNER[lang];
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  useEffect(() => {
    if (state === "granted") loadGa();
    else if (state === "denied") stopGa();
  }, [state]);

  if (state !== "unset") return null;
  return (
    <section className={styles.banner} role="region" aria-label={b.aria}>
      <p>
        {b.text}{" "}
        <Link href={`${siteUrl}${localePath(lang, "/mexfilik-siyaseti")}#cookie`}>{b.more}</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.deny} onClick={() => writeChoice("denied")}>
          {b.deny}
        </button>
        <button type="button" className={styles.accept} onClick={() => writeChoice("granted")}>
          {b.accept}
        </button>
      </div>
    </section>
  );
}

/** Footer-də: seçimi yenidən soruşur */
export function CookieSettingsButton({ className, lang = "az" }: { className?: string; lang?: Lang }) {
  return (
    <button type="button" className={className} onClick={() => writeChoice(null)}>
      {BANNER[lang].settings}
    </button>
  );
}
