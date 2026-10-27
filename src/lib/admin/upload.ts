"use client";

const MAX_SIDE = 1920;

/** Fotoları yükləmədən əvvəl kiçildir (böyük telefon şəkilləri saytı yavaşlatmasın). SVG və GIF toxunulmaz qalır. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    // PNG-də şəffaflıq (loqolar) qorunur, fotolar WebP olur
    const type = file.type === "image/png" ? "image/png" : "image/webp";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.86));
    if (!blob || blob.size >= file.size) return file;
    const ext = type === "image/png" ? "png" : "webp";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type });
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const prepared = await shrink(file);
  const form = new FormData();
  form.append("file", prepared);
  form.append("folder", folder);
  const res = await fetch("/api/admin/admin/uploads", { method: "POST", body: form });
  if (res.status === 401) {
    window.location.replace("/login");
    throw new Error("Sessiya bitib.");
  }
  const json = (await res.json().catch(() => null)) as { url?: string; message?: string } | null;
  if (!res.ok || !json?.url) throw new Error(json?.message ?? "Şəkil yüklənmədi.");
  return json.url;
}

/** DB-də nisbi yol ola bilər; önizləmə üçün Texnika saytının ünvanı əlavə olunur */
export const previewUrl = (v: string) => (v.startsWith("/") ? `https://equipment.cesgroup.az${v}` : v);
