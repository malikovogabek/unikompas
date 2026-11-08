# Bepul deploy: Vercel + Render + Neon

| Qism | Xizmat | Bepul tarif shartlari (2026-yil noyabr holatiga) |
|---|---|---|
| Frontend | Vercel | Statik SPA, uyg‘otish vaqti yo‘q |
| Backend | Render (Docker, `render.yaml`) | 512 MB RAM. 15 daqiqa so‘rov bo‘lmasa uxlaydi, birinchi so‘rov taxminan 1 daqiqa kutadi. Oyiga 750 soat |
| Baza | Neon PostgreSQL | 1 GB, muddatsiz. 5 daqiqa ishlatilmasa uxlaydi, taxminan 1 soniyada uyg‘onadi |

Lokal sinov (prod profili, 512 MB sharoitiga yaqin): ilova 5 soniyada ishga tushdi va taxminan 280 MB xotira ishlatdi.

## 1. Neon — ma’lumotlar bazasi
1. https://neon.com → GitHub orqali ro‘yxatdan o‘ting → **New project** (region: *AWS Europe (Frankfurt)*).
2. **Connect** oynasidan connection string’ni oling: `postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require`.
3. Uni Render uchun uch qismga ajrating:
   - `DB_URL` = `jdbc:postgresql://HOST/DBNAME?sslmode=require`
   - `DB_USERNAME` = `USER`
   - `DB_PASSWORD` = `PASSWORD`

## 2. Render — backend
1. https://render.com → GitHub orqali kiring → **New → Blueprint** → `malikovogabek/unikompas` repozitoriysini tanlang (`render.yaml` avtomatik o‘qiladi).
2. So‘ralgan maxfiy qiymatlarni kiriting:
   - Neon’dan olingan `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`;
   - `ADMIN_PASSWORD` — kuchli parol (**hech kimga bermang**);
   - `CORS_ORIGINS` — hozircha `https://unikompas.vercel.app`, 3-qadamdan keyin haqiqiy domen bilan yangilanadi.
   - `JWT_SECRET` ni Render o‘zi generatsiya qiladi.
3. Deploy tugagach, backend manzilini yozib oling, masalan `https://unikompas-api.onrender.com`. Tekshirish: `…/api/v1/regions` va `…/swagger-ui.html`.

## 3. Vercel — frontend
1. https://vercel.com → GitHub orqali kiring → **Add New → Project** → `unikompas`.
2. **Root Directory**: `frontend` (framework Vite avtomatik aniqlanadi).
3. **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://<render-manzil>/api/v1`
   - `VITE_SHOW_DEMO_HINT` = `true`
4. **Deploy**. Olingan domenni, masalan `https://unikompas.vercel.app`, Render’dagi `CORS_ORIGINS` ga yozing (bir nechta bo‘lsa vergul bilan). Render qayta deploy qiladi.

## 4. Tekshirish
- Bosh sahifa, katalog va kalkulyator ishlaydi.
- `abituriyent@unikompas.uz` / `Demo123!` bilan kirish → profil → test → tavsiya.
- Birinchi so‘rov taxminan 1 daqiqa kutishi normal holat (Render uyg‘onyapti).

## Xavfsizlik eslatmalari
- Demo abituriyent paroli ochiq (portfolio uchun ataylab). Admin paroli faqat Render’da saqlanadi.
- Har bir `git push origin main` dan keyin Render va Vercel avtomatik qayta deploy qiladi.
- Ixtiyoriy: uyg‘otish kutishini kamaytirish uchun UptimeRobot’da `…/api/v1/regions` ga har 10 daqiqada so‘rov yuboradigan monitor qo‘shish mumkin. Bunda oyiga taxminan 730 soat sarflanadi, bu 750 soatlik limitga sig‘adi.
