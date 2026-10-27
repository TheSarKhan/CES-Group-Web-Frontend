import type { Dict } from "./ui";

/** Əsas menyu və altbilgi menyusu: açar tərcümə lüğətindəki `nav` açarıdır */
export const NAV: { key: keyof Dict["nav"]; href: string }[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/haqqimizda" },
  { key: "companies", href: "/sirketler" },
  { key: "projects", href: "/layiheler" },
  { key: "contact", href: "/elaqe" },
];
export const FOOTER_NAV = [...NAV, { key: "faq" as const, href: "/suallar" }];

/** Alt saytların menyusu (az URL-ləri); `/#haqqimizda` ana səhifənin bölməsinə aparır */
export const SUB_NAV: { key: keyof Dict["sub"]["nav"]; href: string }[] = [
  { key: "about", href: "/#haqqimizda" },
  { key: "services", href: "/xidmetlerimiz" },
  { key: "projects", href: "/layihelerimiz" },
  { key: "contact", href: "/elaqe" },
];
