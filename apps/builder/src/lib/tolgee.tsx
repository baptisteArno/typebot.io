import { DevTools, Tolgee } from '@tolgee/react'
import { FormatIcu } from '@tolgee/format-icu'
import en from '../../public/locales/en.json'
import fr from '../../public/locales/fr.json'
import de from '../../public/locales/de.json'
import pt from '../../public/locales/pt.json'
import ptBR from '../../public/locales/pt-BR.json'

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    defaultLanguage: 'en',
    availableLanguages: ['en', 'fr', 'de', 'pt', 'pt-BR'],
    fallbackLanguage: 'en',
    staticData: {
      en,
      fr,
      de,
      pt,
      'pt-BR': ptBR,
    },
  })
