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
  /** Qısa təsvir: kartlarda, meta description-da və səhifənin əsas abzasında */
  description: string;
  /** Xidmət səhifəsində əlavə izah abzasları */
  body?: string[];
  /** "Nələr daxildir" siyahısı */
  includes?: string[];
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
  /** Real foto və məlumat gələnə qədər layihə səhifəsi axtarışa açılmır */
  draft?: boolean;
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
      body: [
        "CES Construction fərdi yaşayış evləri, villalar, bağ evləri və otel konsepsiyalı obyektlər kimi bina layihələrini icra edir. İşlər layihə sənədlərinə və sifarişçi ilə razılaşdırılmış qrafikə uyğun aparılır.",
        "Layihələndirmə lazımdırsa, CES Architect ilə, texnika təminatı lazımdırsa, CES Equipment ilə iş qrup daxilində əlaqələndirilir. Sifarişçi bütün mərhələlərdə bir tərəflə ünsiyyətdə olur.",
      ],
      includes: [
        "Təməl və konstruksiya işləri",
        "Divar, dam və fasad işləri",
        "Mühəndis sistemləri: su, elektrik, istilik və havalandırma",
        "Daxili bitirmə işləri",
        "Obyektin təhvili",
      ],
    },
    {
      slug: "infrastruktur",
      label: "İnfrastruktur",
      image: "/media/proj-karabakh.jpg",
      description:
        "Yol, körpü, kommunikasiya xətləri və ərazi abadlığı işlərini ağır texnika parkı və təcrübəli komanda ilə yerinə yetiririk. Çətin relyefdə də müddət və təhlükəsizlik qaydalarına əməl olunur.",
      body: [
        "İnfrastruktur layihələrində işlərin həcmi böyük, müddət isə sıx olur. Bu səbəbdən planlaşdırma, material və texnika təminatı əvvəlcədən əlaqələndirilir.",
        "Texnika təminatı qrup daxilində CES Equipment ilə birgə təşkil oluna bilər. Bu, sahədə gözləmə müddətini azaldır və məsuliyyəti bir yerə toplayır.",
      ],
      includes: [
        "Yol və yol örtüyü işləri",
        "Kommunikasiya xətlərinin çəkilişi",
        "Ərazi hazırlığı və planlaşdırma",
        "Ərazi abadlığı",
        "İşlərin təhvili",
      ],
    },
    {
      slug: "temir-bitirme",
      label: "Təmir-bitirmə",
      image: "/media/proj-portbaku.jpg",
      description:
        "Mövcud binaların əsaslı təmiri, yenidən qurulması və daxili bitirmə işləri. Material seçimindən təhvilə qədər hər mərhələ əvvəlcədən razılaşdırılmış smeta və qrafikə əsasən aparılır.",
      body: [
        "CES Construction fərdi yaşayış evlərinin və ofislərin təmir-bitirmə işlərini icra edir. İş başlamazdan əvvəl həcm müəyyən edilir, smeta və qrafik sifarişçi ilə razılaşdırılır.",
        "Material seçimi və iş ardıcıllığı əvvəlcədən müzakirə olunur, ona görə sifarişçi hər mərhələdə nəyin və nə vaxt görüləcəyini bilir.",
      ],
      includes: [
        "İlkin baxış və smeta",
        "Sökmə və hazırlıq işləri",
        "Elektrik və santexnika işləri",
        "Hamarlama, boya, döşəmə və tavan işləri",
        "Təhvil",
      ],
    },
    {
      slug: "bas-podrat",
      label: "Baş podrat",
      image: `${MEDIA}/construction-aerial.jpg`,
      description:
        "Layihənin bütün tikinti mərhələləri üçün vahid məsuliyyət daşıyırıq: alt podratçıların əlaqələndirilməsi, material və texnika təminatı, keyfiyyət və təhlükəsizlik nəzarəti.",
      body: [
        "Baş podrat modelində CES Construction layihənin bütün tikinti mərhələləri üçün vahid məsuliyyət daşıyır. Sifarişçi hər iş növü üçün ayrı podratçı axtarmır və onları ayrıca əlaqələndirmir.",
        "Layihələndirmə (CES Architect) və texnika təminatı (CES Equipment) eyni qrup daxilində olduğu üçün layihənin dizaynından təhvilinə qədər proses vahid plan üzrə idarə olunur.",
      ],
      includes: [
        "Alt podratçıların seçimi və əlaqələndirilməsi",
        "Material və texnika təminatı",
        "Qrafikə və smetaya nəzarət",
        "Keyfiyyət nəzarəti",
        "Təhlükəsizlik nəzarəti",
      ],
    },
  ],
  stats: [
    { label: "Tamamlanmış layihələr:", value: "10" },
    { label: "Komanda üzvləri:", value: "[00+]" },
    { label: "İcra olunan sahə:", value: "[00 000 m²]" },
  ],
  projects: [
    {
      slug: "bag-evi",
      title: "Bağ evi",
      category: "Fərdi yaşayış",
      client: "[...]",
      duration: "[...]",
      area: "[...]",
      description: "CES Construction bağ evi tikintisi layihələrini təməldən təhvilə qədər icra edir.",
      image: `${MEDIA}/construction-aerial.jpg`,
      gallery: [],
      draft: true,
    },
    {
      slug: "otel-konsepsiyasi",
      title: "Otel konsepsiyası",
      category: "Qonaqlama",
      client: "[...]",
      duration: "[...]",
      area: "[...]",
      description: "Otel konsepsiyalı obyektlərin tikintisi və təchizatı CES Construction tərəfindən icra olunur.",
      image: `${MEDIA}/construction-hospitality.jpg`,
      gallery: [],
      draft: true,
    },
    {
      slug: "villa",
      title: "Villa",
      category: "Fərdi yaşayış",
      client: "[...]",
      duration: "[...]",
      area: "[...]",
      description: "CES Construction villa tikintisini layihə sənədlərinə və razılaşdırılmış qrafikə uyğun icra edir.",
      image: "/media/ces-architect-villa-hd.jpg",
      gallery: [],
      draft: true,
    },
    {
      slug: "ferdi-yasayis-evi",
      title: "Fərdi yaşayış evi",
      category: "Fərdi yaşayış",
      client: "[...]",
      duration: "[...]",
      area: "[...]",
      description: "Fərdi yaşayış evlərinin tikintisi və bitirmə işləri vahid plan üzrə aparılır.",
      image: `${MEDIA}/construction-house.jpg`,
      gallery: [],
      draft: true,
    },
    {
      slug: "ofis-temiri",
      title: "Ofis təmiri",
      category: "Kommersiya",
      client: "[...]",
      duration: "[...]",
      area: "[...]",
      description: "Ofislərin təmir-bitirmə işləri əvvəlcədən razılaşdırılmış smeta və qrafikə əsasən icra olunur.",
      image: `${MEDIA}/construction-office.jpg`,
      gallery: [],
      draft: true,
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
  tagline: "İnnovativ və Təbii Ekosistem",
  description:
    "Farmart CES Group-un innovativ və təbii ekosistemidir: kotteclər, əyləncə mərkəzləri, innovativ ferma və əkinçilik üçün B2B texnika icarəsi.",
  video: "/media/video/vid-farmart",
  poster: `${MEDIA}/farmart-poster.jpg`,
  about: [
    "“Farmart innovativ və təbii ekosistemdir. Burada insanlar kotteclərdən, əyləncə mərkəzlərindən və innovativ fermadan yararlana biləcək.”",
    "Əkinçilik və digər sahələr üçün B2B texnika icarəsi də Farmart-ın imkanları sırasında olacaq.",
  ],
  services: [
    {
      slug: "kottecler",
      label: "Kotteclər",
      image: `${MEDIA}/farmart-field.jpg`,
      description: "Təbiətlə iç-içə istirahət üçün nəzərdə tutulan kotteclər Farmart ekosisteminin tərkib hissəsi olacaq.",
    },
    {
      slug: "eylence-merkezleri",
      label: "Əyləncə mərkəzləri",
      image: "/media/farmart-hd.jpg",
      description: "Ailə və qonaqlar üçün əyləncə və istirahət məkanları Farmart ekosistemində yer alacaq.",
    },
    {
      slug: "innovativ-ferma",
      label: "İnnovativ ferma",
      image: `${MEDIA}/farmart-combine-close.jpg`,
      description: "Müasir texnologiya və dəqiq planlaşdırma ilə idarə olunan ferma: məhsuldar və dayanıqlı kənd təsərrüfatı.",
    },
    {
      slug: "b2b-texnika-icaresi",
      label: "B2B texnika icarəsi",
      image: `${MEDIA}/farmart-combine-side.jpg`,
      description: "Əkinçilik və digər sahələr üçün müəssisələrə texnika icarəsi Farmart-ın təklifləri sırasında olacaq.",
    },
  ],
  stats: [
    { label: "Əkin sahəsi:", value: "[000 ha]" },
    { label: "Texnika vahidi:", value: "[00+]" },
    { label: "Tərəfdaşlar:", value: "[00+]" },
  ],
  projects: [],
  cta: {
    title: "Ekosistemə qoşulun",
    text: "Kottec, əyləncə, ferma və ya texnika icarəsi barədə sorğunuzu göndərin, sizinlə əlaqə saxlayaq.",
  },
};

export const subsites: Record<SubSiteId, SubSite> = { construction, farmart };

export const subsiteIds = Object.keys(subsites) as SubSiteId[];

/** `[...]` ilə başlayan dəyər hələ real məlumatla əvəz olunmayıb */
export const isTbd = (v: string) => v.trim().startsWith("[");

/** Təsviri yazılmayan layihə səhifəsi axtarışa açılmır */
export const isReadyProject = (p: SubProject) => !p.draft && !isTbd(p.description);

export const isSubSiteId = (v: string): v is SubSiteId => v in subsites;

/** Layihəsi olmayan saytın menyusunda "Layihələrimiz" göstərilmir */
export const navFor = (site: SubSite) => subNav.filter((n) => n.href !== "/layihelerimiz" || site.projects.length > 0);

/** Subdomain saytlarının menyusu (Architecture saytı ilə eyni bölmələr) */
export const subNav = [
  { label: "Haqqımızda", href: "/#haqqimizda" },
  { label: "Xidmətlərimiz", href: "/xidmetlerimiz" },
  { label: "Layihələrimiz", href: "/layihelerimiz" },
  { label: "Əlaqə", href: "/elaqe" },
];
