import { draftMode } from "next/headers";

/** Önizləmə rejimində səhifənin küncündə görünür; adi ziyarətçi üçün heç nə göstərilmir */
export async function PreviewBadge() {
  if (!(await draftMode()).isEnabled) return null;
  return (
    <div style={{ position: "fixed", left: 12, bottom: 12, zIndex: 2000, background: "#1e1e21", color: "#fff", padding: "8px 14px", borderRadius: 6, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}>
      Önizləmə rejimi (qaralama görünür) ·{" "}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/preview?exit=1" style={{ color: "#e8c46b", textDecoration: "underline" }}>
        Çıx
      </a>
    </div>
  );
}
