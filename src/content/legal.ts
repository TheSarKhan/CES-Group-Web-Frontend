/**
 * Məxfilik siyasəti və istifadə şərtləri. Mətn saytın real işinə əsaslanır (müraciət formu, Cloudflare Turnstile,
 * razılıqdan sonra Google Analytics 4). Sayta yeni izləmə, forma və ya xidmət əlavə olunanda burada yenilənməlidir.
 * Hüquqşünas tərəfindən yoxlanılması tövsiyə olunur.
 */

import { site } from "./site";

export type LegalSection = { id: string; title: string; paragraphs?: string[]; items?: string[] };
export type LegalDoc = { title: string; description: string; updated: string; intro: string; sections: LegalSection[] };

const operator = `${site.legalName} (“CES Group”)`;
const contactLine = `${site.address}. Telefon: ${site.phone}. E-poçt: ${site.email}.`;

export const privacy: LegalDoc = {
  title: "Məxfilik siyasəti",
  description:
    "CES Group saytlarında şəxsi məlumatların necə toplandığı, istifadə olunduğu, saxlandığı və qorunduğu, həmçinin sizin hüquqlarınız.",
  updated: "27 oktyabr 2026",
  intro: `Bu siyasət ${operator} tərəfindən idarə olunan cesgroup.az saytında və onun subdomenlərində (construction.cesgroup.az, farmart.cesgroup.az) şəxsi məlumatlarınızın necə emal olunduğunu izah edir. Məlumatlar Azərbaycan Respublikasının “Fərdi məlumatlar haqqında” Qanununa uyğun emal olunur. equipment.cesgroup.az saytında ayrıca məxfilik səhifəsi də var.`,
  sections: [
    {
      id: "operator",
      title: "1. Məlumatların operatoru",
      paragraphs: [`Şəxsi məlumatların operatoru ${operator}-dir. ${contactLine}`],
    },
    {
      id: "toplanan",
      title: "2. Hansı məlumatlar toplanır",
      paragraphs: ["Müraciət formunu göndərdiyiniz zaman bu məlumatlar toplanır:"],
      items: [
        "ad və soyad",
        "telefon nömrəsi",
        "e-poçt ünvanı (könüllü)",
        "müraciətin aid olduğu şirkət",
        "mesajınızın mətni və ya mesajda özünüz yazdığınız digər məlumatlar",
      ],
    },
    {
      id: "texniki",
      title: "3. Avtomatik toplanan texniki məlumatlar",
      paragraphs: [
        "Saytı açdığınız zaman serverlərimizdə və təhlükəsizlik sistemlərində texniki qeydlər (IP ünvanı, brauzer və cihaz növü, sorğunun vaxtı və ünvanı) yazıla bilər. Bu məlumatlar saytın işləməsi, təhlükəsizliyi və sui-istifadənin qarşısını almaq üçündür.",
      ],
    },
    {
      id: "meqsed",
      title: "4. Məlumatlardan istifadə məqsədləri",
      items: [
        "müraciətinizə cavab vermək və sizinlə əlaqə saxlamaq",
        "xidmət üzrə təklif hazırlamaq və müqavilə münasibətlərini yerinə yetirmək",
        "spam, saxta müraciət və sui-istifadənin qarşısını almaq (Cloudflare Turnstile yoxlaması, sorğu limiti)",
        "saytın və serverin təhlükəsizliyini təmin etmək",
        "razılığınız olarsa, saytın istifadəsini ölçmək və təkmilləşdirmək (Google Analytics, 9-cu bölməyə baxın)",
        "qanunvericiliyin tələblərini yerinə yetirmək",
      ],
      paragraphs: ["Razılığınız olmadan sizə reklam və ya marketinq mesajları göndərilmir."],
    },
    {
      id: "esas",
      title: "5. Hüquqi əsas",
      paragraphs: [
        "Məlumatlar müraciət formunu göndərməklə verdiyiniz razılığa, müqavilədən əvvəlki əlaqələrin həyata keçirilməsinə, saytın təhlükəsizliyi üzrə qanuni maraqlarımıza və qanunvericiliyin tələblərinə əsasən emal olunur.",
      ],
    },
    {
      id: "oturme",
      title: "6. Məlumatların ötürülməsi",
      paragraphs: [
        "Müraciətiniz seçdiyiniz şirkətin komandasına e-poçt və daxili bildiriş kanalları ilə göndərilir və yalnız səlahiyyətli əməkdaşların daxil ola bildiyi idarəetmə panelində saxlanılır. Məlumatlarınız satılmır və reklam məqsədilə üçüncü tərəflərə verilmir.",
        "Saytı işlətmək üçün xidmət təminatçılarından istifadə edirik: server (hosting) xidməti, Cloudflare (şəbəkə, təhlükəsizlik və Turnstile yoxlaması), e-poçt xidməti, Google Maps (əlaqə səhifələrindəki xəritə) və razılığınızla Google Analytics. Bu tərəflər məlumatları yalnız xidməti göstərmək üçün emal edir. Qanunvericiliyin tələb etdiyi hallarda məlumatlar səlahiyyətli dövlət orqanlarına təqdim oluna bilər.",
      ],
    },
    {
      id: "saxlama",
      title: "7. Saxlama müddəti",
      paragraphs: [
        "Müraciət məlumatları müddətsiz saxlanılır və qorunur. İstədiyiniz vaxt məlumatlarınızın silinməsini və ya düzəldilməsini tələb edə bilərsiniz (8-ci bölməyə baxın). Qanunvericiliyin saxlanmasını tələb etdiyi hallar istisnadır.",
      ],
    },
    {
      id: "huquqlar",
      title: "8. Sizin hüquqlarınız",
      items: [
        "məlumatlarınızın emal olunub-olunmadığını və hansı məlumatların saxlanıldığını öyrənmək",
        "yanlış və ya natamam məlumatların düzəldilməsini tələb etmək",
        "məlumatlarınızın silinməsini və ya blok edilməsini tələb etmək",
        "verdiyiniz razılığı geri götürmək",
        "emala etiraz etmək",
      ],
      paragraphs: [
        `Sorğunuzu ${site.email} ünvanına yazın. Sorğu qanunvericiliklə müəyyən edilmiş müddətdə cavablandırılır. Hüquqlarınızın pozulduğunu düşünürsünüzsə, səlahiyyətli orqana və ya məhkəməyə müraciət edə bilərsiniz.`,
      ],
    },
    {
      id: "cookie",
      title: "9. Cookie və oxşar texnologiyalar",
      paragraphs: [
        "Saytımız reklam cookie-lərindən istifadə etmir. Müraciət formunda Cloudflare Turnstile təhlükəsizlik yoxlaması işləyir və saytın düzgün işləməsi üçün zəruri texniki məlumatlar istifadə edə bilər. Əlaqə səhifələrindəki Google Maps xəritəsi Google-un öz cookie və qeydlərini istifadə edə bilər.",
        "Saytın necə istifadə olunduğunu anlamaq üçün Google LLC-nin Google Analytics 4 xidmətindən istifadə edirik. Bu xidmət yalnız siz saytdakı bildirişdə “Qəbul et” seçdikdən sonra işə düşür. Rədd etsəniz, Google Analytics yüklənmir və cookie yazılmır. Aktiv olduqda baxdığınız səhifələr, cihaz və brauzer növü, təxmini ölkə və saytı hansı mənbədən tapdığınız kimi ümumiləşdirilmiş statistik məlumatlar toplanır (cookie adları: _ga və _ga_...). Bu məlumatlar Google tərəfindən emal olunur və Azərbaycandan kənarda saxlanıla bilər.",
        "Seçiminizi istənilən vaxt saytın aşağısındakı “Cookie seçimləri” düyməsi ilə dəyişə bilərsiniz. Razılığı geri götürdükdə Google cookie-ləri bu brauzerdən silinir.",
      ],
    },
    {
      id: "tehlukesizlik",
      title: "10. Məlumatların təhlükəsizliyi",
      paragraphs: [
        "Məlumatları qorumaq üçün saytda HTTPS şifrələməsi, giriş məhdudiyyətləri və sui-istifadədən qorunma tədbirləri tətbiq olunur. Heç bir internet ötürməsi və ya saxlama üsulu tam təhlükəsiz deyil, buna görə mütləq təhlükəsizliyə zəmanət vermək mümkün deyil.",
      ],
    },
    {
      id: "usaqlar",
      title: "11. Uşaqlar",
      paragraphs: ["Sayt 18 yaşından kiçik şəxslərə yönəlməyib və biz onlardan bilərəkdən məlumat toplamırıq."],
    },
    {
      id: "diger",
      title: "12. Digər saytlara keçidlər",
      paragraphs: [
        "Saytımızda CES Group şirkətlərinin saytlarına və sosial şəbəkə səhifələrinə keçidlər var. Onların öz məxfilik qaydaları tətbiq olunur və biz onların məzmununa cavabdeh deyilik.",
      ],
    },
    {
      id: "deyisiklik",
      title: "13. Siyasətdə dəyişikliklər",
      paragraphs: ["Siyasət yenilənə bilər. Cari versiya həmişə bu səhifədə yerləşir, son yenilənmə tarixi səhifənin yuxarısında göstərilir."],
    },
    {
      id: "elaqe",
      title: "14. Əlaqə",
      paragraphs: [`${operator}. ${contactLine} İş saatları: ${site.hours.label}.`],
    },
  ],
};

export const terms: LegalDoc = {
  title: "İstifadə şərtləri",
  description: "CES Group saytlarından istifadə qaydaları: məzmun, əqli mülkiyyət, müraciətlər, məsuliyyət və tətbiq olunan hüquq.",
  updated: "24 oktyabr 2026",
  intro: `Bu şərtlər ${operator} tərəfindən idarə olunan cesgroup.az saytından və onun subdomenlərindən (construction.cesgroup.az, farmart.cesgroup.az) istifadəni tənzimləyir. Saytdan istifadə etməklə bu şərtləri qəbul etmiş olursunuz. Qəbul etmirsinizsə, saytdan istifadə etməyin.`,
  sections: [
    {
      id: "ehate",
      title: "1. Saytın təyinatı",
      paragraphs: [
        "Sayt CES Group şirkətləri (CES Equipment, CES Architect, CES Construction və Farmart), onların xidmətləri və layihələri haqqında məlumat vermək və müraciət qəbul etmək üçündür.",
      ],
    },
    {
      id: "melumat",
      title: "2. Məlumatın xarakteri",
      paragraphs: [
        "Saytdakı məlumat ümumi xarakter daşıyır və ictimai təklif (oferta) deyil. Xidmətin qiyməti, müddəti, şərtləri və həcmi yalnız tərəflər arasında yazılı razılaşma (müqavilə və ya təsdiqlənmiş təklif) ilə müəyyən olunur.",
        "Saytdakı məlumatların dəqiq və aktual olması üçün səy göstəririk, lakin səhvlərə və ya köhnəlmiş məlumata görə məsuliyyət daşımırıq. Dəqiq məlumat üçün bizimlə əlaqə saxlayın.",
      ],
    },
    {
      id: "muraciet",
      title: "3. Müraciətlərin göndərilməsi",
      items: [
        "müraciətdə düzgün və aktual məlumat göstərməlisiniz",
        "başqa şəxsin adından onun razılığı olmadan müraciət göndərmək olmaz",
        "saxta, təkrarlanan, spam və ya qanunsuz məzmunlu müraciətlər qəbul olunmur",
        "müraciətin göndərilməsi xidmətin göstərilməsi öhdəliyi yaratmır; müqavilə yalnız tərəflərin razılığı ilə bağlanır",
      ],
      paragraphs: ["Müraciətdə verilən məlumatlar Məxfilik siyasətinə uyğun emal olunur."],
    },
    {
      id: "emlak",
      title: "4. Əqli mülkiyyət",
      paragraphs: [
        "Saytdakı mətnlər, dizayn, şəkillər, videolar, loqolar və digər materiallar CES Group-a və ya müvafiq hüquq sahiblərinə məxsusdur. Onların yazılı icazə olmadan kommersiya məqsədilə kopyalanması, yayılması və dəyişdirilməsi qadağandır. Şəxsi və məlumat məqsədilə istinad etmək, mənbəyə link verməklə, mümkündür.",
        "Layihələrdə adı çəkilən tədbirlərin, şirkətlərin və müştərilərin adları və loqoları öz sahiblərinə məxsusdur və saytda yalnız faktiki əməkdaşlığı göstərmək üçün istifadə olunur. Bu, onların CES Group-u təsdiq etdiyi mənasına gəlmir.",
      ],
    },
    {
      id: "qadagan",
      title: "5. Qadağan olunan istifadə",
      items: [
        "saytın və ya serverin işini pozmaq, yükləmək və ya təhlükəsizlik tədbirlərini keçməyə çalışmaq",
        "zərərli kod yaymaq və ya icazəsiz daxil olmağa cəhd etmək",
        "saytda gedən müraciət formundan spam göndərmək və ya avtomatlaşdırılmış kütləvi sorğular etmək",
        "saytı qanunsuz məqsədlər üçün istifadə etmək",
      ],
    },
    {
      id: "mesuliyyet",
      title: "6. Məsuliyyətin məhdudlaşdırılması",
      paragraphs: [
        "Sayt “olduğu kimi” təqdim olunur. Texniki nasazlıqlar, texniki işlər və ya üçüncü tərəf xidmətlərinin (hosting, Cloudflare, xəritə) kəsilməsi səbəbindən saytın müvəqqəti əlçatmaz olmasına görə məsuliyyət daşımırıq. Üçüncü tərəf saytlarının məzmununa cavabdeh deyilik.",
        "Qanunvericiliklə istisna olunmayan hallar xaric, saytdan istifadədən yaranan dolayı zərərə görə məsuliyyət daşımırıq.",
      ],
    },
    {
      id: "xidmetler",
      title: "7. Xidmət şərtləri",
      paragraphs: [
        "Texnika icarəsi, dizayn, tikinti və digər xidmətlər hər bir sifariş üçün ayrıca müqavilə ilə tənzimlənir. CES Equipment-in icarə şərtləri equipment.cesgroup.az saytındakı “Şərtlər” səhifəsində də göstərilib.",
      ],
    },
    {
      id: "mexfilik",
      title: "8. Məxfilik",
      paragraphs: ["Şəxsi məlumatların emalı Məxfilik siyasəti ilə tənzimlənir."],
    },
    {
      id: "deyisiklik",
      title: "9. Şərtlərin dəyişdirilməsi",
      paragraphs: ["Şərtləri istənilən vaxt yeniləyə bilərik. Yenilənmiş versiya bu səhifədə dərc olunduğu andan qüvvəyə minir. Son yenilənmə tarixi səhifənin yuxarısındadır."],
    },
    {
      id: "huquq",
      title: "10. Tətbiq olunan hüquq və mübahisələr",
      paragraphs: [
        "Bu şərtlərə Azərbaycan Respublikasının qanunvericiliyi tətbiq olunur. Mübahisələr əvvəlcə danışıqlar yolu ilə həll olunmağa çalışılır, razılıq əldə olunmadıqda Azərbaycan Respublikasının səlahiyyətli məhkəməsində baxılır.",
      ],
    },
    {
      id: "elaqe",
      title: "11. Əlaqə",
      paragraphs: [`${operator}. ${contactLine} İş saatları: ${site.hours.label}.`],
    },
  ],
};
