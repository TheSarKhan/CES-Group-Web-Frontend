/** llms.txt mətnlərinin dilli şablonları (süni intellekt sistemləri üçün; məzmun özü paneldən gəlir, burada yalnız çərçivə mətni var) */
import type { Lang } from "@/lib/i18n";

type Group = {
  intro: (name: string) => string;
  companies: string;
  companySite: string;
  facts: string;
  legalName: string;
  founded: (date: string) => string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  area: string;
  projects: string;
  faq: string;
  pages: string;
  pageLinks: { companies: [string, string]; faq: [string, string]; about: [string, string]; projects: [string, string]; contact: [string, string]; privacy: [string, string]; terms: [string, string] };
};

type Sub = {
  companyOf: (name: string, group: string, extra: string, groupUrl: string) => string;
  since: (legal: string, year: string) => string;
  services: string;
  projects: string;
  contact: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  contactPage: string;
};

export const GROUP_LLMS: Record<Lang, Group> = {
  az: {
    intro: (n) => `${n} dörd şirkəti birləşdirir: memarlıq (CES Architect), tikinti və podrat (CES Construction), ağır texnika icarəsi (CES Equipment) və innovativ və təbii ekosistem (Farmart). Sifarişçi layihənin dizaynından icrasına və texnika təminatına qədər bütün mərhələlər üçün bir komanda ilə işləyir.`,
    companies: "Şirkətlər",
    companySite: "Şirkətin saytı",
    facts: "Əsas faktlar",
    legalName: "Hüquqi ad",
    founded: (d) => `Qurulma: ${d} (CES ağır texnika icarəsi ilə başlayıb)`,
    address: "Ünvan",
    phone: "Telefon və WhatsApp",
    email: "E-poçt",
    hours: "İş saatları",
    area: "Xidmət ərazisi: bütün Azərbaycan",
    projects: "Layihələr",
    faq: "Tez-tez verilən suallar",
    pages: "Səhifələr",
    pageLinks: {
      companies: ["Şirkətlər", "Dörd şirkətin təsviri, xidmətləri, rəqəmləri və layihələri"],
      faq: ["Tez-tez verilən suallar", "Texnika icarəsi, memarlıq, tikinti və Farmart üzrə suallar və cavablar"],
      about: ["Haqqımızda", "Qrupun tarixi, missiyası, dəyərləri və şirkətlərin strukturu"],
      projects: ["Layihələr", "İştirak etdiyimiz layihələrin siyahısı"],
      contact: ["Əlaqə", "Müraciət forması, telefon, e-poçt və ünvan"],
      privacy: ["Məxfilik siyasəti", "Şəxsi məlumatların emalı"],
      terms: ["İstifadə şərtləri", "Saytdan istifadə qaydaları"],
    },
  },
  en: {
    intro: (n) => `${n} unites four companies: architecture (CES Architect), construction and contracting (CES Construction), heavy equipment rental (CES Equipment) and an innovative and natural ecosystem (Farmart). The client works with one team for every stage, from design to execution and equipment supply.`,
    companies: "Companies",
    companySite: "Company website",
    facts: "Key facts",
    legalName: "Legal name",
    founded: (d) => `Founded: ${d} (CES started with heavy equipment rental)`,
    address: "Address",
    phone: "Phone and WhatsApp",
    email: "E-mail",
    hours: "Working hours",
    area: "Service area: all of Azerbaijan",
    projects: "Projects",
    faq: "Frequently asked questions",
    pages: "Pages",
    pageLinks: {
      companies: ["Companies", "Description, services, figures and projects of the four companies"],
      faq: ["Frequently asked questions", "Questions and answers on equipment rental, architecture, construction and Farmart"],
      about: ["About us", "The group’s history, mission, values and structure"],
      projects: ["Projects", "The projects we have taken part in"],
      contact: ["Contact", "Request form, phone, e-mail and address"],
      privacy: ["Privacy policy", "How personal data is processed"],
      terms: ["Terms of use", "Rules for using the website"],
    },
  },
  ru: {
    intro: (n) => `${n} объединяет четыре компании: архитектура (CES Architect), строительство и подряд (CES Construction), аренда тяжёлой техники (CES Equipment) и инновационная и природная экосистема (Farmart). Заказчик работает с одной командой на всех этапах: от проектирования до выполнения и обеспечения техникой.`,
    companies: "Компании",
    companySite: "Сайт компании",
    facts: "Основные факты",
    legalName: "Юридическое название",
    founded: (d) => `Основана: ${d} (CES начала с аренды тяжёлой техники)`,
    address: "Адрес",
    phone: "Телефон и WhatsApp",
    email: "E-mail",
    hours: "Часы работы",
    area: "Зона обслуживания: весь Азербайджан",
    projects: "Проекты",
    faq: "Часто задаваемые вопросы",
    pages: "Страницы",
    pageLinks: {
      companies: ["Компании", "Описание, услуги, показатели и проекты четырёх компаний"],
      faq: ["Часто задаваемые вопросы", "Вопросы и ответы об аренде техники, архитектуре, строительстве и Farmart"],
      about: ["О нас", "История, миссия, ценности и структура группы"],
      projects: ["Проекты", "Список проектов, в которых мы участвовали"],
      contact: ["Контакты", "Форма обращения, телефон, e-mail и адрес"],
      privacy: ["Политика конфиденциальности", "Обработка персональных данных"],
      terms: ["Условия использования", "Правила пользования сайтом"],
    },
  },
};

export const SUB_LLMS: Record<Lang, Sub> = {
  az: {
    companyOf: (n, g, extra, url) => `${n} ${g} qrupunun şirkətidir${extra}. Qrupun ana səhifəsi: ${url}`,
    since: (legal, y) => ` (${legal}, ${y}-ci ildən)`,
    services: "Xidmətlər",
    projects: "Layihələr",
    contact: "Əlaqə",
    address: "Ünvan",
    phone: "Telefon və WhatsApp",
    email: "E-poçt",
    hours: "İş saatları",
    contactPage: "Əlaqə səhifəsi (müraciət forması)",
  },
  en: {
    companyOf: (n, g, extra, url) => `${n} is a company of ${g}${extra}. Group home page: ${url}`,
    since: (legal, y) => ` (${legal}, since ${y})`,
    services: "Services",
    projects: "Projects",
    contact: "Contact",
    address: "Address",
    phone: "Phone and WhatsApp",
    email: "E-mail",
    hours: "Working hours",
    contactPage: "Contact page (request form)",
  },
  ru: {
    companyOf: (n, g, extra, url) => `${n} — компания группы ${g}${extra}. Главная страница группы: ${url}`,
    since: (legal, y) => ` (${legal}, с ${y} года)`,
    services: "Услуги",
    projects: "Проекты",
    contact: "Контакты",
    address: "Адрес",
    phone: "Телефон и WhatsApp",
    email: "E-mail",
    hours: "Часы работы",
    contactPage: "Страница контактов (форма обращения)",
  },
};
