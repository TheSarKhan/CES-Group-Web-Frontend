import { z } from "zod";

export const COMPANY_OPTIONS = [
  { value: "equipment", label: "CES Equipment — texnika icarəsi" },
  { value: "architect", label: "CES Architect — memarlıq və dizayn" },
  { value: "construction", label: "CES Construction — tikinti və podrat" },
  { value: "farmart", label: "Farmart — kənd təsərrüfatı" },
  { value: "general", label: "Bilmirəm / ümumi sual" },
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Adınızı yazın").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Telefon nömrəsini yazın")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Telefon nömrəsi düzgün deyil"),
  email: z.union([z.literal(""), z.email("E-poçt ünvanı düzgün deyil")]).optional(),
  company: z.enum(["equipment", "architect", "construction", "farmart", "general"], { error: "Şirkəti seçin" }),
  message: z.string().trim().min(10, "Mesaj ən azı 10 simvol olmalıdır").max(3000),
  /** honeypot — botlar doldurur, insanlar görmür */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
