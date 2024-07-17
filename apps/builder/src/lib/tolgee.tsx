import { DevTools, Tolgee } from '@tolgee/react'
import { FormatIcu } from '@tolgee/format-icu'
import en from '../i18n/en.json'
import fr from '../i18n/fr.json'
import de from '../i18n/de.json'
import pt from '../i18n/pt.json'
import ptBR from '../i18n/pt-BR.json'
import es from '../i18n/es.json'
import ro from '../i18n/ro.json'
import it from '../i18n/it.json'
import el from '../i18n/el.json'
import { env } from '@typebot.io/env'

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    apiKey: env.NEXT_PUBLIC_TOLGEE_API_KEY,
    apiUrl: env.NEXT_PUBLIC_TOLGEE_API_URL,
    defaultLanguage: 'en',
    availableLanguages: [
      'en',
      'fr',
      'de',
      'pt',
      'pt-BR',
      'es',
      'ro',
      'it',
      'el',
    ],
    fallbackLanguage: 'en',
    staticData: {
      en,
      fr,
      de,
      pt,
      'pt-BR': ptBR,
      es,
      ro,
      it,
      el,
    },
  })
