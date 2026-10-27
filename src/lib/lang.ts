import { notFound } from "next/navigation";
import { availableLangs, type PageRef } from "@/content/loaders";
import { ENABLED_LANGS, isLang, type Lang } from "./i18n";

/**
 * Səhifənin dili və açıq olduğu dillər. Dil tanınmırsa və ya səhifənin məzmunu həmin dildə tam tərcümə olunmayıbsa 404.
 * `switcher` Header-in dil seçicisinə verilir (bir dil varsa seçici görünmür).
 */
export async function pageContext(params: Promise<{ lang: string }>, ref: PageRef, path: string) {
  const { lang } = await params;
  if (!isLang(lang) || !ENABLED_LANGS.includes(lang)) notFound();
  const langs = await availableLangs(ref);
  if (!langs.includes(lang)) notFound();
  return { lang: lang as Lang, langs, switcher: { path, langs } };
}
