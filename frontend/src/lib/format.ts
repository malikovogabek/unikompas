import { currentLanguage, type Language } from '@/i18n'

// Browsers ship incomplete CLDR data for Uzbek (Chrome prints "16,000,000" and "155.4").
// Uzbek conventions match Russian ones — space grouping, decimal comma — so numbers use ru-RU.
const NUMBER_LOCALES: Record<Language, string> = { uz: 'ru-RU', ru: 'ru-RU', en: 'en-GB' }
const DATE_LOCALES: Record<Language, string> = { uz: 'uz-Latn-UZ', ru: 'ru-RU', en: 'en-GB' }

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
  return new Intl.NumberFormat(locale(lang), { style: 'percent', maximumFractionDigits: 0 }).format(unit)
}

export function formatDate(iso: string, lang: Language = currentLanguage()): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], { dateStyle: 'medium' }).format(new Date(iso))
}
