# Sinov natijalari (BMI, IV bob uchun)

Hujjat TZ’ning 13-bo‘limida belgilangan sinovlarning natijalarini jamlaydi. O‘lchovlar sanasi: **2026-yil 8-noyabr**. Muhit: MacBook (Apple Silicon), JDK 25 (Java 21 darajasi), PostgreSQL 17.9, Chrome (headless), demo katalog (22 OTM, 37 yo‘nalish, 201 dastur, 603 ta o‘tish bali).

## 1. Avtomatlashtirilgan testlar

| To‘plam | Testlar | Nimani tekshiradi |
|---|---|---|
| `AuthControllerIntegrationTest` | 10 | Ro‘yxatdan o‘tish, kirish, JWT, e-pochta normalizatsiyasi, takroriy e-pochta (409), 72 baytlik parol chegarasi, 401/405/415 xatolari |
| `CatalogIntegrationTest` | 15 | Ochiq katalog, filtrlar, sahifalash (takrorlarsiz), LIKE belgilarini ekranlash, eskirgan token, taqqoslash validatsiyasi |
| `ApplicantFlowIntegrationTest` | 7 | Profil → 36 savollik test → tavsiya → saralanganlar; tavsiya faqat egasiga ko‘rinadi |
| `AdminIntegrationTest` | 8 | Rol himoyasi, CRUD va kaskadli o‘chirish, ballar tarixi (PUT), CSV import hisoboti, UTF-8 tekshiruvi, vaznlar, statistika |
| `RecommendationEngineTest` | 17 | Har bir qat’iy filtr, toifalar, kontrakt koeffitsiyenti, qiziqish o‘xshashligi, sovuq start, tekis vektor, sabablar, determinizm |
| `ChanceEstimatorTest` | 7 | Kalendar yillar bo‘yicha trend, yillar orasidagi bo‘shliq, eskirgan tarix, logistik egri chiziq |
| `RecommendationEngineScalabilityTest` | 1 | 5 000 ta dastur < 1 s (`@Tag("performance")`, `./mvnw test -Pperf` bilan alohida ishga tushiriladi) |
| Boshqa unit testlar | 8 | `ScoreCalculator`, `RiasecScorer`, `Riasec`, `Specs` |
| **Backend jami** | **73** | |
| Frontend (Vitest) | 33 | i18n kalitlari mosligi va backend xato kodlari, formatlash, sessiya va kesh izolyatsiyasi, 401 interceptor, marshrut himoyasi, sahifalash, profil formasi, axe-core a11y |
| **Jami** | **106** | Hammasi muvaffaqiyatli o‘tadi |

Integratsion testlar haqiqiy PostgreSQL bazasida (`unikompas_test`) ishlaydi. Har bir kontekst uchun `flyway clean + migrate` bajariladi.

## 2. Test qamrovi (JaCoCo)

| Klass | Qatorlar | Shoxlanishlar |
|---|---|---|
| `RecommendationEngine` | 99,1% | 92,7% |
| `ChanceEstimator` | 94,4% | 90,0% |
| `RecommendationService` | 98,2% | 78,6% |
| `RiasecScorer` / `Riasec` | 100% | 83–100% |
| **Butun backend** | **90,3%** | **75,4%** |

Qabul mezoni `./mvnw verify` tarkibida avtomatik tekshiriladi: `recommendation`, `careertest` va `profile` paketlarining har biri ≥ 80% satr qamroviga ega bo‘lishi kerak. Tekshiruv paket darajasida qilingan, shuning uchun klass qayta nomlansa ham u chetda qolmaydi.

## 3. Unumdorlik (NFR-1)

Har bir endpoint 3 marta “isitib olingan”, keyin 30 marta o‘lchangan (`curl`, lokal).

| So‘rov | p50 | p95 | Talab |
|---|---|---|---|
| `GET /universities?regionId=1` | 4,6 ms | 5,4 ms | ≤ 300 ms |
| `GET /directions?subjectId1=1&subjectId2=2` | 5,2 ms | 5,8 ms | ≤ 300 ms |
| `GET /directions/1/programs` | 5,0 ms | 7,3 ms | ≤ 300 ms |
| `GET /programs/compare?ids=1,2,3,4` | 4,6 ms | 5,2 ms | ≤ 300 ms |
| `POST /score/calculate` | 2,2 ms | 2,4 ms | — |
| `POST /recommendations` (generatsiya + saqlash) | 13,7 ms | 34,2 ms | ≤ 1 s |
| `GET /recommendations/latest` | 6,0 ms | 7,5 ms | ≤ 300 ms |

Masshtablanish: tavsiya dvigateli **5 000 ta sintetik dasturni 4 ms da** baholadi (`RecommendationEngineScalabilityTest`). Murakkablik O(N log N), TZ §6.7.

Frontend: marshrutlar bo‘yicha code splitting’dan keyin boshlang‘ich JS hajmi **630 KB → 286 KB** (gzip bilan **199 → 89 KB**) ga tushdi. Recharts faqat grafik bor sahifalarda yuklanadi.

## 4. Foydalanish imkoniyati (NFR-6)

- **axe-core** (WCAG 2.1 A/AA): sarlavha, kirish, ro‘yxatdan o‘tish va ball kalkulyatori ekranlarida qoidabuzarlik topilmadi.
- Rang kontrasti dizayn tokenlari darajasida tekshirilgan: feruza va terrakota ranglari oq fonda ≥ 4,5:1 bo‘lishi uchun to‘qlashtirilgan.
- Klaviatura bilan boshqarish: “asosiy mazmunga o‘tish” havolasi, `:focus-visible` halqasi, native `<dialog>`, test javoblari uchun radio guruhlar.
- Ekran o‘quvchilar uchun: ikonka-tugmalarda `aria-label`, `aria-invalid` + `aria-describedby`, `role="tablist"`, progress bar.

## 5. Qo‘lda end-to-end tekshiruv

Har bir bosqich oxirida headless Chrome’da skrinshotlar olinib, uchta tilda va ikkala temada ko‘rib chiqilgan. Ishlab turgan serverga yozilgan skript **46 ta endpointning barchasini** chaqirdi: 61/61 tekshiruv muvaffaqiyatli o‘tdi. Shu jarayonda topilgan va tuzatilgan muhim xatolar:

| Topilgan xato | Ta’siri | Tuzatish |
|---|---|---|
| Dev proxy `Origin` sarlavhasini uzatardi | `127.0.0.1` orqali ochilganda login va kalkulyator 403 qaytarardi | Proxy sarlavhani olib tashlaydi |
| Katalogda qidiruv effekti har navigatsiyada qayta ishlardi | Sahifalash doim 1-sahifaga qaytardi | URL bilan ikki tomonlama barqaror bog‘lanish |
| Profil formasi `<option>` ro‘yxatlaridan oldin chizilardi | Saqlashda hudud va fanlar o‘chib ketishi mumkin edi | Forma ma’lumotnomalar yuklangach chiziladi, regression testi bor |
| Kontrakt koeffitsiyenti 0,85 | 60 ta dasturdan 59 tasi “Ishonchli” toifasida edi | 0,70 (TZ §6.3 b) |

## 6. Kod review

8 ta bosqichning har biri alohida branchda bajarilgan va `main` ga merge qilishdan oldin mustaqil kod review’dan o‘tgan. Har bir review’da topilgan kamchiliklar (poyga holatlari, xavfsizlik, yaroqsiz kesh, i18n, a11y) alohida `fix:` commitlar va regression testlar bilan tuzatilgan.

## 7. Foydalanuvchilar bilan baholash (rejalashtirilgan)

TZ §6.8 bo‘yicha himoyadan oldin 20–30 abituriyent yoki talaba ishtirokida o‘tkaziladi:
- Top-5 tavsiyalar uchun **Precision@5** va o‘rtacha baho (1–5);
- **SUS** so‘rovnomasi;
- rasmiy ballar import qilingandan keyin prognoz xatosi (MAE).

Natijalar shu bo‘limga qo‘shiladi.
