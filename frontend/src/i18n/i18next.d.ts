import 'i18next'
import type uz from './locales/uz.json'

// Type-safe translation keys: t('auth.login.title') is checked at compile time against uz.json.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof uz }
  }
}
