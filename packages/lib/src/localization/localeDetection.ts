import {
  type LocaleDetectionConfig,
  LocaleDetectionMethod,
  type LocaleDetectionResult,
  type SupportedLocale,
} from "./types";
import { supportedLocales } from "./types";

export interface LocaleDetectionContext {
  // Server-side context
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  pathname?: string;
  hostname?: string;

  // Client-side context
  navigator?: Navigator;
  location?: Location;
  localStorage?: Storage;

  // Custom context
  customVariables?: Record<string, string>;
  userPreference?: string;
  geolocationCountry?: string;
}

// Validate and normalize locale code
export function normalizeLocale(locale: string): string | null {
  if (!locale) return null;

  const normalized = locale.toLowerCase().trim();

  // Direct match
  if (supportedLocales.includes(normalized as SupportedLocale)) {
    return normalized;
  }

  // Try base language (e.g., 'en-US' -> 'en')
  const baseLanguage = normalized.split("-")[0];
  if (supportedLocales.includes(baseLanguage as SupportedLocale)) {
    return baseLanguage;
  }

  // Try with specific region codes we support (e.g., 'pt' -> 'pt-BR')
  if (baseLanguage === "pt") {
    return "pt-BR"; // Default Portuguese to Brazilian Portuguese
  }

  return null;
}

// Server-side locale detection
export function detectLocaleServer(
  context: LocaleDetectionContext,
  config: LocaleDetectionConfig,
): LocaleDetectionResult {
  for (const method of config.methods) {
    const result = detectByMethod(method, context, config);
    if (result) {
      return {
        locale: result.locale,
        method: result.method,
        confidence: result.confidence,
        fallbackUsed: false,
      };
    }
  }

  // Fallback
  return {
    locale: config.fallbackLocale,
    method: config.methods[0] || LocaleDetectionMethod.URL_PARAM,
    confidence: 0,
    fallbackUsed: true,
  };
}

// Client-side locale detection
export function detectLocaleClient(
  context: LocaleDetectionContext,
  config: LocaleDetectionConfig,
): LocaleDetectionResult {
  // Client-side methods only
  const clientMethods = config.methods.filter((method) =>
    [
      LocaleDetectionMethod.URL_PARAM,
      LocaleDetectionMethod.URL_PATH,
      LocaleDetectionMethod.BROWSER_JS,
      LocaleDetectionMethod.USER_PREFERENCE,
      LocaleDetectionMethod.CUSTOM_VARIABLE,
    ].includes(method),
  );

  for (const method of clientMethods) {
    const result = detectByMethod(method, context, config);
    if (result) {
      return {
        locale: result.locale,
        method: result.method,
        confidence: result.confidence,
        fallbackUsed: false,
      };
    }
  }

  // Fallback
  return {
    locale: config.fallbackLocale,
    method: clientMethods[0] || LocaleDetectionMethod.BROWSER_JS,
    confidence: 0,
    fallbackUsed: true,
  };
}

// Detect locale by specific method
function detectByMethod(
  method: LocaleDetectionMethod,
  context: LocaleDetectionContext,
  config: LocaleDetectionConfig,
): {
  locale: string;
  method: LocaleDetectionMethod;
  confidence: number;
} | null {
  switch (method) {
    case LocaleDetectionMethod.URL_PARAM: {
      const paramName = config.urlParamName || "locale";
      let paramValue: string | undefined;

      if (context.query) {
        const value = context.query[paramName];
        paramValue = Array.isArray(value) ? value[0] : value;
      } else if (context.location) {
        const urlParams = new URLSearchParams(context.location.search);
        paramValue = urlParams.get(paramName) || undefined;
      }

      if (paramValue) {
        const normalized = normalizeLocale(paramValue);
        if (normalized) {
          return { locale: normalized, method, confidence: 1.0 };
        }
      }
      break;
    }

    case LocaleDetectionMethod.URL_PATH: {
      const pathname = context.pathname || context.location?.pathname;
      if (pathname) {
        const segments = pathname.split("/").filter(Boolean);
        const segmentIndex = config.pathSegmentIndex || 0;
        const localeSegment = segments[segmentIndex];

        if (localeSegment) {
          const normalized = normalizeLocale(localeSegment);
          if (normalized) {
            return { locale: normalized, method, confidence: 0.9 };
          }
        }
      }
      break;
    }

    case LocaleDetectionMethod.SUBDOMAIN: {
      const hostname = context.hostname || context.location?.hostname;
      if (hostname) {
        const subdomain = hostname.split(".")[0];
        const normalized = normalizeLocale(subdomain);
        if (normalized) {
          return { locale: normalized, method, confidence: 0.8 };
        }
      }
      break;
    }

    case LocaleDetectionMethod.BROWSER_HEADER: {
      const acceptLanguage = context.headers?.["accept-language"];
      if (acceptLanguage) {
        const languages = parseAcceptLanguage(acceptLanguage);
        for (const lang of languages) {
          const normalized = normalizeLocale(lang.locale);
          if (normalized) {
            return {
              locale: normalized,
              method,
              confidence: lang.quality * 0.7,
            };
          }
        }
      }
      break;
    }

    case LocaleDetectionMethod.BROWSER_JS: {
      if (context.navigator) {
        const browserLanguage =
          context.navigator.language || context.navigator.languages?.[0];
        if (browserLanguage) {
          const normalized = normalizeLocale(browserLanguage);
          if (normalized) {
            return { locale: normalized, method, confidence: 0.6 };
          }
        }
      }
      break;
    }

    case LocaleDetectionMethod.USER_PREFERENCE: {
      const userPref =
        context.userPreference ||
        context.localStorage?.getItem("typebot-preferred-locale");
      if (userPref) {
        const normalized = normalizeLocale(userPref);
        if (normalized) {
          return { locale: normalized, method, confidence: 0.9 };
        }
      }
      break;
    }

    case LocaleDetectionMethod.GEOLOCATION: {
      if (context.geolocationCountry) {
        const localeFromCountry = mapCountryToLocale(
          context.geolocationCountry,
        );
        if (localeFromCountry) {
          const normalized = normalizeLocale(localeFromCountry);
          if (normalized) {
            return { locale: normalized, method, confidence: 0.5 };
          }
        }
      }
      break;
    }

    case LocaleDetectionMethod.CUSTOM_VARIABLE: {
      // This would be implemented based on custom variable values
      // For now, just check if there's a locale in custom variables
      if (context.customVariables?.locale) {
        const normalized = normalizeLocale(context.customVariables.locale);
        if (normalized) {
          return { locale: normalized, method, confidence: 0.8 };
        }
      }
      break;
    }
  }

  return null;
}

// Parse Accept-Language header
function parseAcceptLanguage(
  acceptLanguage: string,
): Array<{ locale: string; quality: number }> {
  return acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, q = "q=1"] = lang.trim().split(";");
      const quality = Number.parseFloat(q.replace("q=", ""));
      return { locale: locale.trim(), quality: isNaN(quality) ? 1 : quality };
    })
    .sort((a, b) => b.quality - a.quality);
}

// Map country codes to locales (simplified)
function mapCountryToLocale(countryCode: string): string | null {
  const countryToLocale: Record<string, string> = {
    US: "en",
    GB: "en",
    CA: "en",
    AU: "en",
    FR: "fr",
    DE: "de",
    ES: "es",
    IT: "it",
    PT: "pt",
    BR: "pt-BR",
    RO: "ro",
    GR: "el",
  };

  return countryToLocale[countryCode.toUpperCase()] || null;
}

// Utility to get locale display name
export function getLocaleDisplayName(locale: string): string {
  const displayNames: Record<string, string> = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    pt: "Português",
    "pt-BR": "Português (Brasil)",
    es: "Español",
    ro: "Română",
    it: "Italiano",
    el: "Ελληνικά",
  };

  return displayNames[locale] || locale;
}

// Utility to get locale flag emoji
export function getLocaleFlagEmoji(locale: string): string {
  const flagEmojis: Record<string, string> = {
    en: "🇺🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇵🇹",
    "pt-BR": "🇧🇷",
    es: "🇪🇸",
    ro: "🇷🇴",
    it: "🇮🇹",
    el: "🇬🇷",
  };

  return flagEmojis[locale] || "🌐";
}
