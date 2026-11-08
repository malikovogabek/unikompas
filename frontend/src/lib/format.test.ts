import { formatInteger, formatPercent, formatScore, formatSum } from './format'

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
  })
})
