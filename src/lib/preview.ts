import { cookies, draftMode } from "next/headers";

/** Önizləmə: panel-dən açılan qısa ömürlü işarə (10 dəqiqə). Cookie-nin adı və /api/preview marşrutu ilə birlikdə işləyir. */
export const PREVIEW_COOKIE = "ces_preview";

/**
 * Önizləmə rejimi yalnız `draftMode` açıq olanda aktivdir (yəni /api/preview-dən keçmiş brauzerdə). Adi ziyarətçi üçün bu funksiya
 * heç nə oxumur, ona görə səhifələr statik qalır. İşarə tək bir qeydin qaralamasını açır, qalan məzmun dərc olunmuş halda gəlir.
 */
export async function previewToken(): Promise<string | null> {
  try {
    if (!(await draftMode()).isEnabled) return null;
    return (await cookies()).get(PREVIEW_COOKIE)?.value ?? null;
  } catch {
    // build zamanı (sorğu konteksti yoxdur)
    return null;
  }
}

/** İşarənin adlandırdığı qeyd (imza yoxlanmır: backend özü yoxlayır, etibarsız işarə dərc olunmuş məzmun qaytarır) */
export function previewTarget(token: string): { site: string; type: string; slug: string } | null {
  try {
    const [site, type, slug] = Buffer.from(token.split(".")[0], "base64url").toString("utf8").split("|");
    return site && type && slug ? { site, type, slug } : null;
  } catch {
    return null;
  }
}
