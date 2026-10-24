/**
 * Saytın bütün mətn və məlumatları bu fayldadır.
 * `[...]` ilə yazılmış dəyərlər hələ təsdiqlənməyib və dəyişdirilməlidir.
 */

import { externalUrls, siteUrl, subdomainUrl } from "@/lib/urls";

export type CompanyId = "equipment" | "architect" | "construction" | "farmart";

export type Company = {
  id: CompanyId;
  name: string;
  /** Hero panelində göstərilən qısa ad ("CES" olmadan) */
  shortName: string;
  /** Rəsmi hüquqi ad (Architect və Construction eyni hüquqi şəxsdir) */
  legalName: string;
  /** Yaradılma tarixi (schema.org üçün: il və ya tam tarix) */
  founded: string;
  field: string;
  description: string;
  /** true: şirkət hələ tam fəaliyyətə başlamayıb, xidmətlər "olacaq" kimi yazılır və schema-ya əlavə olunmur */
  planned?: boolean;
  url: string;
  image: string;
  imageAlt: string;
  /** Hero panelində şəklin hansı hissəsinin görünəcəyi (CSS object-position), məs. "50% 70%" */
  focus?: string;
  /** Videonun posteri (video yüklənənə qədər). Verilməsə, panel şəkli istifadə olunur */
  poster?: string;
  /** Videonun yolu, uzantısız: həm .mp4, həm .webm faylı olmalıdır */
  video: string;
};

export const site = {
  name: "CES Group",
  url: siteUrl,
  description:
    "CES Group: Azərbaycanda memarlıq, tikinti, ağır texnika icarəsi və innovativ ekosistem. Layihənin dizaynından təhvilinə qədər bir komanda.",
  founded: 2020,
  /** Rəsmi qurulma tarixi (ISO), schema.org üçün */
  foundingDate: "2020-09-03",
  /** Qrupun əsas hüquqi şəxsi (Equipment) */
  legalName: "Construction Equipment Services MMC",
  /** Həftə içi iş saatları: schema.org üçün opens/closes və göstəriləcək mətn */
  hours: { opens: "08:00", closes: "17:00", label: "Bazar ertəsi – Cümə, 08:00–17:00" },
  /** Google Maps-da şirkətin kartı */
  mapUrl: "https://maps.app.goo.gl/L8Sgk6ZsaQh2LUXu9",
  /** Bütün brendlərin (qrup, Equipment, Architect, Construction, Farmart) ortaq əlaqə məlumatı */
  address: "Qaradağ ray, Salyan şossesi, Lökbatan yolu, 22A, Bakı",
  /** Ünvanın hissələri: schema.org PostalAddress üçün */
  addressParts: { street: "Salyan şossesi, Lökbatan yolu, 22A", region: "Qaradağ rayonu", city: "Bakı" },
  mapQuery: "Construction Equipment Services MMC, Lökbatan yolu, Bakı",
  email: "sales@ces.com.az",
  phone: "+994 51 290 42 80",
  /** WhatsApp bütün saytda əsas telefonla eyni nömrədir */
  whatsapp: "https://wa.me/994512904280",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/construction_es/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/construction-equipment-services-llc/home/" },
    { label: "Facebook", href: "https://www.facebook.com/p/Construction-Equipment-Services-LLC-100076846233793/" },
  ],
};

export const nav = [
  { label: "Ana səhifə", href: "/" },
  { label: "Haqqımızda", href: "/haqqimizda" },
  { label: "Şirkətlər", href: "/#sirketler" },
  { label: "Layihələr", href: "/layiheler" },
  { label: "Əlaqə", href: "/elaqe" },
];

/** Footer-də əsas menyuya əlavə olaraq göstərilən səhifələr */
export const footerNav = [...nav, { label: "Suallar", href: "/suallar" }];

/** Hero-dakı sıra: yuxarı, sağ, aşağı, sol */
export const companies: Company[] = [
  {
    id: "equipment",
    name: "CES Equipment",
    shortName: "Equipment",
    legalName: "Construction Equipment Services MMC",
    founded: site.foundingDate,
    field: "Ağır texnika icarəsi",
    description:
      "Avtokran, forklift, ekskavator və hündürlük səbətləri. Sertifikatlı operator və çatdırılma ilə.",
    url: externalUrls.equipment,
    image: "/media/ces-equipment-forklift-hd.jpg",
    focus: "50% 70%",
    poster: "/media/video/vid-equipment-crane-hd-poster.jpg",
    imageAlt: "CES-in qırmızı yüksək yüklü forklifti",
    video: "/media/video/vid-equipment-crane-hd",
  },
  {
    id: "architect",
    name: "CES Architect",
    shortName: "Architect",
    legalName: "Arch Construction Engineering Services MMC",
    founded: "2025",
    field: "Memarlıq və dizayn",
    description: "İnteryer, eksteryer və landşaft dizaynı. Konsepsiyadan işçi layihəyə qədər.",
    url: externalUrls.architect,
    image: "/media/ces-architect-villa-hd.jpg",
    focus: "38% 50%",
    imageAlt: "Bağ və hovuzlu daş fasadlı villa",
    video: "/media/video/vid-architect-villa",
  },
  {
    id: "construction",
    name: "CES Construction",
    shortName: "Construction",
    legalName: "Arch Construction Engineering Services MMC",
    founded: "2025",
    field: "Tikinti və podrat",
    description:
      "Yaşayış və kommersiya tikintisi, infrastruktur və yol işləri, təmir-bitirmə, baş podrat.",
    url: subdomainUrl("construction"),
    image: "/media/ces-construction-hd.jpg",
    imageAlt: "İnşa olunan çoxmərtəbəli bina",
    video: "/media/video/vid-construction",
  },
  {
    id: "farmart",
    name: "Farmart",
    shortName: "Agro",
    legalName: "Farmart MMC",
    founded: "2026",
    field: "İnnovativ və təbii ekosistem",
    description: "Kotteclər, əyləncə mərkəzləri və innovativ ferma: insanların təbiətlə iç-içə yararlana biləcəyi ekosistem. Əkinçilik üçün B2B texnika icarəsi də olacaq.",
    planned: true,
    url: subdomainUrl("farmart"),
    image: "/media/farmart-hd.jpg",
    imageAlt: "Taxıl sahəsində kombayn",
    video: "/media/video/vid-farmart",
  },
];

/** Ana səhifədəki "layihənin yolu" bölməsi: şirkətlər layihənin mərhələləri kimi sıralanır */
export type JourneyStep = { id: CompanyId; icon: "design" | "build" | "crane" | "wheat"; points: string[] };

export const journey: JourneyStep[] = [
  { id: "architect", icon: "design", points: ["İnteryer dizaynı", "Eksteryer dizaynı", "Landşaft", "İşçi layihə"] },
  { id: "construction", icon: "build", points: ["Yaşayış və kommersiya tikintisi", "İnfrastruktur və yol işləri", "Təmir-bitirmə", "Baş podrat"] },
  { id: "equipment", icon: "crane", points: ["Avtokran", "Forklift", "Ekskavator", "Hündürlük səbətləri"] },
  { id: "farmart", icon: "wheat", points: ["Kotteclər", "Əyləncə mərkəzləri", "İnnovativ ferma", "B2B texnika icarəsi"] },
];

export const stats = [
  { value: "2020", label: "fəaliyyətə başladığımız il" },
  { value: "100+", label: "icra olunan layihə" },
  { value: "120+", label: "icarəyə hazır texnika" },
  { value: "100+", label: "sertifikatlı operator" },
  { value: "150+", label: "müştəri" },
  { value: "20+", label: "dizayn layihəsi" },
];

export type Project = {
  slug: string;
  title: string;
  company: string;
  image: string;
  alt: string;
  category: string;
  location: string;
  /** Daxili səhifənin başlığı altındakı qısa təsvir */
  summary: string;
  body: string[];
  /** `[...]` — layihə üzrə dəqiq məlumat təsdiqlənəndə doldurulacaq */
  details: { label: string; value: string }[];
};

const projectDetails = (client: string, year: string, equipment: string, role: string) => [
  { label: "Sifarişçi", value: client },
  { label: "İl", value: year },
  { label: "İstifadə olunan texnika", value: equipment },
  { label: "Layihədə rolumuz", value: role },
];

/**
 * Diqqət: şəkillər müvəqqəti stok fotolardır — real layihə fotoları ilə əvəz edin.
 * Mətnlər ümumi kontekstdir; `[...]` ilə qalan sahələr real məlumatla əvəz olunmalıdır.
 */
export const projects: Project[] = [
  {
    slug: "formula-1-azerbaycan-qran-prisi",
    title: "Formula 1 Azərbaycan Qran-prisi",
    company: "CES Equipment",
    image: "/media/proj-f1.jpg",
    alt: "Bakı şəhər küçəsi",
    category: "Beynəlxalq tədbir",
    location: "Bakı",
    summary: "Bakının şəhər küçələrində keçirilən Formula 1 yarışı üçün texnika təminatı.",
    body: [
      "Formula 1 Azərbaycan Qran-prisi Bakının şəhər küçələrində keçirilir. Küçə trassı və tədbir infrastrukturu qısa müddətdə qurulur, yarışdan sonra isə şəhər öz adi rejiminə qaytarılır.",
      "Belə layihələrdə texnikanın vaxtında çatdırılması, hündürlükdə və sıx şəhər mühitində təhlükəsiz işləməsi həlledici əhəmiyyət daşıyır. CES Equipment bu istiqamətdə texnika təminatı ilə iştirak edib.",
    ],
    details: projectDetails("Baku City Circle", "2021–2025", "Teleskopik yükləyici, kran, forklift", "Texnika təminatı"),
  },
  {
    slug: "cop29-baki",
    title: "COP29 Bakı",
    company: "CES Equipment",
    image: "/media/proj-cop29.jpg",
    alt: "Bakı bulvarı yuxarıdan",
    category: "Beynəlxalq tədbir",
    location: "Bakı",
    summary: "BMT-nin iqlim konfransı COP29 üçün texnika təminatı.",
    body: [
      "BMT-nin İqlim Dəyişikliyi üzrə Çərçivə Konvensiyasının tərəflər konfransı (COP29) 2024-cü ilin noyabrında Bakıda keçirildi. Tədbir yüzlərlə nümayəndə heyətini bir araya gətirdi və sıx hazırlıq qrafiki tələb etdi.",
      "Miqyaslı tədbirlərdə quraşdırma və hazırlıq işləri dəqiq cədvəllə aparılır. CES Equipment bu layihədə texnika təminatı ilə iştirak edib.",
    ],
    details: projectDetails("Al Baddad", "2024", "Forklift, golfcar, sprinter, transfer xidmətləri", "Texnika icarəsi"),
  },
  {
    slug: "port-baku",
    title: "Port Baku",
    company: "CES Equipment",
    image: "/media/proj-portbaku.jpg",
    alt: "Bakıda yaşayış qüllələri",
    category: "Yaşayış və kommersiya",
    location: "Bakı",
    summary: "Bakıdakı Port Baku kompleksi üçün hündürlük və yükqaldırma texnikası.",
    body: [
      "Port Baku Bakının mərkəzində yerləşən yaşayış və kommersiya kompleksidir. Belə çoxmərtəbəli obyektlərdə fasad, montaj və yükdaşıma işləri hündürlük və yükqaldırma texnikası olmadan mümkün deyil.",
      "CES Equipment bu layihədə texnika təminatı ilə iştirak edib.",
    ],
    details: projectDetails("Oasis Construction (Port Baku Tower 2), North West Construction (Port Baku Walk)", "2022 (Tower 2), 2024 (Walk)", "Forklift, teleskopik yükləyici, kran", "Texnika icarəsi"),
  },
  {
    slug: "crescent-mall",
    title: "Crescent Mall",
    company: "CES Equipment",
    image: "/media/proj-crescent.jpg",
    alt: "Şüşə fasadlı göydələnlər",
    category: "Kommersiya",
    location: "Bakı",
    summary: "Bakıdakı Crescent Mall ticarət mərkəzi üçün texnika təminatı.",
    body: [
      "Ticarət mərkəzlərinin tikintisi və təchizatı işlərində ağır konstruksiyaların qaldırılması, yüklərin daşınması və hündürlükdə işlər eyni vaxtda aparılır. Bu, texnikanın düzgün seçilməsini və təcrübəli operatorları tələb edir.",
      "CES Equipment Crescent Mall layihəsində texnika təminatı ilə iştirak edib.",
    ],
    details: projectDetails("PMD Projects", "2021", "Forklift, teleskopik yükləyici, kran", "Texnika icarəsi"),
  },
  {
    slug: "qarabag-infrastrukturu",
    title: "Qarabağ infrastrukturu",
    company: "CES Equipment",
    image: "/media/proj-karabakh.jpg",
    alt: "Dağ vadisində yol tikintisi",
    category: "İnfrastruktur",
    location: "Qarabağ",
    summary: "Qarabağ bölgəsində yol və infrastruktur işləri üçün ağır texnika.",
    body: [
      "Qarabağ bölgəsində bərpa və yenidənqurma işləri yol, kommunikasiya və ərazi hazırlığı üzrə geniş həcmdə ağır texnika tələb edir. Çətin relyef və uzaq məsafələr texnikanın etibarlılığını və vaxtında çatdırılmasını xüsusilə vacib edir.",
      "CES Equipment bu istiqamətdə infrastruktur layihələrinə texnika təminatı ilə dəstək verib.",
    ],
    details: projectDetails("CCN İnşaat, TVM Construction, Road and Construction, Electro Industries və digər", "2020", "Ekskavator, kran və digər texnika", "Texnika icarəsi"),
  },
];

/** Hər layihə səhifəsindəki "Necə işləyirik" bölməsi: Equipment-in ümumi yanaşması */
export const projectApproach = [
  { title: "Düzgün texnika", text: "Layihənin yükünə, hündürlüyünə və sahə şəraitinə uyğun avtokran, forklift, ekskavator və ya səbət seçilir." },
  { title: "Sertifikatlı operator", text: "Texnika təcrübəli və sertifikatlı operatorlarla, sahədə təhlükəsizlik qaydalarına əməl edilərək işləyir." },
  { title: "Vaxtında çatdırılma", text: "Texnika razılaşdırılmış vaxtda sahəyə çatdırılır, layihənin qrafiki pozulmur." },
];

/** Equipment saytındakı müştərilərlə eynidir (sıra da eyni). Loqolar public/media/clients/ qovluğundadır. */
export const clients: { name: string; logo: string }[] = [
  { name: "Sinerji Proje", logo: "/media/clients/sinerji.jpg" },
  { name: "Kolin İnşaat", logo: "/media/clients/kolin.png" },
  { name: "A+A Group", logo: "/media/clients/aa-group.png" },
  { name: "Giltex", logo: "/media/clients/giltex.jpg" },
  { name: "AZCD Group", logo: "/media/clients/azcd-group.png" },
  { name: "Azbadam", logo: "/media/clients/azbadam.jpg" },
  { name: "Equipment Rental Services", logo: "/media/clients/ers.jpg" },
  { name: "Ege Yapı", logo: "/media/clients/ege-yapi.png" },
  { name: "Road and Construction", logo: "/media/clients/road-construction.jpg" },
  { name: "Workplace Interiors", logo: "/media/clients/workplace.jpg" },
  { name: "Evakuator.az", logo: "/media/clients/evakuator.jpg" },
  { name: "İdeal TM", logo: "/media/clients/ideal-tm.png" },
  { name: "Electro Industries", logo: "/media/clients/electro.png" },
  { name: "Azertexnolayn", logo: "/media/clients/azertexnolayn.jpg" },
  { name: "Minera", logo: "/media/clients/minera.png" },
  { name: "Grand Agro", logo: "/media/clients/grand-agro.jpg" },
  { name: "PMD Projects", logo: "/media/clients/pmd-projects.jpg" },
  { name: "İkma Services", logo: "/media/clients/ikma.jpg" },
  { name: "Evrascon", logo: "/media/clients/evrascon.jpg" },
  { name: "Met-Ak", logo: "/media/clients/met-ak.png" },
  { name: "UPS", logo: "/media/clients/ups.png" },
  { name: "Qala Group", logo: "/media/clients/qala-group.jpg" },
  { name: "Azersun", logo: "/media/clients/sun-beverage.jpg" },
  { name: "Starmining", logo: "/media/clients/starmining.jpg" },
  { name: "Azlift Pro", logo: "/media/clients/azlift-pro.png" },
];

export const about = {
  lead:
    "CES Group 2020-ci ildə ağır texnika icarəsi ilə başlayan fəaliyyətini bu gün memarlıq, tikinti və kənd təsərrüfatı istiqamətləri ilə genişləndirən Azərbaycan şirkətlər qrupudur.",
  mission:
    "Sifarişçiyə layihənin bütün mərhələlərində vahid məsuliyyət, şəffaf proses və təhlükəsiz icra təqdim etmək.",
  vision:
    "Azərbaycanda tikinti və infrastruktur layihələri üçün ilk müraciət edilən inteqrasiya olunmuş tərəfdaş olmaq.",
  values: [
    { title: "Təhlükəsizlik", text: "Sığortalı texnika parkı, sertifikatlı operatorlar və sahədə ciddi qaydalar." },
    { title: "Məsuliyyət", text: "Verilən söz və razılaşdırılmış müddət hər layihənin əsasıdır." },
    { title: "Şəffaflıq", text: "Qiymət, proses və nəticə barədə sifarişçi ilə açıq ünsiyyət." },
    { title: "Keyfiyyət", text: "Eskizdən təhvilə qədər hər mərhələdə eyni standart." },
  ],
  timeline: [
    { year: "2020", text: "CES ağır texnika icarəsi ilə fəaliyyətə başlayır." },
    { year: "2025", text: "CES Architect memarlıq və dizayn istiqaməti kimi yaradılır." },
    { year: "2025", text: "CES Construction tikinti və podrat işlərinə başlayır." },
    { year: "2026", text: "Farmart innovativ və təbii ekosistem istiqaməti kimi yaradılır." },
    { year: "2026", text: "Şirkətlər CES Group adı altında birləşir." },
  ],
};
