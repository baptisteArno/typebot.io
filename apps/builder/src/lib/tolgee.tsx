import { FormatIcu } from "@tolgee/format-icu";
import { DevTools, Tolgee } from "@tolgee/react";
import { env } from "@typebot.io/env";
import de from "../i18n/de.json";
import el from "../i18n/el.json";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";
import it from "../i18n/it.json";
import ptBR from "../i18n/pt-BR.json";
import pt from "../i18n/pt.json";
import ro from "../i18n/ro.json";

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    apiKey: env.NEXT_PUBLIC_TOLGEE_API_KEY,
    apiUrl: env.NEXT_PUBLIC_TOLGEE_API_URL,
    defaultLanguage: "en",
    availableLanguages: [
      "en",
      "fr",
      "de",
      "pt",
      "pt-BR",
      "es",
      "ro",
      "it",
      "el",
    ],
    fallbackLanguage: "en",
    staticData: {
      en,
      fr,
      de,
      pt,
      "pt-BR": ptBR,
      es,
      ro,
      it,
      el,
    },
  });
