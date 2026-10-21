"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
// Burada yalnız açıq sayt açarı var; token /api/contact-da gizli açarla yoxlanır.
// Açar verilməyibsə (lokal dev) widget göstərilmir və server də yoxlamanı keçir.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export const TURNSTILE_ENABLED = !!SITE_KEY;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

type Props = { onVerify: (token: string) => void; onExpire?: () => void };

export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ onVerify, onExpire }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Callback-lər yenilənəndə widget yenidən qurulmasın
  const callbacks = useRef({ onVerify, onExpire });
  callbacks.current = { onVerify, onExpire };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !container.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: SITE_KEY,
        callback: (t) => callbacks.current.onVerify(t),
        "expired-callback": () => callbacks.current.onExpire?.(),
        theme: "auto",
      });
    };

    // Skript afterInteractive yüklənir, hazır olana qədər gözlənilir
    const timer = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(timer);
        render();
      }
    }, 200);
    render();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div ref={container} />
    </>
  );
});
