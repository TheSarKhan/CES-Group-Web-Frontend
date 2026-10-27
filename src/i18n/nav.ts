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
