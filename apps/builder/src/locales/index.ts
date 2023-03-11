import { createI18n } from '@typebot.io/next-international'
import type Locale from './en'

export const {
  defineLocale,
  useI18n,
  useScopedI18n,
  I18nProvider,
  getLocaleProps,
} = createI18n<typeof Locale>({
  en: () => import('./en'),
  fr: () => import('./fr'),
  pt: () => import('./pt'),
})
