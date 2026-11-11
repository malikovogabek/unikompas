import { formatDate, formatInteger, formatPercent, formatRelative, formatScore, formatSum } from './format'

describe('format', () => {
  it('formats money with the localized currency label', () => {
    expect(formatSum(14_500_000, 'uz')).toMatch(/^14\s500\s000 so‘m$/)
    expect(formatScore(153.2, 'uz')).toBe('153,2')
    expect(formatSum(14_500_000, 'ru')).toMatch(/^14\s500\s000 сум$/)
    expect(formatSum(14_500_000, 'en')).toBe('14,500,000 UZS')
  })

  it('formats scores with one decimal and locale separator', () => {
    expect(formatScore(153.2, 'ru')).toBe('153,2')
    expect(formatScore(153, 'en')).toBe('153.0')
  })

  it('formats integers with grouping', () => {
    expect(formatInteger(1250, 'uz')).toMatch(/^1\s250$/)
    expect(formatInteger(1250, 'en')).toBe('1,250')
  })

  it('formats unit values as percent', () => {
    expect(formatPercent(0.874, 'en')).toBe('87%')
    expect(formatPercent(0.874, 'uz')).toBe('87%')
  })

  // Local wall-clock times, so relative-day expectations hold in any time zone.
  const at = (d: number, h: number, m = 0, sec = 0) => new Date(2026, 10, d, h, m, sec).toISOString()

  it('formats relative times in every language', () => {
    const now = Date.parse(at(11, 12))
    expect(formatRelative(at(11, 11, 55), 'uz', now)).toBe('5 daqiqa oldin')
    expect(formatRelative(at(11, 9), 'uz', now)).toBe('3 soat oldin')
    expect(formatRelative(at(10, 11), 'uz', now)).toBe('kecha')
    expect(formatRelative(at(7, 12), 'uz', now)).toBe('4 kun oldin')
    expect(formatRelative(at(11, 11, 59), 'ru', now)).toBe('1 минуту назад')
    expect(formatRelative(at(11, 11, 57), 'ru', now)).toBe('3 минуты назад')
    expect(formatRelative(at(11, 11, 55), 'ru', now)).toBe('5 минут назад')
    expect(formatRelative(at(11, 11, 59), 'en', now)).toBe('1 minute ago')
    expect(formatRelative(at(11, 11, 55), 'en', now)).toBe('5 minutes ago')
  })

  it('reads sub-minute and slightly-future times as just now', () => {
    const now = Date.parse('2026-11-11T12:00:00Z')
    expect(formatRelative('2026-11-11T11:59:30Z', 'uz', now)).toBe('hozirgina')
    expect(formatRelative('2026-11-11T12:00:03Z', 'en', now)).toBe('just now')
  })

  it('counts days by the calendar, not by 24-hour blocks', () => {
    const now = Date.parse(at(11, 0, 30))
    expect(formatRelative(at(10, 23, 50), 'uz', now)).toBe('40 daqiqa oldin')
    expect(formatRelative(at(10, 22, 0), 'uz', now)).toBe('kecha')          // 2.5 h ago, but yesterday
    expect(formatRelative(at(9, 23, 0), 'en', now)).toBe('2 days ago')      // 25.5 h ago, two dates back
    const noon = Date.parse(at(11, 12))
    expect(formatRelative(at(11, 1), 'en', noon)).toBe('11 hours ago')
  })

  it('formats Uzbek dates numerically', () => {
    expect(formatDate(at(8, 12), 'uz')).toBe('08.11.2026')
  })
})
