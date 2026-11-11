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

## Joriy deploy (2026-11-08)

| Qism | Manzil |
|---|---|
| Frontend (Vercel) | https://unikompas.vercel.app |
| Backend (Render, Frankfurt) | https://unikompas-api.onrender.com (`srv-dboc1cu417fc73fr16a0`) |
| Baza (Neon, Frankfurt) | `unikompas` loyihasi, PostgreSQL 17 |

**Avtomatik deploy yoqilgan (2026-11-09):** `main` ga push qilinganda `backend/` o‘zgarsa Render, `frontend/` o‘zgarsa Vercel o‘zi qayta deploy qiladi. Ikkala xizmatda ham GitHub ilovasi o‘rnatilgan.

Qo‘lda deploy qilish kerak bo‘lsa:

```bash
export PATH="$HOME/.local/bin:$PATH"
render deploys create srv-dboc1cu417fc73fr16a0 --confirm   # backend
cd frontend && vercel deploy --prod --yes                   # frontend
```

## Sovuq start (cold start) va uni bartaraf etish (2026-11-11)

Render loglari bo‘yicha bepul serverda backend uyg‘onganda **88–100 soniyada** ishga tushadi. Ilgari frontend javobni 15 soniya kutar edi, shuning uchun foydalanuvchi “Server bilan aloqa yo‘q” xatosini ko‘rib, tugmani 2–3 marta bosishga majbur bo‘lardi.

Bu muammo uch qatlamda hal qilindi:

1. **Keep-alive.** `.github/workflows/keep-alive.yml` har 10 daqiqada `GET /api/v1/health` ga so‘rov yuboradi, shuning uchun server uxlamaydi. Endpoint bazaga murojaat qilmaydi, shuning uchun Neon’ning bepul hisoblash soatlari sarflanmaydi. Render health check ham shu endpointdan foydalanadi.
2. **Frontend.** Sahifa ochilishi bilan server uyg‘otiladi (`warmUpServer`). So‘rovlar 60 soniyagacha kutadi va tarmoq hamda 502/503/504 xatolarida 4 martagacha qayta uriniladi. 3 soniyadan uzoq kutishda “Server ishga tushmoqda…” xabari chiqadi.
3. **Eslatma.** GitHub repozitoriyda 60 kun hech qanday faollik bo‘lmasa, rejalashtirilgan workflow’larni o‘chirib qo‘yadi. Bunday holda uni **Actions → keep-alive → Enable** orqali qayta yoqish kerak.
