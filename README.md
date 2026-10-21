# cesgroup.az

CES Group-un korporativ saytı: Next.js 16 (App Router), TypeScript, CSS Modules.

## İşə salmaq

```bash
npm install
cp .env.example .env.local   # dəyərləri doldurun
npm run dev                  # http://localhost:3000
```

Node.js 20.9+ tələb olunur (Netlify-da 22 istifadə olunur).

| Əmr | Nə edir |
| --- | --- |
| `npm run dev` | İnkişaf serveri |
| `npm run build` | Production build |
| `npm run start` | Build-i lokal işə salır |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript yoxlaması |

## Struktur

```
src/
  app/
    page.tsx              Ana səhifə
    haqqimizda/           Haqqımızda
    elaqe/                Əlaqə (forma)
    api/contact/route.ts  Formanın backend-i: email (SMTP) + Telegram
    s/[site]/             construction.cesgroup.az və farmart.cesgroup.az saytları (aşağıya bax)
    sitemap.ts, robots.ts SEO
  components/             Header, Hero, Waves, Stats, Projects, Footer və s.
  components/subsite/     Subdomain saytlarının komponentləri
  content/site.ts         BÜTÜN mətnlər, şirkətlər, rəqəmlər, layihələr, əlaqələr
  content/subsites.ts     Construction və Farmart saytlarının mətnləri, xidmətləri, layihələri
  proxy.ts                Host-a görə subdomain sorğularını /s/<sayt>-a yönləndirir
  lib/contact-schema.ts   Formanın validasiyası (zod)
public/media/             Şəkillər və videolar
```

Mətni dəyişmək üçün adətən yalnız `src/content/site.ts` faylını redaktə etmək kifayətdir. `[...]` ilə yazılmış dəyərlər placeholder-dir.

## Subdomain saytları (Construction, Farmart)

`construction.cesgroup.az` və `farmart.cesgroup.az` ayrı tətbiq deyil, bu layihənin özündədir. `src/proxy.ts` sorğunun `Host` başlığına baxıb onu `src/app/s/[site]/...` marşrutuna yazır (brauzerdə ünvan dəyişmir). `cesgroup.az/s/...` ünvanına birbaşa giriş 404 verir. Hero-da şirkətə klik `companies[].url` ilə subdomain-ə aparır.

Hər sayt: ana səhifə, `/xidmetlerimiz` (+ detal), `/layihelerimiz` (+ detal), `/elaqe`. Dizayn CES Architecture saytı ilə eynidir. Məzmun `src/content/subsites.ts`-dədir, `[...]` placeholder-dir. Xidmət və layihə mətnləri müvəqqəti nümunədir, şəkillər `public/media/subsites/` və mövcud stok fotolardandır.

Lokal baxış (Chrome/Firefox `*.localhost`-u özü həll edir):

```bash
npm run dev
# http://construction.localhost:3000   http://farmart.localhost:3000
```

Serverdə: DNS-də `construction` və `farmart` A qeydləri, nginx-də `deploy/nginx-subdomains.conf` (hər ikisi `127.0.0.1:3010`-a proxy), sonra `certbot --nginx -d construction.cesgroup.az -d farmart.cesgroup.az`.

## Hero videoları

Hər şirkət üçün `public/media/video/` qovluğunda eyni adlı iki fayl olmalıdır: `.mp4` (H.264) və `.webm` (VP9). Yeni video hazırlamaq üçün:

```bash
ffmpeg -i input.mov -t 12 -an -vf "scale=1280:-2,fps=25" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart vid-equipment.mp4
ffmpeg -i input.mov -t 12 -an -vf "scale=1280:-2,fps=25" -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 vid-equipment.webm
```

Hero masaüstündə (≥1024px, siçanla) X şəklində 4 üçbucaq kimi görünür, hover olunan şirkətin videosu bütün hero-nu doldurur. Mobil, planşet və toxunma ekranlarında 4 kart düzülüşünə keçir.

## Əlaqə forması

`/api/contact` müraciəti seçilən şirkətin emailinə (`CONTACT_EMAIL_*`) və Telegram-a göndərir. Ən azı bir kanal (SMTP və ya Telegram) konfiqurasiya olunmalıdır, əks halda forma istifadəçiyə xəta göstərir. Dəyişənlərin siyahısı `.env.example`-dədir; Netlify-da **Site settings → Environment variables** bölməsinə əlavə edin.

Bot qoruması: forma Cloudflare Turnstile ilə qorunur (Equipment-dəki kimi). `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build zamanı, Docker-də build arg) və `TURNSTILE_SECRET_KEY` (yalnız serverdə) verilməlidir; boş qalsa qoruma söndürülür (lokal dev). Cloudflare panelində widget-in hostname siyahısına `cesgroup.az` əlavə edin, o, `construction.` və `farmart.` subdomain-lərini də əhatə edir. Lokal test üçün Cloudflare-in test açarları: sayt `1x00000000000000000000AA`, gizli `1x0000000000000000000000000000000AA`.

Telegram üçün: @BotFather-dən bot yaradın, botu qrupa əlavə edin, `TELEGRAM_CHAT_ID` olaraq qrupun ID-sini yazın.

## Netlify-a deploy

1. Reponu Netlify-a qoşun. `netlify.toml` artıq hazırdır, Next.js runtime avtomatik aşkarlanır.
2. Environment variables əlavə edin.
3. Domen: `cesgroup.az` əsas domen kimi qoşulur.

## Yayımdan əvvəl

- [ ] `public/media/*` içindəki stok foto və videoları (Unsplash/Pexels, pulsuz lisenziya) real şirkət materialları ilə əvəz edin. Xüsusilə layihə fotoları real olmalıdır.
- [ ] `site.ts`-dəki `[...]` placeholder-ləri doldurun: ünvan, qrup emaili/telefonu, şirkət əlaqələri, tarixçə illəri, sosial şəbəkə linkləri.
- [ ] Rəsmi CES Group loqosunu `src/components/Logo.tsx`-də əvəz edin.
- [ ] Müştəri loqoları Equipment saytından köçürülüb (`public/media/clients/`, `site.ts`-də `clients`). Equipment-də siyahı dəyişəndə burada da yeniləyin.
- [ ] Məxfilik siyasəti və istifadə şərtləri səhifələri.
- [ ] Xəbərlər və Karyera bölmələri admin panel (Spring Boot) hazır olandan sonra əlavə olunacaq.
