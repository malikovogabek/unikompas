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
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, React Router 7, TanStack Query 5, Zustand, React Hook Form + Zod, Axios, Recharts, lucide-react |
| Backend | Java 21, Spring Boot 4.0, Spring Web, Spring Security + JWT (jjwt), Spring Data JPA, Bean Validation, Flyway, springdoc-openapi, Lombok (cheklangan) |
| Ma’lumotlar bazasi | PostgreSQL 17 (lokal) |
| Testlar | JUnit 5, Mockito, MockMvc; Vitest |

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
    │   │   │   ├── config/          # SecurityConfig, OpenApiConfig, CorsConfig
    │   │   │   ├── exception/       # GlobalExceptionHandler, ApiError, NotFoundException, ...
    │   │   │   └── dto/             # PageResponse<T> va umumiy DTO’lar
    │   │   ├── security/            # JwtService, JwtAuthFilter, CurrentUser
    │   │   ├── auth/                # AuthController, AuthService, dto/
    │   │   ├── user/                # User, Role, UserRepository
    │   │   ├── reference/           # Region, Subject, Field + controller (ma’lumotnomalar)
    │   │   ├── university/          # University, UniversityRepository, UniversityService, UniversityController, dto/
    │   │   ├── direction/
    │   │   ├── program/             # Program, PassingScore, ProgramController, dto/
    │   │   ├── profile/             # ApplicantProfile, ScoreCalculator
    │   │   ├── careertest/          # CareerQuestion, TestAttempt, RiasecScorer
    │   │   ├── recommendation/      # RecommendationEngine, ChanceEstimator, ReasonBuilder, ...
    │   │   ├── favorite/
    │   │   └── admin/               # AdminStatsController, PassingScoreImportService, SettingsService
    │   └── resources/
    │       ├── application.yml
    │       ├── application-local.yml        # gitignore’da emas, faqat lokal standartlar
    │       └── db/migration/                # V1__init_schema.sql, V2__seed_reference.sql, ...
    └── test/java/uz/unikompas/...
```

**Har bir feature paketi ichida** (oddiy va bir xil):
`Entity.java`, `EntityRepository.java`, `EntityService.java`, `EntityController.java`, `dto/` (Java `record`lar), kerak bo‘lsa `EntityMapper.java`.
Ichki qatlam papkalari (`controller/`, `service/` …) **yaratilmaydi**.

### 3.2. Frontend tuzilmasi

```
frontend/
├── index.html
├── package.json, vite.config.ts, tsconfig*.json, .env.example
├── public/                  # favicon.svg (girih-yulduz logotip)
└── src/
    ├── main.tsx             # providerlar: QueryClient, Router
    ├── router.tsx           # barcha marshrutlar, ProtectedRoute
    ├── styles/index.css     # Tailwind + dizayn tokenlari (CSS o‘zgaruvchilari)
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

```bash
# 1. Ma’lumotlar bazasi
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
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run build` | Production build |

Demo hisoblar (seed, faqat lokal): `admin@unikompas.uz / Admin123!`, `abituriyent@unikompas.uz / Demo123!`.

---

## 5. Umumiy qoidalar

1. **Til siyosati:**
   - Kod, identifikatorlar, kod izohlari, Javadoc va **commit xabarlari** — ingliz tilida (portfolio standarti).
   - UI matnlari, Swagger’dagi `@Operation` tavsiflari, foydalanuvchiga ko‘rinadigan xato xabarlari va `docs/` — **o‘zbek tilida (lotin)**. Apostroflar: `o‘`, `g‘` (U+2018), tutuq belgisi `’` (U+2019).
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

- Prefiks: `/api/v1`. Ochiq endpointlar: `GET` katalog, `/auth/**`, `/score/calculate`.
- Status kodlari: `200` o‘qish/yangilash, `201` yaratish, `204` o‘chirish, `400` validatsiya, `401` autentifikatsiya yo‘q, `403` ruxsat yo‘q, `404` topilmadi, `409` konflikt.
- Ro‘yxatlar sahifalanadi va `PageResponse<T> { content, page, size, totalElements, totalPages }` ko‘rinishida qaytariladi.
- Xatolar faqat `GlobalExceptionHandler` orqali, yagona `ApiError` formatida qaytariladi (TZ 8-bo‘lim).

### 6.5. Ma’lumotlar bazasi

- Sxema **faqat Flyway** orqali o‘zgartiriladi: `V{n}__{description}.sql`. `ddl-auto: validate`.
- **Qo‘llanilgan migratsiya hech qachon tahrirlanmaydi.** O‘zgartirish kerak bo‘lsa, yangi migratsiya yoziladi.
- Pul summalari `BIGINT` (so‘m), ballar `NUMERIC(5,1)`, vaqt `TIMESTAMPTZ` turida saqlanadi.
- N+1 muammosidan qochish uchun ro‘yxatlarda `@EntityGraph` yoki `JOIN FETCH` ishlatiladi.

### 6.6. Lombok

Faqat `@Getter`, `@Setter`, `@NoArgsConstructor` (entity’larda) va `@RequiredArgsConstructor` (service, controller’larda) ishlatiladi. Entity’larda `@Data` va `@EqualsAndHashCode` **ishlatilmaydi**.

### 6.7. Testlar

- Tavsiya algoritmi (`recommendation/`), `RiasecScorer` va `ScoreCalculator` uchun unit testlar majburiy.
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
10. Rang va o‘lchamlar faqat dizayn tokenlari orqali beriladi. Hex qiymatlar komponent ichida yozilmaydi.

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
| `--color-turquoise` | `#0E9F9A` | `#2CC9C2` | “Ishonchli”, muvaffaqiyat, progress |
| `--color-turquoise-soft` | `#E2F5F4` | `#0F2E2E` | |
| `--color-gold` | `#D99A1E` | `#F0B94A` | Moslik foizi, reyting yulduzlari, urg‘ular |
| `--color-gold-soft` | `#FBF1DC` | `#3A2C10` | |
| `--color-terracotta` | `#C0533A` | `#E27A5F` | “Orzu” toifasi, ogohlantirish, xato |
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

- Sarlavhalar: **Manrope** (600/700/800). Body: **Inter** (400/500/600). Ikkalasi ham Google Fonts’dan olinadi va `oʻ gʻ` belgilarini to‘liq qo‘llab-quvvatlaydi.
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

## 10. Ishlash bosqichlari (yo‘l xaritasi)

Batafsil: TZ 12-bo‘lim. Joriy holat shu yerda belgilanadi.

- [x] **0.** Hujjatlash: TZ, CLAUDE.md, README
- [ ] **1.** Backend asosi: Spring Boot, PostgreSQL, Flyway V1, xatolar, Swagger
- [ ] **2.** Autentifikatsiya: JWT, rollar
- [ ] **3.** Katalog API + demo seed
- [ ] **4.** Profil, ball kalkulyatori, RIASEC testi
- [ ] **5.** Tavsiya dvigateli + unit testlar
- [ ] **6.** Frontend asosi: dizayn tizimi, layout, marshrutlar
- [ ] **7.** Frontend: auth va katalog
- [ ] **8.** Frontend: profil, test, tavsiyalar, taqqoslash, saralanganlar
- [ ] **9.** Admin panel
- [ ] **10.** Sifat: testlar, a11y, real ma’lumotlar, README skrinshotlari

## 11. Claude uchun ish tartibi

1. Har bir vazifadan oldin TZ’dagi tegishli FR/bo‘limni toping.
2. Kichik qadamlar bilan ishlang: backend endpoint → test → frontend → commit.
3. Har bir bosqich oxirida: build va testlarni ishga tushiring, shu fayldagi 10-bo‘limdagi checkbox’ni yangilang, commit qiling (9-bo‘lim formatida).
4. Yangi kutubxona qo‘shishdan oldin sababini ayting. Stekdan tashqaridagi kutubxona faqat kelishuv bilan qo‘shiladi.
5. Dizayn qarorlari faqat 8-bo‘limga muvofiq qabul qilinadi.
