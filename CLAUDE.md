# CLAUDE.md — UniKompas

Bu fayl loyiha ustida ishlaydigan har bir dasturchi (va Claude) uchun **yagona qoidalar manbai**.
Kod yozishdan oldin uni o‘qing. Biror qoida bilan kelishmasangiz, avval shu faylni yangilang, keyin kodni o‘zgartiring.

---

## 1. Loyiha haqida

**UniKompas** — abituriyentlarga fanlar majmuasi, kutilayotgan bali, kasbiy qiziqishlari (RIASEC testi) va afzalliklari asosida mos **ta’lim yo‘nalishlari** va **OTMlarni** tavsiya qiluvchi fullstack veb-ilova.

- Bitiruv malakaviy ishi (BMI) va muallifning portfolio loyihasi.
- To‘liq talablar: [`docs/TZ.md`](docs/TZ.md). Ziddiyat bo‘lsa, **TZ ustun turadi**.
- Algoritm tafsilotlari: TZ 6-bo‘lim. Algoritmni o‘zgartirsangiz, TZ’ni ham yangilang.

## 2. Texnologiyalar steki

| Qism | Stek |
|---|---|
| Frontend | React 19, TypeScript 7 (strict, `noUncheckedIndexedAccess`), Vite 8, Tailwind CSS 4, React Router 8, TanStack Query 5, Zustand 5, React Hook Form + Zod 4, Axios, Recharts, lucide-react, **react-i18next** (uz/ru/en), oxlint |
| Backend | Java 21, Spring Boot 4.1, Spring Web MVC, Spring Security + OAuth2 Resource Server (JWT HS256, Nimbus), Spring Data JPA (Hibernate 7), Bean Validation, Flyway, springdoc-openapi 3, Lombok (cheklangan) |
| Ma’lumotlar bazasi | PostgreSQL 17 (lokal) |
| Testlar | JUnit 5, Mockito, MockMvc; Vitest + Testing Library (jsdom) |

## 3. Monorepo tuzilmasi

```
App/
├── CLAUDE.md                 # shu fayl — qoidalar
├── README.md                 # portfolio uchun taqdimot va ishga tushirish
├── docs/
│   ├── TZ.md                 # texnik topshiriq
│   └── screenshots/          # README uchun rasmlar (10-bosqich)
├── backend/                  # Java Spring Boot
└── frontend/                 # React + TypeScript
```

### 3.1. Backend tuzilmasi (feature bo‘yicha paketlar)

```
backend/
├── pom.xml
├── mvnw, mvnw.cmd, .mvn/
└── src/
    ├── main/
    │   ├── java/uz/unikompas/
    │   │   ├── UniKompasApplication.java
    │   │   ├── common/
    │   │   │   ├── config/          # UniKompasProperties, OpenApiConfig
    │   │   │   ├── exception/       # GlobalExceptionHandler, ApiError, NotFoundException, ...
    │   │   │   └── dto/             # PageResponse<T> va umumiy DTO’lar
    │   │   ├── security/            # SecurityConfig (CORS, JWT encoder/decoder), JwtService, CurrentUser
    │   │   ├── auth/                # AuthController, AuthService, dto/
    │   │   ├── user/                # User, Role, UserRepository, AccountInitializer (admin/demo seed)
    │   │   ├── reference/           # Region, Subject, Field + controller (ma’lumotnomalar)
    │   │   ├── university/          # University, UniversityRepository, UniversityService, UniversityController, dto/
    │   │   ├── direction/
    │   │   ├── program/             # Program, PassingScore, ProgramController, dto/
    │   │   ├── profile/             # ApplicantProfile, ScoreCalculator
    │   │   ├── careertest/          # CareerQuestion, TestAttempt, RiasecScorer
    │   │   ├── recommendation/      # RecommendationEngine, ChanceEstimator, ReasonBuilder, ...
    │   │   ├── favorite/
    │   │   └── admin/               # Admin*Controller, PassingScoreImportService, AdminStatsService, AdminUserService
    │   └── resources/
    │       ├── application.yml
    │       ├── application-local.yml        # gitignore’da emas, faqat lokal standartlar
    │       ├── db/migration/                # versiyalangan sxema + ma’lumotnomalar (barcha muhitlar)
    │       └── db/demo/                     # R__demo_catalog.sql — faqat local/test profillarda
    └── test/
        ├── java/uz/unikompas/support/       # @IntegrationTest (toza DB + MockMvc)
        └── resources/application-test.yml   # unikompas_test bazasi
```

**Har bir feature paketi ichida** (oddiy va bir xil):
`Entity.java`, `EntityRepository.java`, `EntityService.java`, `EntityController.java`, `dto/` (Java `record`lar), kerak bo‘lsa `EntityMapper.java`.
Ichki qatlam papkalari (`controller/`, `service/` …) **yaratilmaydi**.

### 3.2. Frontend tuzilmasi

```
frontend/
├── index.html
├── package.json, vite.config.ts, .env.example
├── tsconfig.app.json         # ilova kodi (testlarsiz), tsconfig.test.json — testlar (node + vitest turlari)
├── public/                  # favicon.svg (girih-yulduz logotip)
└── src/
    ├── main.tsx             # providerlar: QueryClient, Router
    ├── router.tsx           # barcha marshrutlar, ProtectedRoute
    ├── styles/index.css     # Tailwind + dizayn tokenlari (CSS o‘zgaruvchilari)
    ├── i18n/
    │   ├── index.ts         # i18next sozlamasi, til aniqlash, Intl formatlash
    │   └── locales/         # uz.json (standart), ru.json, en.json
    ├── api/                 # client.ts (axios) + har bir domen uchun fayl: auth.ts, universities.ts, ...
    ├── types/               # backend DTO’lariga mos TS tiplar (api.ts)
    ├── store/               # authStore.ts (Zustand)
    ├── hooks/               # useAuth, useDebounce, ...
    ├── lib/                 # cn(), formatlash (so‘m, bal), konstantalar
    ├── components/
    │   ├── ui/              # Button, Input, Select, Card, Badge, Modal, Skeleton, EmptyState, ...
    │   ├── layout/          # AppLayout, AdminLayout, Header, Footer
    │   └── domain/          # ChanceBadge, MatchRing, RiasecRadar, ProgramCard, ScoreTrendChart, ...
    └── pages/
        ├── HomePage.tsx, LoginPage.tsx, RegisterPage.tsx, NotFoundPage.tsx
        ├── universities/    # UniversitiesPage.tsx, UniversityDetailPage.tsx
        ├── directions/
        ├── programs/
        ├── applicant/       # DashboardPage, ProfilePage, CareerTestPage, TestResultPage, RecommendationsPage, ComparePage, FavoritesPage
        └── admin/
```

Qoida: komponent faqat **bitta sahifada** ishlatilsa, o‘sha sahifa papkasida turadi. Ikki va undan ortiq joyda ishlatilsa, `components/` ga ko‘chiriladi.

## 4. Ishga tushirish (lokal)

Talablar: **JDK 21+**, **Node.js 20+**, **PostgreSQL 17**.

> **Ushbu ish kompyuterida** (Homebrew’siz) vositalar `~/.local` ga o‘rnatilgan:
> `export PATH="$HOME/.local/bin:$PATH"` — node, npm, gh, psql, pg_ctl.
> PostgreSQL klasteri: `~/.local/var/pg17`, port 5432.
> Ishga tushirish: `pg_ctl -D ~/.local/var/pg17 -l ~/.local/var/pg17.log -o "-k /tmp" start`.
> DB: `unikompas` va `unikompas_test`, user/parol: `unikompas` / `unikompas` (faqat lokal muhit uchun).
> Maven alohida o‘rnatilmaydi: `./mvnw` o‘zi yuklab oladi. JDK 25 o‘rnatilgan, loyiha Java 21 darajasida kompilyatsiya qilinadi.

```bash
# 1. Ma’lumotlar bazasi (boshqa kompyuterda)
createdb unikompas            # user/parol: application-local.yml ga qarang

# 2. Backend  →  http://localhost:8080  |  Swagger: /swagger-ui.html
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# 3. Frontend →  http://localhost:5173
cd frontend && npm install && npm run dev
```

Foydali buyruqlar:

| Buyruq | Vazifasi |
|---|---|
| `./mvnw test` | Backend testlari |
| `./mvnw verify` | Yig‘ish va testlar |
| `npm run lint` | oxlint (Rust, ESLint’ga mos qoidalar) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run build` | Production build |

Demo hisoblar (seed, faqat lokal): `admin@unikompas.uz / Admin123!`, `abituriyent@unikompas.uz / Demo123!`.

---

## 5. Umumiy qoidalar

1. **Til siyosati:**
   - Kod, identifikatorlar, kod izohlari, Javadoc va **commit xabarlari** — ingliz tilida (portfolio standarti).
   - UI 3 tilda ishlaydi (uz — standart, ru, en): matnlar **faqat** `src/i18n/locales/*.json` da saqlanadi (7-bo‘lim, 11-band).
   - Swagger’dagi `@Operation` tavsiflari va `docs/` — **o‘zbek tilida (lotin)**. Apostroflar: `o‘`, `g‘` (U+2018), tutuq belgisi `’` (U+2019).
   - Backend foydalanuvchiga matn emas, **xato kodi** qaytaradi (`error: "EMAIL_TAKEN"`). `message` maydonida inglizcha texnik izoh bo‘ladi, tarjima frontendda qilinadi.
2. **Oddiylik birinchi o‘rinda.** Keraksiz abstraksiya, generic “base” klasslar va oldindan “kelajak uchun” kod yozilmaydi.
3. Har bir o‘zgarish TZ’dagi talabga (FR-x.x) bog‘langan bo‘lishi kerak.
4. Sirlar (parol, JWT secret) kodga yozilmaydi: environment variable yoki `application-local.yml` orqali beriladi.
5. Ishlamaydigan yoki izohga olingan (commented-out) kod commit qilinmaydi.

## 6. Backend qoidalari

### 6.1. Qatlamlar

- **Controller** — faqat HTTP: validatsiya (`@Valid`), service’ni chaqirish, DTO qaytarish. Biznes mantiq yozilmaydi.
- **Service** — biznes mantiq va tranzaksiyalar (`@Transactional`, o‘qish uchun `readOnly = true`).
- **Repository** — Spring Data JPA interfeyslari. Murakkab filtrlar uchun `Specification` yoki JPQL ishlatiladi.
- **Entity hech qachon API’dan qaytarilmaydi.** Faqat DTO (`record`) qaytariladi.

### 6.2. Nomlash

| Element | Format | Misol |
|---|---|---|
| Entity | birlik, PascalCase | `University`, `PassingScore` |
| DTO | maqsad + `Request` / `Response` | `UniversityResponse`, `ProfileUpdateRequest` |
| Jadval va ustunlar | snake_case, ko‘plik | `passing_scores.grant_score` |
| Enum qiymatlari | UPPER_SNAKE | `FULL_TIME`, `GRANT_ONLY` |
| REST yo‘llari | kebab-case, ko‘plik | `/api/v1/career-test/results` |

### 6.3. API hujjatlash (majburiy)

**Har bir endpoint** Swagger annotatsiyalari va Javadoc bilan izohlanadi. Endpoint nima qilishi, kim chaqira olishi va qanday javoblar qaytarishi ko‘rsatiladi:

```java
/**
 * Generates a new recommendation for the current applicant using the
 * hybrid scoring model (interest, chance, preference, rating) — see TZ §6.
 * The result is persisted so the applicant can review it later.
 */
@Operation(
    summary = "Yangi tavsiya generatsiya qilish",
    description = "Abituriyent profili va oxirgi RIASEC test natijasi asosida mos yo‘nalishlar "
                + "hamda OTM dasturlarini Ishonchli/Maqbul/Orzu toifalarida qaytaradi. "
                + "Profil to‘ldirilmagan bo‘lsa, 409 qaytariladi."
)
@ApiResponse(responseCode = "201", description = "Tavsiya yaratildi")
@ApiResponse(responseCode = "409", description = "Profil to‘ldirilmagan")
@PostMapping
@PreAuthorize("hasRole('APPLICANT')")
public ResponseEntity<RecommendationResponse> generate(@AuthenticationPrincipal CurrentUser user) { ... }
```

Har bir controller klassiga `@Tag(name = "…", description = "…")` qo‘yiladi.

### 6.4. API konvensiyalari

- Prefiks: `/api/v1`. Ochiq endpointlar: `GET` katalog, `/auth/register|login`, `/score/calculate`.
- **Katalog prefikslari** (`/universities/**`, `/directions/**`, `/programs/**`) GET uchun **to‘liq ochiq**. Shaxsiy ma’lumot qaytaradigan endpointlar ular ostida yozilmaydi, o‘z prefikslarida (`/profile`, `/recommendations`, `/favorites`, `/admin`) bo‘ladi. Ochiq so‘rovlarda `Authorization` sarlavhasi e’tiborga olinmaydi (eskirgan token 401 bermaydi).
- Istisno: o‘zgarmas kichik to‘plamlar (ma’lumotnomalar, 36 ta test savoli, 2–4 dasturni taqqoslash) oddiy massiv sifatida qaytariladi. Foydalanuvchi bilan o‘sib boradigan ro‘yxatlar (tarix, saralanganlar) albatta sahifalanadi.
- Sahifalashda tartib doim yagona bo‘lishi kerak: `Pageables.withIdTiebreaker` (`id` qo‘shiladi) yoki so‘rovda `ORDER BY ..., id`. Ichki ro‘yxatlar (`/{id}/programs`) ham sahifalanadi.
- Qidiruv faqat `Specs.containsIgnoreCase` orqali bajariladi (`%` va `_` escape qilinadi).
- Status kodlari: `200` o‘qish/yangilash, `201` yaratish, `204` o‘chirish, `400` validatsiya, `401` autentifikatsiya yo‘q, `403` ruxsat yo‘q, `404` topilmadi, `409` konflikt.
- Ro‘yxatlar sahifalanadi va `PageResponse<T> { content, page, size, totalElements, totalPages }` ko‘rinishida qaytariladi.
- Xatolar faqat `GlobalExceptionHandler` orqali, yagona `ApiError` formatida qaytariladi (TZ 8-bo‘lim).

### 6.5. Ma’lumotlar bazasi

- Sxema **faqat Flyway** orqali o‘zgartiriladi: `V{n}__{description}.sql`. `ddl-auto: validate`.
- **Qo‘llanilgan migratsiya hech qachon tahrirlanmaydi.** O‘zgartirish kerak bo‘lsa, yangi migratsiya yoziladi.
- Pul summalari `BIGINT` (so‘m), ballar `NUMERIC(5,1)`, vaqt `TIMESTAMPTZ` turida saqlanadi.
- N+1 muammosidan qochish uchun ro‘yxatlarda `@EntityGraph` yoki `JOIN FETCH` ishlatiladi.
- **Demo ma’lumotlar** faqat `db/demo/` dagi repeatable migratsiyada saqlanadi (`R__*.sql`, katalogni tozalab qayta yozadi). U `local` va `test` profillarida `spring.flyway.locations` orqali ulanadi va production’ga hech qachon tushmaydi.
- Idempotent qo‘shish (masalan, saralanganlar) `INSERT ... ON CONFLICT DO NOTHING` orqali bajariladi: "tekshir-keyin-yoz" usuli parallel so‘rovlarda 500 xato beradi.
- Ko‘p qatorli `saveAll` qilinadigan jadvallar `SEQUENCE` (pooled, allocationSize = 50) va JDBC batch ishlatadi.
- Biznes qoidasi bitta joyda yoziladi. Agar u JPQL’da ham kerak bo‘lsa, Java metodining yonida konstanta sifatida turadi (masalan, `ApplicantProfile.COMPLETE_JPQL` ↔ `isComplete()`).
- Ixtiyoriy filtrlar `Specification` orqali yoziladi. Parametr bo‘lmasa `Specification.unrestricted()` qaytariladi (Spring Data 4 `null` qabul qilmaydi).
- Har bir repozitoriy alohida faylda yoziladi: Spring Data ichki (nested) interfeyslarni topmaydi.

### 6.6. Lombok

Faqat `@Getter`, `@Setter`, `@NoArgsConstructor` (entity’larda), `@RequiredArgsConstructor` (service, controller’larda) va `@Slf4j` (logger) ishlatiladi. Entity’larda `@Data` va `@EqualsAndHashCode` **ishlatilmaydi**.

### 6.7. Testlar

- Tavsiya algoritmi (`recommendation/`), `RiasecScorer` va `ScoreCalculator` uchun unit testlar majburiy.
- Unit testlar `*Test.java`, integratsion testlar `*IntegrationTest.java` deb nomlanadi va `@IntegrationTest` annotatsiyasi bilan belgilanadi. Integratsion testlar lokal `unikompas_test` bazasida ishlaydi va har bir kontekst uchun `flyway clean + migrate` bajariladi.
- Joriy foydalanuvchi controllerda `@AuthenticationPrincipal Jwt jwt` → `CurrentUser.from(jwt)` orqali olinadi.
- JSONB ustunlar Java’da `String` sifatida saqlanadi (`@Column(columnDefinition = "jsonb")` + `@ColumnTransformer(write = "?::jsonb")`) va Spring’ning `tools.jackson.databind.json.JsonMapper` (Jackson 3) orqali serializatsiya qilinadi.
- `RecommendationEngine` sof klass: Spring annotatsiyalari, JPA va HTTP’ga bog‘liq emas. Bean sifatida `RecommendationConfig` orqali ro‘yxatdan o‘tkaziladi. Kirish — `ApplicantInput` va `ProgramCandidate` recordlari. Algoritmdagi har bir o‘zgarish unit test va TZ §6 bilan birga commit qilinadi.
- Test nomlari tavsifiy bo‘ladi: `shouldReturnHighChance_whenScoreAboveForecast()`.

## 7. Frontend qoidalari

1. **TypeScript strict.** `any` taqiqlangan. Noma’lum ma’lumot uchun `unknown` va type guard ishlatiladi.
2. Faqat funksional komponentlar. Props tiplari `type XxxProps = {...}` ko‘rinishida yoziladi. Har bir faylda bitta eksport qilingan komponent bo‘ladi.
3. **Server ma’lumotlari faqat TanStack Query orqali olinadi.** `useEffect` + `fetch` ishlatilmaydi. Query kalitlari `['universities', filters]` ko‘rinishida beriladi.
4. API chaqiruvlari faqat `src/api/*` da yoziladi. Komponentlar axios’ni to‘g‘ridan-to‘g‘ri chaqirmaydi.
5. Formalar React Hook Form + Zod sxemasi bilan yaratiladi. Xato xabarlari o‘zbek tilida bo‘ladi.
6. Global holat (Zustand) faqat auth uchun ishlatiladi. Qolgan holat — lokal `useState` yoki URL (`useSearchParams`, filtrlar uchun).
7. Har bir ma’lumot ko‘rsatiladigan joyda **3 holat** bo‘lishi shart: yuklanish (Skeleton), xato (qayta urinish tugmasi bilan), bo‘sh (EmptyState).
8. Nomlash: komponentlar `PascalCase.tsx`, hook’lar `useCamelCase.ts`, qolgan fayllar `camelCase.ts`.
9. Importlarda `@/` aliasi (`src/`) ishlatiladi.
10. Rang va o‘lchamlar faqat dizayn tokenlari orqali beriladi (`bg-surface`, `text-muted`, `border-line`, `bg-primary-soft` …, `src/styles/index.css`). Hex qiymatlar komponent ichida yozilmaydi. Mavzu `<html data-theme>` atributi orqali almashadi, `dark:` varianti shunga bog‘langan.
12. Komponent fayllari faqat komponent eksport qiladi (Fast Refresh uchun). Yordamchi funksiya va konstantalar alohida `.ts` faylda turadi (masalan, `buttonStyles.ts`).
13. Backend xatolari `useApiErrorMessage()` orqali ko‘rsatiladi: `errors.<CODE>` va `validation.<constraint>`. `locales.test.ts` uchala tildagi kalitlar bir xilligini va backend `ErrorCode` enum’idagi har bir kodning tarjimasi borligini tekshiradi.
14. **Sessiya va kesh:** sessiya o‘zgarganda (chiqish, muddat tugashi, boshqa foydalanuvchi kirishi) `queryClient` keshi to‘liq tozalanadi (`lib/queryClient.ts`). Shuning uchun foydalanuvchiga tegishli query kalitlariga user id qo‘shish shart emas. Backend ma’lumotlari tilga bog‘liq emas (frontend kodlarni tarjima qiladi), shuning uchun kalitlarga til qo‘shilmaydi.
15. Rolga qarab bosh sahifa faqat `homePathFor(role)` (`lib/routes.ts`) orqali aniqlanadi.
16. Katalog filtrlari URL’da saqlanadi (`useSearchParamState`): filtr o‘zgarganda `page` 0 ga qaytadi, qidiruv 300 ms debounce bilan yoziladi.
17. Grafiklar (Recharts) animatsiyasiz chiziladi (`isAnimationActive={false}`). Ranglar CSS o‘zgaruvchilari orqali beriladi (`var(--uk-primary)`). Ro‘yxat qatorlaridagi kichik trend grafiklari Recharts’siz, oddiy SVG (`Sparkline`) bilan chiziladi.
18. Sonlar `lib/format.ts` orqali formatlanadi. O‘zbek tili uchun sonlar `ru-RU` qoidalari bilan chiqariladi (bo‘sh joy bilan guruhlash, o‘nlik vergul), chunki brauzerlarda `uz` CLDR ma’lumotlari to‘liq emas.
19. Modal oynalar faqat `components/ui/Modal` (native `<dialog>`) orqali ochiladi: fokus tuzog‘i, Esc va fonning nofaol bo‘lishi brauzer tomonidan ta’minlanadi. O‘chirish amali faqat `ConfirmDialog` orqali, oqibatlari tushuntirilgan holda bajariladi.
20. `<select>` bor formalar faqat **variantlar ro‘yxati yuklangandan keyin** chiziladi (mount qilinadi). Aks holda brauzer birinchi variantni tanlab qo‘yadi va saqlash paytida haqiqiy qiymat yo‘qoladi (`ProfilePage` regression testi).
11. **Lokalizatsiya (i18n):**
    - JSX ichida qattiq yozilgan matn bo‘lmaydi. Hamma matn `const { t } = useTranslation()` → `t('catalog.filters.region')` orqali olinadi.
    - Kalitlar `bo‘lim.kichikBo‘lim.kalit` (camelCase) formatida yoziladi. Umumiy so‘zlar `common.*` da, xato kodlari `errors.<CODE>` da saqlanadi.
    - `uz.json` — asosiy fayl. Yangi kalit **bir commit ichida uchala faylga** qo‘shiladi.
    - Sanalar, raqamlar va so‘m `lib/format.ts` dagi `Intl` asosidagi funksiyalar orqali formatlanadi (joriy til bo‘yicha).
    - Tanlangan til `localStorage` (`unikompas.lang`) da saqlanadi va `<html lang>` atributi yangilanadi.
    - Matn uzunligi tillarga qarab farq qiladi (rus tilida ~30% uzunroq), shuning uchun tugma va kartalarda qat’iy kenglik berilmaydi.

---

## 8. Dizayn tizimi — “Registon”

Dizayn mavzudan kelib chiqadi: **Registon madrasalari** — O‘zbekistondagi ta’limning tarixiy ramzi. Ilovaga koshinlardagi lojuvard, feruza, zarhal va g‘isht ranglari zamonaviy, toza va minimalistik talqinda olingan.

> ❌ **Qilinmaydi:** bej yoki krem fon, to‘q sariq (orange) asosiy rang, “AI-gradient” (binafsha → pushti), har joyda emoji, ortiqcha soya va glassmorphism, umumiy shablon ko‘rinishi.

### 8.1. Ranglar (CSS o‘zgaruvchilari, `src/styles/index.css`)

| Token | Light | Dark | Qo‘llanilishi |
|---|---|---|---|
| `--color-lapis-900` | `#0E1B45` | — | Sarlavhalar, hero fon |
| `--color-lapis-700` | `#1B3488` | — | |
| `--color-primary` | `#2447B8` (lapis-600) | `#6F8CF0` | Asosiy tugmalar, havolalar, faol holat |
| `--color-primary-soft` | `#E8EDFB` | `#1A2550` | Tanlangan element foni |
| `--color-turquoise` | `#0B8C87` | `#2CC9C2` | “Ishonchli”, muvaffaqiyat, progress (oq fonda AA kontrast) |
| `--color-turquoise-soft` | `#E2F5F4` | `#0F2E2E` | |
| `--color-gold` | `#D99A1E` | `#F0B94A` | Moslik foizi, reyting yulduzlari, urg‘ular |
| `--color-gold-soft` | `#FBF1DC` | `#3A2C10` | |
| `--color-terracotta` | `#B8492F` | `#E27A5F` | “Orzu” toifasi, ogohlantirish, xato (oq fonda AA kontrast) |
| `--color-terracotta-soft` | `#F9E7E2` | `#3A1C15` | |
| `--color-bg` | `#F4F6FB` (chinni) | `#0A0F1F` | Sahifa foni |
| `--color-surface` | `#FFFFFF` | `#121A30` | Kartalar |
| `--color-border` | `#DDE3F0` | `#25304D` | |
| `--color-text` | `#0F172A` | `#E7ECF7` | Asosiy matn |
| `--color-text-muted` | `#55607A` | `#98A3BE` | Ikkinchi darajali matn |

**Tavsiya toifalari xaritasi** (UI’da hamma joyda bir xil ishlatiladi):
`SAFE` → feruza · `TARGET` → lapis (primary) · `REACH` → terrakota.

**RIASEC radar ranglari:** bitta seriya — `primary` chiziq + 20% shaffof to‘ldirish. Raqiblar bilan solishtirishda ikkinchi seriya `gold` rangida beriladi.

Kontrast: barcha matn va fon juftliklari WCAG AA (≥ 4.5:1) talabiga javob berishi kerak. `gold` rangi matn sifatida oq fonda ishlatilmaydi, faqat ikonka, chiziq yoki to‘q fondagi matn uchun ishlatiladi.

### 8.2. Tipografiya

- Sarlavhalar: **Manrope** (600/700/800). Body: **Inter** (400/500/600). Ikkalasi ham Google Fonts’dan `latin, latin-ext, cyrillic` subsetlari bilan yuklanadi va `oʻ gʻ` belgilarini hamda rus tilini to‘liq qo‘llab-quvvatlaydi.
- Raqamlar (ballar, narxlar) uchun `font-variant-numeric: tabular-nums` ishlatiladi.
- Shkala (px): 12 · 14 · 16 (body) · 18 · 20 · 24 · 30 · 36 · 48 (hero).

### 8.3. Shakl, bo‘shliq va harakat

- Bo‘shliqlar 4px tizimida: 4, 8, 12, 16, 24, 32, 48, 64.
- Radius: `--radius-sm: 8px` (input, badge), `--radius-md: 12px` (karta, tugma), `--radius-lg: 20px` (hero, modal).
- Soyalar yengil va sovuq tusda: `0 1px 2px rgb(14 27 69 / .06), 0 4px 16px rgb(14 27 69 / .06)`.
- Animatsiyalar 150–250 ms, `ease-out`. `prefers-reduced-motion` holati hurmat qilinadi.
- Kontent maksimal kengligi 1200px. Mobil yon bo‘shliq 16px.

### 8.4. Brend elementlari

- **Logotip:** sakkiz qirrali girih yulduzi, ichida kompas strelkasi (lapis + zarhal), SVG formatida.
- **Naqsh:** hero va bo‘sh holatlarda girih geometrik naqshi (SVG, 4–6% shaffoflik).
- **Ikonkalar:** `lucide-react`, 1.75px chiziq. Emoji ishlatilmaydi.
- **MatchRing:** moslik foizi uchun doiraviy progress (zarhal rang, markazda katta raqam). Bu ilovaning asosiy vizual elementi.

### 8.5. Ovoz va matn uslubi

Matnlar do‘stona, aniq va “siz” shaklida yoziladi. Masalan: “Profilingizni to‘ldiring — tavsiyalar aniqroq bo‘ladi”. Ehtimollar hech qachon kafolat sifatida berilmaydi. “Prognoz” va “ehtimol” so‘zlari ishlatiladi.

---

## 9. Git va commit qoidalari

### 9.1. Branchlar

- `main` — doim ishlaydigan holatda turadi.
- Har bir bosqich yoki funksiya uchun alohida branch ochiladi: `feat/auth`, `feat/recommendation-engine`, `fix/profile-validation`, `docs/tz`. Ish tugagach, `main` ga merge qilinadi.

### 9.2. Commit formati — Conventional Commits

```
<type>(<scope>): <short imperative summary, ≤ 72 chars>

<body: WHAT changed and WHY, wrapped at 72 chars.
 For API commits list every endpoint and what it does.>

Refs: FR-6.1, TZ §6
```

**type:** `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `build`, `perf`.
**scope:** `backend`, `frontend`, `auth`, `catalog`, `profile`, `career-test`, `recommendation`, `favorite`, `admin`, `ui`, `db`, `docs`.

**API commit namunasi:**

```
feat(catalog): add university listing and details endpoints

Expose the public university catalog so guests can browse institutions
before signing up.

Endpoints:
- GET /api/v1/universities       — paged list; filters: search, regionId, type
- GET /api/v1/universities/{id}  — full details incl. rating and dormitory info
- GET /api/v1/universities/{id}/programs — programs offered by the university

Uses JPA Specifications for optional filters and @EntityGraph to avoid N+1.

Refs: FR-5.1, FR-5.2
```

Qoidalar: bitta commit = bitta mantiqiy o‘zgarish. Commit kompilyatsiya qilinadigan va testlari o‘tadigan holatda bo‘ladi. `WIP`, `fix`, `update` kabi ma’nosiz xabarlar yozilmaydi.

### 9.3. Review → push jarayoni (har bir bosqichda majburiy)

1. Bosqich `feat/<stage-name>` branchida bajariladi.
2. Build va testlar o‘tadi (`./mvnw verify`, `npm run typecheck && npm run lint && npm run build`).
3. **Kod review:** `git diff main...HEAD` ko‘rib chiqiladi. To‘g‘rilik, xavfsizlik, CLAUDE.md qoidalariga moslik, i18n (qattiq yozilgan matn yo‘qligi), dizayn tokenlari tekshiriladi. Topilgan kamchiliklar alohida `fix:` yoki `refactor:` commitlar bilan tuzatiladi.
4. `main` ga `--no-ff` merge qilinadi (bosqich tarixi saqlanadi) va `git push origin main` bajariladi.

Remote: `https://github.com/malikovogabek/unikompas`.

## 10. Ishlash bosqichlari (yo‘l xaritasi)

Batafsil: TZ 12-bo‘lim. Joriy holat shu yerda belgilanadi.

- [x] **0.** Hujjatlash: TZ, CLAUDE.md, README, GitHub repozitoriy
- [x] **1.** Backend asosi va autentifikatsiya: Spring Boot, PostgreSQL, Flyway V1, xatolar, Swagger, JWT
- [x] **2.** Katalog API va demo ma’lumotlar
- [x] **3.** Profil, RIASEC testi, tavsiya dvigateli, saralanganlar va unit testlar
- [x] **4.** Admin API: CRUD, CSV import, vaznlar, statistika
- [x] **5.** Frontend asosi: dizayn tizimi, UI kit, layout, i18n (uz/ru/en), auth sahifalari
- [x] **6.** Frontend: bosh sahifa, katalog, dastur sahifasi, ball kalkulyatori
- [x] **7.** Frontend: abituriyent kabineti (profil, test, tavsiyalar, taqqoslash, saralanganlar) va admin panel
- [ ] **8.** Testlash va topshirish: integratsion va frontend testlar, e2e, a11y, README, `v1.0.0` — **loyiha tayyor**

## 11. Claude uchun ish tartibi

1. Har bir vazifadan oldin TZ’dagi tegishli FR/bo‘limni toping.
2. Kichik qadamlar bilan ishlang: backend endpoint → test → frontend → commit.
3. Har bir bosqich oxirida: build va testlarni ishga tushiring, shu fayldagi 10-bo‘limdagi checkbox’ni yangilang, commit qiling (9-bo‘lim formatida).
4. Yangi kutubxona qo‘shishdan oldin sababini ayting. Stekdan tashqaridagi kutubxona faqat kelishuv bilan qo‘shiladi.
5. Dizayn qarorlari faqat 8-bo‘limga muvofiq qabul qilinadi.
6. Har bir bosqich 9.3-bo‘limdagi **review → merge → push** jarayoni bilan yakunlanadi.
