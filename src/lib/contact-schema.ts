import { z } from "zod";
import { getUi } from "@/i18n/ui";
import type { Lang } from "./i18n";

export const COMPANY_VALUES = ["equipment", "architect", "construction", "farmart", "general"] as const;

/** Seçim siyahısı (etiketlər dilə görə i18n/ui.ts-dəki `companyOptions`-dan gəlir) */
export const companyOptions = (lang: Lang) => COMPANY_VALUES.map((value) => ({ value, label: getUi(lang).companyOptions[value] }));
export const COMPANY_OPTIONS = companyOptions("az");

/** Doğrulama mesajları seçilmiş dildə qaytarılır */
export const makeContactSchema = (lang: Lang) => {
  const v = getUi(lang).form.v;
  return z.object({
    name: z.string().trim().min(2, v.name).max(100),
    phone: z
      .string()
      .trim()
      .min(7, v.phone)
      .max(30)
      .regex(/^[+\d\s()-]+$/, v.phoneFormat),
    email: z.union([z.literal(""), z.email(v.email)]).optional(),
    company: z.enum(COMPANY_VALUES, { error: v.company }),
    message: z.string().trim().min(10, v.message).max(3000),
    /** Cloudflare Turnstile tokeni (açar konfiqurasiya olunubsa məcburidir, /api/contact yoxlayır) */
    turnstileToken: z.string().max(2048).optional(),
    /** honeypot — botlar doldurur, insanlar görmür */
    website: z.string().max(0).optional(),
  });
};

export const contactSchema = makeContactSchema("az");
export type ContactInput = z.infer<typeof contactSchema>;
