<div align="center">

# 🧭 UniKompas

**Abituriyentlar uchun mos ta’lim yo‘nalishlari va OTMlarni tavsiya etish tizimi**

*A recommendation platform that helps Uzbek university applicants find the study programs and universities that fit their interests, scores and preferences.*

React · TypeScript · Java Spring Boot · PostgreSQL

</div>

---

## Muammo

Har yili bir milliondan ortiq abituriyent 200 dan ortiq OTM orasidan tanlov qiladi. O‘tish ballari, kvotalar va kontrakt narxlari turli manbalarda tarqoq holda turadi. Ko‘pchilik esa yo‘nalishni o‘z qiziqishlariga emas, boshqalarning maslahatiga qarab tanlaydi.

## Yechim

UniKompas abituriyentning:

- **fanlar majmuasi va kutilayotgan bali**ni,
- **kasbiy qiziqishlari**ni (Holland RIASEC testi),
- **afzalliklari**ni (hudud, til, ta’lim shakli, grant/kontrakt)

hisobga olib, mos yo‘nalishlar va OTMlarni **Ishonchli / Maqbul / Orzu** toifalarida tavsiya qiladi. Har bir tavsiya nima uchun berilgani ham tushuntiriladi.

## Asosiy imkoniyatlar

- Gibrid, tushuntiriladigan tavsiya algoritmi ([TZ §6](docs/TZ.md#6-tavsiya-etish-algoritmi-ilmiy-qism))
- O‘tish ballari trendi asosida kirish ehtimolini prognozlash
- RIASEC kasbiy testi va radar diagramma
- OTM va yo‘nalishlar katalogi, dasturlarni taqqoslash, saralanganlar
- Interfeys 3 tilda: o‘zbek, rus, ingliz
- Admin panel: CRUD, o‘tish ballarini CSV orqali import qilish, algoritm vaznlarini sozlash, statistika

## Texnologiyalar

| Frontend | Backend |
|---|---|
| React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Zustand, Recharts | Java 21, Spring Boot 4, Spring Security (JWT), Spring Data JPA, PostgreSQL, Flyway, Swagger (springdoc) |

## Ishga tushirish

Ishga tushirish bo‘yicha batafsil yo‘riqnoma [CLAUDE.md §4](CLAUDE.md#4-ishga-tushirish-lokal) da.

## Hujjatlar

- 📄 [Texnik topshiriq (TZ)](docs/TZ.md)
- 🛠 [Loyiha qoidalari va arxitektura](CLAUDE.md)

## Muallif

**Malikov Og‘abek Sherzod o‘g‘li** — bitiruv malakaviy ishi, [Universitet nomi], 2027 · [GitHub](https://github.com/malikovogabek)
