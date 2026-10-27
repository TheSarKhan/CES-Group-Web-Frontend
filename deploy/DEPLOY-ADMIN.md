# admin.cesgroup.az: deploy ardıcıllığı

Server: `/var/www/ces` (Equipment backend, Postgres, Redis, şəbəkə `ces_ces-net`) və `/var/www/cesgroup` (qrup frontend-i).
ERP konteynerlərinə toxunulmur.

1. **Backend** (`backend/deploy/deploy-backend.sh`): DB ehtiyat nüsxəsi, köhnə image-in `pre-iam` etiketi, yeni mənbə, `docker compose build ces-backend && up -d ces-backend`.
   Flyway V25 və V26-nı özü tətbiq edir (yalnız əlavə edici). Geri qayıtmaq: `pre-iam` image-i + `docker compose up -d ces-backend`.
2. **DNS** (Cloudflare): `admin` adlı A qeydi, `158.220.127.147`, Proxied (narıncı bulud).
3. **nginx + SSL**: `deploy/nginx-admin.conf` faylını `/etc/nginx/sites-available/cesgroup-admin.conf` kimi qoyub link edin, sonra
   `certbot certonly --nginx -d admin.cesgroup.az`, `nginx -t && systemctl reload nginx`.
4. **Frontend**: `main`-ə push (CI `docker compose up -d --build` edir). `docker-compose.yml` konteyneri `ces_ces-net` şəbəkəsinə qoşur və `BACKEND_URL=http://ces-backend:8080` verir.
5. **Yoxlama**: `https://admin.cesgroup.az/login`, Super Admin ilə giriş, 2FA quraşdırması, `https://cesgroup.az/elaqe` formundan test müraciəti.
