/**
 * Subdomain saytlarının (construction.cesgroup.az, farmart.cesgroup.az) məzmunu.
 * `[...]` ilə yazılmış dəyərlər hələ təsdiqlənməyib və dəyişdirilməlidir.
 * Xidmət və layihə mətnləri müvəqqəti nümunədir, şəkillər mövcud stok foto və video kadrlarıdır.
 */

import { subdomainUrl } from "@/lib/urls";

export type SubSiteId = "construction" | "farmart";

export type SubService = {
  slug: string;
  label: string;
  image: string;
  description: string;
};

export type SubProject = {
  slug: string;
  title: string;
  category: string;
  client: string;
  duration: string;
  area: string;
  description: string;
  image: string;
  gallery: string[];
};

export type SubSite = {
  id: SubSiteId;
  name: string;
  url: string;
  /** Hero-nun böyük başlığı */
  tagline: string;
  description: string;
  video: string;
  poster: string;
  about: string[];
  services: SubService[];
  stats: { label: string; value: string }[];
  projects: SubProject[];
  cta: { title: string; text: string };
};

const MEDIA = "/media/subsites";

const construction: SubSite = {
  id: "construction",
  name: "CES Construction",
  url: subdomainUrl("construction"),
  tagline: "Layihələri Təməldən Təhvilə Qədər Ucaldırıq",
  description:
    "CES Construction yaşayış və kommersiya tikintisi, infrastruktur və yol işləri, təmir-bitirmə və baş podrat xidmətləri göstərir.",
  video: "/media/video/vid-construction",
  poster: `${MEDIA}/construction-poster.jpg`,
  about: [
    "“CES Construction yaşayış və kommersiya binalarından infrastruktur layihələrinə qədər tikinti işlərini baş podratçı kimi icra edir. Hər mərhələdə sifarişçi ilə açıq ünsiyyət, təhlükəsiz sahə və razılaşdırılmış müddətə sadiqlik əsas prinsipimizdir.”",
    "CES Architect ilə layihələndirmə, CES Equipment ilə texnika təminatı eyni qrup daxilində əlaqələndirilir. Bu, prosesi daha şəffaf və idarəolunan edir.",
  ],
  services: [
    {
      slug: "bina-tikintisi",
      label: "Bina tikintisi",
      image: "/media/ces-construction-hd.jpg",
      description:
        "Yaşayış kompleksləri, ofis və ticarət binalarının tikintisini təməl işlərindən təhvilə qədər icra edirik. Konstruksiya, mühəndis sistemləri və bitirmə işləri vahid plan üzrə, nəzarət olunan keyfiyyətlə aparılır.",
    },
    {
      slug: "infrastruktur",
      label: "İnfrastruktur",
      image: "/media/proj-karabakh.jpg",
      description:
        "Yol, körpü, kommunikasiya xətləri və ərazi abadlığı işlərini ağır texnika parkı və təcrübəli komanda ilə yerinə yetiririk. Çətin relyefdə də müddət və təhlükəsizlik qaydalarına əməl olunur.",
    },
    {
      slug: "temir-bitirme",
      label: "Təmir-bitirmə",
      image: "/media/proj-portbaku.jpg",
      description:
        "Mövcud binaların əsaslı təmiri, yenidən qurulması və daxili bitirmə işləri. Material seçimindən təhvilə qədər hər mərhələ əvvəlcədən razılaşdırılmış smeta və qrafikə əsasən aparılır.",
    },
    {
      slug: "bas-podrat",
      label: "Baş podrat",
      image: `${MEDIA}/construction-aerial.jpg`,
      description:
        "Layihənin bütün tikinti mərhələləri üçün vahid məsuliyyət daşıyırıq: alt podratçıların əlaqələndirilməsi, material və texnika təminatı, keyfiyyət və təhlükəsizlik nəzarəti.",
    },
  ],
  stats: [
    { label: "Tamamlanmış layihələr:", value: "[00+]" },
    { label: "Komanda üzvləri:", value: "[00+]" },
    { label: "İcra olunan sahə:", value: "[00 000 m²]" },
  ],
  projects: [
    {
      slug: "yasayis-kompleksi",
      title: "Yaşayış kompleksi",
      category: "Yaşayış",
      client: "[Sifarişçi]",
      duration: "[Müddət]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: "/media/ces-construction-hd.jpg",
      gallery: [`${MEDIA}/construction-aerial.jpg`, `${MEDIA}/construction-aerial-2.jpg`],
    },
    {
      slug: "ticaret-merkezi",
      title: "Ticarət mərkəzi",
      category: "Kommersiya",
      client: "[Sifarişçi]",
      duration: "[Müddət]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: "/media/proj-crescent.jpg",
      gallery: [],
    },
    {
      slug: "magistral-yol",
      title: "Magistral yol",
      category: "İnfrastruktur",
      client: "[Sifarişçi]",
      duration: "[Müddət]",
      area: "[Uzunluq]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: "/media/proj-karabakh.jpg",
      gallery: [],
    },
    {
      slug: "yasayis-qullesi",
      title: "Yaşayış qüllələri",
      category: "Yaşayış",
      client: "[Sifarişçi]",
      duration: "[Müddət]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: "/media/proj-portbaku.jpg",
      gallery: [],
    },
  ],
  cta: {
    title: "Layihənizi birlikdə quraq",
    text: "Tikinti planınızı bizimlə paylaşın, ilkin qiymətləndirmə və müddət barədə sizinlə əlaqə saxlayaq.",
  },
};

const farmart: SubSite = {
  id: "farmart",
  name: "Farmart",
  url: subdomainUrl("farmart"),
  tagline: "Torpağın Gücü, Müasir Texnikanın Dəqiqliyi",
  description: "Farmart CES Group-un kənd təsərrüfatı istiqamətidir: bitkiçilik, aqrotexnika və məhsul təchizatı.",
  video: "/media/video/vid-farmart",
  poster: `${MEDIA}/farmart-poster.jpg`,
  about: [
    "“Farmart CES Group-un kənd təsərrüfatı istiqamətidir. Müasir texnika, düzgün planlaşdırma və məsuliyyətli yanaşma ilə sahədə məhsuldarlığı və dayanıqlılığı artırmağı hədəfləyirik.”",
    "Qrupun texnika təcrübəsi Farmart-ın əkin, becərmə və yığım işlərində birbaşa istifadə olunur.",
  ],
  services: [
    {
      slug: "bitkicilik",
      label: "Bitkiçilik",
      image: "/media/farmart-hd.jpg",
      description:
        "Taxıl və digər kənd təsərrüfatı bitkilərinin əkini, becərilməsi və yığımı. Hər sahə üçün əkin planı torpağın xüsusiyyətlərinə və mövsümə uyğun hazırlanır.",
    },
    {
      slug: "aqrotexnika",
      label: "Aqrotexnika",
      image: `${MEDIA}/farmart-combine-close.jpg`,
      description:
        "Kombayn, traktor və digər kənd təsərrüfatı texnikası ilə mövsümi işlərin icrası. Texnika sertifikatlı operatorlarla və vaxtında texniki baxışla təmin olunur.",
    },
    {
      slug: "mehsul-techizati",
      label: "Məhsul təchizatı",
      image: `${MEDIA}/farmart-field.jpg`,
      description:
        "Yığılmış məhsulun saxlanması, çeşidlənməsi və tərəfdaşlara çatdırılması. Təchizat şərtləri hər tərəfdaşla əvvəlcədən razılaşdırılır.",
    },
  ],
  stats: [
    { label: "Əkin sahəsi:", value: "[000 ha]" },
    { label: "Texnika vahidi:", value: "[00+]" },
    { label: "Tərəfdaşlar:", value: "[00+]" },
  ],
  projects: [
    {
      slug: "taxil-sahesi",
      title: "Taxıl sahəsi",
      category: "Bitkiçilik",
      client: "[Təsərrüfat]",
      duration: "[Mövsüm]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: "/media/farmart-hd.jpg",
      gallery: [`${MEDIA}/farmart-combine-side.jpg`, `${MEDIA}/farmart-field.jpg`],
    },
    {
      slug: "bicin-movsumu",
      title: "Biçin mövsümü",
      category: "Aqrotexnika",
      client: "[Təsərrüfat]",
      duration: "[Mövsüm]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: `${MEDIA}/farmart-combine-close.jpg`,
      gallery: [],
    },
    {
      slug: "texnika-parki",
      title: "Texnika parkı",
      category: "Aqrotexnika",
      client: "[Təsərrüfat]",
      duration: "[Mövsüm]",
      area: "[Sahə]",
      description: "[Layihənin təsviri əlavə olunacaq.]",
      image: `${MEDIA}/farmart-combine-side.jpg`,
      gallery: [],
    },
  ],
  cta: {
    title: "Gəlin birlikdə əkək",
    text: "Tərəfdaşlıq və ya təchizat barədə sorğunuzu göndərin, sizinlə əlaqə saxlayaq.",
  },
};

export const subsites: Record<SubSiteId, SubSite> = { construction, farmart };

export const subsiteIds = Object.keys(subsites) as SubSiteId[];

export const isSubSiteId = (v: string): v is SubSiteId => v in subsites;

/** Subdomain saytlarının menyusu (Architecture saytı ilə eyni bölmələr) */
export const subNav = [
  { label: "Haqqımızda", href: "/#haqqimizda" },
  { label: "Xidmətlərimiz", href: "/xidmetlerimiz" },
  { label: "Layihələrimiz", href: "/layihelerimiz" },
  { label: "Əlaqə", href: "/elaqe" },
];
