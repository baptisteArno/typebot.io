import { FormatIcu } from "@tolgee/format-icu";
import { DevTools, Tolgee } from "@tolgee/react";
import { env } from "@typebot.io/env";
import ar from "../i18n/ar.json";
import en from "../i18n/en.json";

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    apiKey: env.NEXT_PUBLIC_TOLGEE_API_KEY,
    apiUrl: env.NEXT_PUBLIC_TOLGEE_API_URL,
    defaultLanguage: "en",
    availableLanguages: [
      "en",
      "ar",
    ],
    fallbackLanguage: "en",
    staticData: {
      en,
      ar, 
    },
  });
