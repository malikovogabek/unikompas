import i18n, { currentLanguage, type Language } from '@/i18n'

// Browsers ship incomplete CLDR data for Uzbek (Chrome prints "16,000,000" and "155.4").
// Uzbek conventions match Russian ones — space grouping, decimal comma — so numbers use ru-RU.
const NUMBER_LOCALES: Record<Language, string> = { uz: 'ru-RU', ru: 'ru-RU', en: 'en-GB' }
// Same CLDR gap for dates ("2026 M11 8"): Uzbek uses numeric dd.mm.yyyy, as in ru-RU.
const DATE_LOCALES: Record<Language, string> = { uz: 'ru-RU', ru: 'ru-RU', en: 'en-GB' }

const SUM: Record<Language, string> = { uz: 'so‘m', ru: 'сум', en: 'UZS' }

function locale(lang: Language = currentLanguage()): string {
  return NUMBER_LOCALES[lang]
}

/** 14500000 → "14 500 000 so‘m" (thin-space grouping per locale). */
export function formatSum(amount: number, lang: Language = currentLanguage()): string {
  return `${new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 0 }).format(amount)} ${SUM[lang]}`
}

/** Entrance score with one decimal: 153.2 → "153,2" (uz/ru) or "153.2" (en). */
export function formatScore(score: number, lang: Language = currentLanguage()): string {
  return new Intl.NumberFormat(locale(lang), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(score)
}

/** Whole numbers with locale grouping: 1250 → "1 250" (uz/ru) or "1,250" (en). */
export function formatInteger(n: number, lang: Language = currentLanguage()): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 0 }).format(n)
}

/** 0..1 → "87%". */
export function formatPercent(unit: number, lang: Language = currentLanguage()): string {
  // Uzbek writes "87%" (no space); ru-RU rules would give "87 %".
  const loc = lang === 'uz' ? 'en-GB' : locale(lang)
  return new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 0 }).format(unit)
}

function dateStyle(lang: Language): 'short' | 'medium' {
  return lang === 'uz' ? 'short' : 'medium'
}

/** "08.11.2026" (uz), "8 нояб. 2026 г." (ru), "8 Nov 2026" (en). */
export function formatDate(iso: string, lang: Language = currentLanguage()): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], { dateStyle: dateStyle(lang) }).format(new Date(iso))
}

/** formatDate plus the time: "11.11.2026, 19:37" (uz), "11 нояб. 2026 г., 19:37" (ru), "11 Nov 2026, 19:37" (en). */
export function formatDateTime(iso: string, lang: Language = currentLanguage()): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], { dateStyle: dateStyle(lang), timeStyle: 'short' }).format(new Date(iso))
}

/** Whole calendar days between two instants in the browser's time zone (DST-safe). */
function calendarDaysBetween(from: Date, to: Date): number {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((day(to) - day(from)) / 86_400_000)
}

/**
 * Relative past time: "5 daqiqa oldin" / "5 минут назад" / "5 minutes ago".
 * Built from our locale files with i18next plurals instead of Intl.RelativeTimeFormat, because
 * browsers' Uzbek data is incomplete (Chrome prints "-5 min", "yesterday"). Anything under a
 * minute — including a server clock slightly ahead of the browser — reads as "just now".
 * Past the first hour, days are counted by the calendar, so 23:50 seen at 00:30 is "yesterday".
 */
export function formatRelative(iso: string, lang: Language = currentLanguage(), now: number = Date.now()): string {
  const t = i18n.getFixedT(lang)
  const then = new Date(iso)
  const minutes = Math.floor((now - then.getTime()) / 60_000)
  if (minutes < 1) return t('time.justNow')
  if (minutes < 60) return t('time.minutes', { count: minutes })
  const days = calendarDaysBetween(then, new Date(now))
  if (days === 0) return t('time.hours', { count: Math.floor(minutes / 60) })
  if (days === 1) return t('time.yesterday')
  if (days < 30) return t('time.days', { count: days })
  if (days < 365) return t('time.months', { count: Math.floor(days / 30) })
  return t('time.years', { count: Math.floor(days / 365) })
}
