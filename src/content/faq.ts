/**
 * Tez-tez verilən suallar. Cavablar yalnız təsdiqlənmiş məlumata əsaslanır (`site.ts` və rəhbərliyin cavabları).
 * Qiymət, zəmanət, müddət kimi hələ təsdiqlənməyən məlumatlar üçün sual yazılmayıb.
 */

import { companies, site } from "./site";

export type Faq = { q: string; a: string; link?: { href: string; label: string } };
export type FaqGroup = { id: string; title: string; lead: string; items: Faq[] };

const company = (id: string) => companies.find((c) => c.id === id)!;
const equipment = company("equipment");
const architect = company("architect");
const construction = company("construction");
const farmart = company("farmart");

export const faqGroups: FaqGroup[] = [
  {
    id: "qrup",
    title: "CES Group",
    lead: "Qrup, şirkətlər və əlaqə",
    items: [
      {
        q: "CES Group nədir və hansı şirkətləri birləşdirir?",
        a: `CES Group Azərbaycanda fəaliyyət göstərən şirkətlər qrupudur. Qrupa dörd şirkət daxildir: ağır texnika icarəsi üzrə ${equipment.name} (${site.founded}), memarlıq və dizayn üzrə ${architect.name} (${architect.founded}), tikinti və podrat üzrə ${construction.name} (${construction.founded}) və innovativ və təbii ekosistem istiqaməti ${farmart.name} (${farmart.founded}).`,
        link: { href: "/haqqimizda", label: "Qrup haqqında" },
      },
      {
        q: "Layihəni bir komanda ilə necə icra etmək olar?",
        a: "Layihənin dizaynını CES Architect, tikintisini CES Construction, texnika təminatını isə CES Equipment həyata keçirir. Mərhələlər qrup daxilində əlaqələndirildiyi üçün sifarişçi bir neçə podratçı ilə deyil, tək məsuliyyətlə işləyir.",
      },
      {
        q: "Hansı bölgələrdə xidmət göstərirsiniz?",
        a: "Bütün Azərbaycan üzrə. CES Equipment texnikanı Bakı daxilinə və rayonlara, o cümlədən Qarabağa çatdırır.",
      },
      {
        q: "CES Group hansı layihələrdə iştirak edib?",
        a: "CES Equipment texnika təminatı ilə Formula 1 Azərbaycan Qran-prisi, COP29 Bakı, Port Baku, Crescent Mall və Qarabağ infrastruktur layihələrində iştirak edib.",
        link: { href: "/layiheler", label: "Layihələrə bax" },
      },
      {
        q: "CES Group ilə necə əlaqə saxlaya bilərəm?",
        a: `Telefon və WhatsApp: ${site.phone}. E-poçt: ${site.email}. Ünvan: ${site.address}. İş saatları: ${site.hours.label}. Sorğunu sayt üzərindəki müraciət formu ilə də göndərmək olar, o, aidiyyəti şirkətə yönləndirilir.`,
        link: { href: "/elaqe", label: "Əlaqə səhifəsi" },
      },
    ],
  },
  {
    id: "equipment",
    title: "CES Equipment",
    lead: "Ağır texnika icarəsi",
    items: [
      {
        q: "CES Equipment hansı texnikanı icarəyə verir?",
        a: "Avtokran, forklift, ekskavator və hündürlük səbətləri. Layihələrdə həmçinin teleskopik yükləyici, golfcar və sprinter kimi texnika və transfer xidmətləri təmin edilib.",
      },
      {
        q: "Texnika operatorla, yoxsa operatorsuz verilir?",
        a: "Hər iki variant mümkündür: texnika operatorla da, operatorsuz da icarəyə verilir.",
      },
      {
        q: "Texnikanı hansı müddətə icarəyə götürmək olar?",
        a: "Gündəlik və aylıq icarə mümkündür. Saatlıq icarə planlaşdırılır. Layihəniz üçün uyğun müddəti sorğu zamanı dəqiqləşdirə bilərsiniz.",
      },
      {
        q: "Sifarişdən sonra texnika nə qədər tez çatdırılır?",
        a: "Texnikanın sifarişdən sonra sahəyə çatdırılması orta hesabla 24 saat çəkir.",
      },
      {
        q: "Rayonlara və Qarabağa texnika göndərirsinizmi?",
        a: "Bəli. Texnika Bakı daxilinə və rayonlara, o cümlədən Qarabağa çatdırılır. Çatdırılma haqqı məsafəyə uyğun hesablanır.",
      },
      {
        q: "Texnikanın icarə qiyməti nədən asılıdır?",
        a: "Qiymət texnikanın növünə və gücünə, icarə müddətinə, operatorla verilib-verilməməsinə və çatdırılma məsafəsinə görə dəyişir. Dəqiq qiymət almaq üçün sorğu göndərin.",
        link: { href: "/elaqe", label: "Sorğu göndər" },
      },
      {
        q: "Ödəniş necə aparılır?",
        a: "Nağd və nağdsız ödəniş mümkündür. Nağdsız ödənişə ƏDV əlavə olunur. Avans ödənişi də mümkündür.",
      },
      {
        q: "Sifariş prosesi necə gedir?",
        a: "Sorğu göndərilir, qəbul olunur, müqavilə bağlanır və texnika sahəyə çatdırılır. Lazım olduqda mütəxəssis rəyi də verilir.",
      },
      {
        q: "Texnika sığortalıdır və texniki baxışdan keçirmi?",
        a: "Bəli. Texnika icbari sığorta ilə sığortalanıb və hər il texniki baxışdan keçir.",
      },
      {
        q: "Operatorlar sertifikatlıdırmı?",
        a: "Bəli. 100+ operator ilə işlənir və operatorlar FHN (Fövqəladə Hallar Nazirliyi) lisenziyası əsasında fəaliyyət göstərən qruplar tərəfindən sertifikatlaşdırılır.",
      },
      {
        q: "Hansı sektorlara xidmət göstərirsiniz?",
        a: "Bütün sektorlara: tikinti, tədbirlər, infrastruktur və digər sahələrə, həmçinin kənd təsərrüfatına.",
      },
      {
        q: "Texnikanın mövcudluğunu necə öyrənə bilərəm?",
        a: "CES Equipment saytında texnika kataloqu və sorğu formu var. Texnikanı seçib sorğu göndərmək kifayətdir.",
        link: { href: equipment.url, label: "CES Equipment saytı" },
      },
      {
        q: "Avtokran seçərkən tonnaj və hündürlük nə üçün vacibdir?",
        a: "Tonnaj kranın qaldıra biləcəyi yükü, hündürlük və qolun uzanma məsafəsi isə yükün nə qədər yüksəkliyə və hansı məsafəyə çatdırılacağını müəyyən edir. Qol uzandıqca kranın real qaldırma qabiliyyəti azalır, ona görə seçim yükün çəkisinə, qaldırma hündürlüyünə və kranın yükə olan məsafəsinə görə edilməlidir.",
      },
    ],
  },
  {
    id: "architect",
    title: "CES Architect",
    lead: "Memarlıq və dizayn",
    items: [
      {
        q: "CES Architect hansı xidmətləri göstərir?",
        a: "İnteryer, eksteryer və landşaft dizaynı, həmçinin 3D vizuallaşdırma, işçi layihə, avtor nəzarəti və icazə sənədləri üzrə xidmətlər.",
        link: { href: architect.url, label: "CES Architect saytı" },
      },
      {
        q: "Layihə hansı mərhələlərdən keçir?",
        a: "Brif, konsepsiya, 3D vizuallaşdırma, işçi layihə və avtor nəzarəti.",
      },
      {
        q: "Dizayn xidmətinin qiyməti necə hesablanır?",
        a: "Qiymət hər layihə üçün fərdi hesablanır. Tələblərinizi paylaşsanız, layihəyə uyğun təklif hazırlanır.",
      },
      {
        q: "Layihədən sonra icranı da sizdən sifariş edə bilərikmi?",
        a: "Bəli. Hazırlanmış layihənin icrasını CES Construction həyata keçirə bilər.",
      },
    ],
  },
  {
    id: "construction",
    title: "CES Construction",
    lead: "Tikinti və podrat",
    items: [
      {
        q: "Baş podrat nə deməkdir və sifarişçiyə nə verir?",
        a: "Baş podrat layihənin bütün tikinti mərhələləri üçün vahid məsuliyyət daşıyan şirkətdir: alt podratçıların əlaqələndirilməsi, material və texnika təminatı, keyfiyyət və təhlükəsizlik nəzarəti. Sifarişçi hər iş növü üçün ayrı podratçı ilə deyil, bir tərəflə işləyir.",
        link: { href: `${construction.url}/xidmetlerimiz/bas-podrat`, label: "Baş podrat xidməti" },
      },
      {
        q: "CES Construction hansı işləri görür?",
        a: "Bina tikintisi, infrastruktur və yol işləri, təmir-bitirmə və baş podrat. Layihələrə fərdi yaşayış evləri, villalar, bağ evləri, otel konsepsiyalı obyektlər və ofis təmiri kimi işlər daxildir.",
        link: { href: `${construction.url}/xidmetlerimiz`, label: "Xidmətlərə bax" },
      },
      {
        q: "Layihələndirmə və texnika təminatını da CES Construction ilə həll etmək olarmı?",
        a: "Bəli. Layihələndirmə CES Architect, texnika təminatı CES Equipment ilə eyni qrup daxilində əlaqələndirilir. Bu, prosesi daha şəffaf və idarəolunan edir.",
      },
    ],
  },
  {
    id: "farmart",
    title: "Farmart",
    lead: "İnnovativ və təbii ekosistem",
    items: [
      {
        q: "Farmart nədir?",
        a: "Farmart CES Group-un innovativ və təbii ekosistemidir. Burada insanlar kotteclərdən, əyləncə mərkəzlərindən və innovativ fermadan yararlana biləcək.",
        link: { href: farmart.url, label: "Farmart saytı" },
      },
      {
        q: "Farmart-da texnika icarəsi olacaqmı?",
        a: "Bəli. Əkinçilik və digər sahələr üçün B2B texnika icarəsi də Farmart-ın imkanları sırasında olacaq.",
      },
    ],
  },
];

export const faqItems = faqGroups.flatMap((g) => g.items);
