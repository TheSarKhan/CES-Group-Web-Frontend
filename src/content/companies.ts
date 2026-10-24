/**
 * /sirketler və /sirketler/<şirkət> səhifələrinin məzmunu.
 * Hüquqi ad, yaradılma ili, xidmət siyahısı və rəqəmlər `site.ts`, `subsites.ts` və rəhbərliyin cavablarına əsaslanır.
 * Şüarlar təklifdir və rəhbərlik tərəfindən təsdiqlənməlidir.
 */

import { companies, projects, type Company, type CompanyId } from "./site";
import { subsites } from "./subsites";

export type CompanyService = { name: string; text?: string; href?: string };
export type CompanyProject = { title: string; category: string; image: string; alt: string; href: string };

export type CompanyPage = {
  id: CompanyId;
  tagline: string;
  /** Meta description (≈150 simvol) */
  metaDescription: string;
  about: string[];
  /** Hüquqi ad və yaradılma ilindən başqa göstərilən faktlar */
  facts: { label: string; value: string }[];
  servicesTitle: string;
  services: CompanyService[];
  /** Yalnız Equipment: icarə şərtləri */
  terms?: string[];
  projectsTitle?: string;
  projects: CompanyProject[];
};

const construction = subsites.construction;
const farmart = subsites.farmart;
const architectUrl = companies.find((c) => c.id === "architect")!.url;

const subServices = (s: typeof construction): CompanyService[] =>
  s.services.map((x) => ({ name: x.label, text: x.description, href: `${s.url}/xidmetlerimiz/${x.slug}` }));

const architectProject = (slug: string, title: string, category: string): CompanyProject => ({
  title,
  category,
  image: `/media/architect/${slug}.jpg`,
  alt: title,
  href: `${architectUrl}/layihelerimiz/${slug}`,
});

export const companyPages: Record<CompanyId, CompanyPage> = {
  equipment: {
    id: "equipment",
    tagline: "Düzgün texnika, sertifikatlı operator, vaxtında çatdırılma.",
    metaDescription: "CES Equipment: ağır texnika icarəsi. Avtokran, forklift, ekskavator və hündürlük səbətləri; operatorla və ya operatorsuz, bütün Azərbaycanda.",
    about: [
      "CES Equipment 2020-ci ildə ağır texnika icarəsi ilə fəaliyyətə başlayıb və CES Group-un ilk şirkətidir. Avtokran, forklift, ekskavator və hündürlük səbətləri tikinti, tədbir, infrastruktur və kənd təsərrüfatı layihələrinə icarəyə verilir.",
      "Texnika operatorla və ya operatorsuz, gündəlik və ya aylıq icarəyə verilir. Sifarişdən sonra texnikanın sahəyə çatdırılması orta hesabla 24 saat çəkir. Texnika icbari sığorta ilə sığortalanıb, hər il texniki baxışdan keçir, operatorlar isə sertifikatlıdır.",
    ],
    facts: [
      { label: "İcarəyə hazır texnika", value: "120+" },
      { label: "Operator", value: "100+" },
      { label: "Xidmət ərazisi", value: "Bütün Azərbaycan" },
    ],
    servicesTitle: "Texnika növləri",
    services: [
      { name: "Avtokran", text: "Ağır yüklərin qaldırılması və yerləşdirilməsi." },
      { name: "Forklift", text: "Yükləmə, boşaltma və anbar daşımaları." },
      { name: "Ekskavator", text: "Qazıntı və torpaq işləri." },
      { name: "Hündürlük səbətləri", text: "Hündürlükdə təhlükəsiz işlər." },
    ],
    terms: [
      "Texnika operatorla və ya operatorsuz verilir.",
      "Gündəlik və aylıq icarə mümkündür, saatlıq icarə planlaşdırılır.",
      "Sifarişdən sonra orta çatdırılma müddəti 24 saatdır.",
      "Çatdırılma Bakı daxilinə, rayonlara və Qarabağa edilir, haqq məsafəyə uyğun hesablanır.",
      "Ödəniş nağd və ya nağdsız (ƏDV əlavə olunur) ola bilər, avans mümkündür.",
      "Texnika icbari sığorta ilə sığortalanıb və hər il texniki baxışdan keçir.",
      "Operatorlar FHN lisenziyası əsasında fəaliyyət göstərən qruplar tərəfindən sertifikatlaşdırılır.",
    ],
    projectsTitle: "Layihələr",
    projects: projects.map((p) => ({ title: p.title, category: p.category, image: p.image, alt: p.alt, href: `/layiheler/${p.slug}` })),
  },
  architect: {
    id: "architect",
    tagline: "Məkanlar dizayn edirik, gələcəyi formalaşdırırıq.",
    metaDescription: "CES Architect: interyer, eksteryer və landşaft dizaynı, 3D vizuallaşdırma, işçi layihə və avtor nəzarəti. Portfolio və xidmətlər.",
    about: [
      "CES Architect 2025-ci ildə yaradılıb və interyer, eksteryer və landşaft dizaynı üzrə memarlıq və dizayn xidməti göstərir. Layihə brifdən başlayır, konsepsiya, 3D vizuallaşdırma və işçi layihədən keçərək avtor nəzarətinə qədər aparılır.",
      "Dizayn xidmətinin qiyməti hər layihə üçün fərdi hesablanır. Hazırlanmış layihənin icrasını CES Construction həyata keçirə bilər. Portfoliodakı layihələr arasında 2023-cü ildə Azerbaijan Design Awards müsabiqəsində ölkə üzrə birinci yerə layiq görülmüş Şuşa Restoranı var.",
    ],
    facts: [
      { label: "Dizayn layihəsi", value: "20+" },
      { label: "Xidmət ərazisi", value: "Bütün Azərbaycan" },
    ],
    servicesTitle: "Xidmətlər",
    services: [
      { name: "İnteryer", text: "Mənzil, restoran və ofis interyerləri.", href: `${architectUrl}/xidmetlerimiz/interyer` },
      { name: "Eksteryer", text: "Fasad dizaynı və material həlli.", href: `${architectUrl}/xidmetlerimiz/eksteryer` },
      { name: "Landşaft", text: "Ərazi planlaması, yaşıllıq və işıqlandırma.", href: `${architectUrl}/xidmetlerimiz/landsaft` },
      { name: "3D vizuallaşdırma", text: "Layihənin icradan əvvəl real görüntüləri.", href: `${architectUrl}/xidmetlerimiz/3d-vizuallasdirma` },
      { name: "İşçi layihə", text: "İcra üçün texniki sənədlər.", href: `${architectUrl}/xidmetlerimiz/isci-layihe` },
      { name: "Avtor nəzarəti", text: "İcranın layihəyə uyğunluğuna nəzarət.", href: `${architectUrl}/xidmetlerimiz/avtor-nezareti` },
      { name: "İcazə sənədləri", text: "İcazə və razılaşma sənədlərində dəstək.", href: `${architectUrl}/xidmetlerimiz/icaze-senedleri` },
    ],
    projectsTitle: "Seçilmiş layihələr",
    projects: [
      architectProject("shusha-restoran", "Şuşa Restoranı", "Restoran interyeri"),
      architectProject("baku-city-residence", "Baku City Residence", "Yaşayış interyeri"),
      architectProject("grand-park", "Grand Park", "Art Deco"),
      architectProject("kontakt-home", "Kontakt Home baş ofisi", "Ofis interyeri"),
    ],
  },
  construction: {
    id: "construction",
    tagline: construction.tagline,
    metaDescription: "CES Construction: bina tikintisi, infrastruktur, təmir-bitirmə və baş podrat. Layihənin təməldən təhvilə qədər icrası.",
    about: [
      "CES Construction 2025-ci ildə yaradılıb. Yaşayış və kommersiya tikintisi, infrastruktur və yol işləri, təmir-bitirmə və baş podrat xidmətləri göstərir. Layihələrə fərdi yaşayış evləri, villalar, bağ evləri, otel konsepsiyalı obyektlər və ofis təmiri daxildir.",
      "Baş podrat modelində sifarişçi bir tərəflə işləyir: alt podratçıların əlaqələndirilməsi, material və texnika təminatı, keyfiyyət və təhlükəsizlik nəzarəti CES Construction-dadır. Layihələndirmə CES Architect, texnika təminatı CES Equipment ilə qrup daxilində əlaqələndirilir.",
    ],
    facts: [
      { label: "Tamamlanmış layihə", value: "10" },
      { label: "Xidmət ərazisi", value: "Bütün Azərbaycan" },
    ],
    servicesTitle: "Xidmətlər",
    services: subServices(construction),
    projectsTitle: "Layihələr",
    projects: construction.projects.map((p) => ({
      title: p.title,
      category: p.category,
      image: p.image,
      alt: p.title,
      href: `${construction.url}/layihelerimiz/${p.slug}`,
    })),
  },
  farmart: {
    id: "farmart",
    tagline: "Təbiətlə iç-içə innovativ ekosistem.",
    metaDescription: "Farmart: CES Group-un innovativ və təbii ekosistemi. Kotteclər, əyləncə mərkəzləri, innovativ ferma və B2B texnika icarəsi.",
    about: [
      "Farmart 2026-cı ildə yaradılıb və CES Group-un innovativ və təbii ekosistemidir. Burada insanlar kotteclərdən, əyləncə mərkəzlərindən və innovativ fermadan yararlana biləcək.",
      "Əkinçilik və digər sahələr üçün B2B texnika icarəsi də Farmart-ın imkanları sırasında olacaq.",
    ],
    facts: [],
    servicesTitle: "İstiqamətlər",
    services: subServices(farmart),
    projects: [],
  },
};

export const companyById = (id: string): Company | undefined => companies.find((c) => c.id === id);
export const isCompanyId = (v: string): v is CompanyId => v in companyPages;
