import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import en from './locales/en.json'
import ru from './locales/ru.json'
import uz from './locales/uz.json'

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('locale files', () => {
  it('have exactly the same keys in uz, ru and en', () => {
    const base = keys(uz).sort()
    expect(keys(ru).sort()).toEqual(base)
    expect(keys(en).sort()).toEqual(base)
  })

  it('have no empty translations', () => {
    for (const [lang, file] of Object.entries({ uz, ru, en })) {
      for (const key of keys(file)) {
        const value = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], file)
        expect(String(value).trim(), `${lang}:${key}`).not.toBe('')
      }
    }
  })

  it('translate every backend ErrorCode (FR-9.4)', () => {
    const java = readFileSync(
      resolve(__dirname, '../../../backend/src/main/java/uz/unikompas/common/exception/ErrorCode.java'),
      'utf8',
    )
    const codes = [...java.matchAll(/^\s{4}([A-Z_]+)\(HttpStatus/gm)].map((m) => m[1])
    expect(codes.length).toBeGreaterThan(10)
    for (const code of codes) {
      expect(Object.keys(uz.errors), code).toContain(code)
    }
  })
})
