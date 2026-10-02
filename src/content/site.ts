/**
 * Saytın bütün mətn və məlumatları bu fayldadır.
 * `[...]` ilə yazılmış dəyərlər hələ təsdiqlənməyib və dəyişdirilməlidir.
 */

export type CompanyId = "equipment" | "architect" | "construction" | "farmart";

export type Company = {
  id: CompanyId;
  name: string;
  field: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  /** Videonun yolu, uzantısız: həm .mp4, həm .webm faylı olmalıdır */
  video: string;
  phone?: string;
  email?: string;
};

export const site = {
  name: "CES Group",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cesgroup.az",
  description:
    "CES Group memarlıq, tikinti, ağır texnika icarəsi və kənd təsərrüfatı sahələrində fəaliyyət göstərən dörd şirkəti bir araya gətirir.",
  founded: 2020,
  address: "[Ünvan], Bakı, Azərbaycan",
  email: "[info@cesgroup.az]",
  phone: "[Qrupun telefonu]",
  social: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Facebook", href: "#" },
  ],
};

export const nav = [
  { label: "Ana səhifə", href: "/" },
  { label: "Haqqımızda", href: "/haqqimizda" },
  { label: "Şirkətlər", href: "/#sirketler" },
  { label: "Layihələr", href: "/#layiheler" },
  { label: "Əlaqə", href: "/elaqe" },
];

/** Hero-dakı sıra: yuxarı, sağ, aşağı, sol */
export const companies: Company[] = [
  {
    id: "equipment",
    name: "CES Equipment",
    field: "Ağır texnika icarəsi",
    description:
      "Avtokran, forklift, ekskavator və hündürlük səbətləri. Sertifikatlı operator və çatdırılma ilə.",
    url: "https://ces.com.az",
    image: "/media/ces-equipment.jpg",
    imageAlt: "Tikinti sahəsində sarı mobil kran",
    video: "/media/video/vid-equipment",
    phone: "+994 50 682 90 80",
    email: "sales@ces.com.az",
  },
  {
    id: "architect",
    name: "CES Architect",
    field: "Memarlıq və dizayn",
    description: "İnteryer, eksteryer və landşaft dizaynı. Konsepsiyadan işçi layihəyə qədər.",
    url: "https://architect.cesgroup.az",
    image: "/media/ces-architect.jpg",
    imageAlt: "Müasir qonaq otağı interyeri",
    video: "/media/video/vid-architect",
  },
  {
    id: "construction",
    name: "CES Construction",
    field: "Tikinti və podrat",
    description:
      "Yaşayış və kommersiya tikintisi, infrastruktur və yol işləri, təmir-bitirmə, baş podrat.",
    url: "https://construction.cesgroup.az",
    image: "/media/ces-construction.jpg",
    imageAlt: "İnşa olunan çoxmərtəbəli bina",
    video: "/media/video/vid-construction",
  },
  {
    id: "farmart",
    name: "Farmart",
    field: "Kənd təsərrüfatı",
    description: "Qrupun kənd təsərrüfatı istiqaməti.",
    url: "https://farmart.az",
    image: "/media/farmart.jpg",
    imageAlt: "Taxıl sahəsində kombayn",
    video: "/media/video/vid-farmart",
  },
];

export const steps = [
  { title: "Layihələndirmə", company: "CES Architect", text: companies[1].description },
  { title: "İcra", company: "CES Construction", text: companies[2].description },
  { title: "Texnika təminatı", company: "CES Equipment", text: companies[0].description },
];

export const stats = [
  { value: "2020", label: "fəaliyyətə başladığımız il" },
  { value: "120+", label: "icarəyə hazır texnika" },
  { value: "25+", label: "korporativ müştəri" },
  { value: "15+", label: "dizayn layihəsi" },
];

/** Diqqət: şəkillər müvəqqəti stok fotolardır — real layihə fotoları ilə əvəz edin. */
export const projects = [
  { title: "Formula 1 Azərbaycan Qran-prisi", company: "CES Equipment", image: "/media/proj-f1.jpg", alt: "Bakı şəhər küçəsi" },
  { title: "COP29 Bakı", company: "CES Equipment", image: "/media/proj-cop29.jpg", alt: "Bakı bulvarı yuxarıdan" },
  { title: "Port Baku", company: "CES Equipment", image: "/media/proj-portbaku.jpg", alt: "Bakıda yaşayış qüllələri" },
  { title: "Crescent Mall", company: "CES Equipment", image: "/media/proj-crescent.jpg", alt: "Şüşə fasadlı göydələnlər" },
  { title: "Qarabağ infrastrukturu", company: "CES Equipment", image: "/media/proj-karabakh.jpg", alt: "Dağ vadisində yol tikintisi" },
];

/** Loqo faylları gələndə `logo` sahəsinə yol yazın, məs. "/media/clients/kolin.png" */
export const clients: { name: string; logo?: string }[] = [
  { name: "Sinerji Proje" },
  { name: "Kolin İnşaat" },
  { name: "A+A Group" },
  { name: "SOCAR" },
  { name: "[Müştəri loqosu]" },
  { name: "[Müştəri loqosu]" },
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
    { year: "[İl]", text: "CES Architect memarlıq və dizayn istiqaməti kimi yaradılır." },
    { year: "[İl]", text: "CES Construction tikinti və podrat işlərinə başlayır." },
    { year: "2026", text: "Şirkətlər CES Group adı altında birləşir." },
  ],
};
