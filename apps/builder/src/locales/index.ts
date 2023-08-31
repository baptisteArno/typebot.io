import { createI18n } from 'next-international'

export type I18nFunction = (key: string) => string;

export const {
  useI18n,
  useScopedI18n,
  I18nProvider,
  getLocaleProps,
  useCurrentLocale,
  useChangeLocale,
  defineLocale,
} = createI18n({
  en:    () => import('./en'),
  fr:    () => import('./fr'),
  pt:    () => import('./pt'),
  pt_BR: () => import('./pt_BR'),
  de:    () => import('./de'),
})