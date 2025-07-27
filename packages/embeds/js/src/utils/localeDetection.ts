import {
  debouncedSaveLocalePreference,
  generateLocaleDetectionCacheKey,
  getCachedLocaleDetection,
  optimizedValidateLocale,
  recordLocaleDetectionPerformance,
  setCachedLocaleDetection,
} from "./localizationPerformance";

// Local type definition for locale detection config (avoids import dependency)
export interface LocaleDetectionConfig {
  enabled?: boolean;
  methods?: string[];
  fallbackLocale?: string;
  urlParamName?: string;
  pathSegmentIndex?: number;
  customVariableName?: string;
}

export interface ClientLocaleDetectionContext {
  url: URL;
  userAgent: string;
  hostname: string;
  pathname: string;
  searchParams: URLSearchParams;
  languages: readonly string[];
  storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
  };
}

export interface LocaleDetectionResult {
  locale: string;
  method: string;
  confidence: number;
  fallbackUsed: boolean;
}

/**
 * Client-side locale detection for embed libraries
 */
export class ClientLocaleDetector {
  private config: LocaleDetectionConfig;
  private availableLocales: string[];

  constructor(config: LocaleDetectionConfig, availableLocales: string[]) {
    this.config = config;
    this.availableLocales = availableLocales;
  }

  /**
   * Detects the preferred locale based on the detection configuration
   */
  detectLocale(context: ClientLocaleDetectionContext): LocaleDetectionResult {
    const startTime = performance.now();

    // Always check URL parameter first, even if localization is not fully configured
    const urlParamLocale = this.detectFromUrlParam(context);
    if (urlParamLocale) {
      const result = {
        locale: urlParamLocale,
        method: "urlParam",
        confidence: 1.0,
        fallbackUsed: false,
      };

      recordLocaleDetectionPerformance({
        detectionTime: performance.now() - startTime,
        cacheHit: false,
        method: "urlParam",
        locale: urlParamLocale,
      });

      return result;
    }

    if (!this.config.enabled || this.availableLocales.length <= 1) {
      const result = {
        locale: this.availableLocales[0] || "en",
        method: "default",
        confidence: 1.0,
        fallbackUsed: false,
      };

      recordLocaleDetectionPerformance({
        detectionTime: performance.now() - startTime,
        cacheHit: false,
        method: "default",
        locale: result.locale,
      });

      return result;
    }

    // Check cache first
    const cacheKey = generateLocaleDetectionCacheKey(
      context.url.href,
      context.userAgent,
      this.availableLocales,
    );

    const cached = getCachedLocaleDetection(cacheKey);
    if (cached) {
      recordLocaleDetectionPerformance({
        detectionTime: performance.now() - startTime,
        cacheHit: true,
        method: cached.method,
        locale: cached.locale,
      });

      return {
        locale: cached.locale,
        method: cached.method,
        confidence: cached.confidence,
        fallbackUsed: false,
      };
    }

    const methods = this.config.methods || [
      "urlParam",
      "urlPath",
      "subdomain",
      "browserHeaders",
      "userPreference",
    ];

    for (const method of methods) {
      const result = this.detectByMethod(method, context);
      if (result) {
        const detectionResult = {
          locale: result,
          method,
          confidence: this.getConfidenceForMethod(method),
          fallbackUsed: false,
        };

        // Cache the successful result
        setCachedLocaleDetection(cacheKey, {
          locale: result,
          method,
          confidence: this.getConfidenceForMethod(method),
        });

        recordLocaleDetectionPerformance({
          detectionTime: performance.now() - startTime,
          cacheHit: false,
          method,
          locale: result,
        });

        return detectionResult;
      }
    }

    // No detection method succeeded, use fallback
    const fallbackLocale =
      this.config.fallbackLocale || this.availableLocales[0] || "en";
    const validatedFallback = this.validateLocale(fallbackLocale) || "en";

    const fallbackResult = {
      locale: validatedFallback,
      method: "fallback",
      confidence: 0.5,
      fallbackUsed: true,
    };

    recordLocaleDetectionPerformance({
      detectionTime: performance.now() - startTime,
      cacheHit: false,
      method: "fallback",
      locale: validatedFallback,
    });

    return fallbackResult;
  }

  private detectByMethod(
    method: string,
    context: ClientLocaleDetectionContext,
  ): string | null {
    switch (method) {
      case "urlParam":
        return this.detectFromUrlParam(context);
      case "urlPath":
        return this.detectFromUrlPath(context);
      case "subdomain":
        return this.detectFromSubdomain(context);
      case "browserHeaders":
        return this.detectFromBrowserHeaders(context);
      case "userPreference":
        return this.detectFromUserPreference(context);
      case "geolocation":
        // Client-side geolocation would require async API, skip for now
        return null;
      case "customVariable":
        return this.detectFromCustomVariable(context);
      default:
        return null;
    }
  }

  private detectFromUrlParam(
    context: ClientLocaleDetectionContext,
  ): string | null {
    const paramName = this.config.urlParamName || "locale";
    const locale = context.searchParams.get(paramName);
    return locale ? this.validateLocale(locale) : null;
  }

  private detectFromUrlPath(
    context: ClientLocaleDetectionContext,
  ): string | null {
    const pathSegments = context.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return null;

    const potentialLocale = pathSegments[0];
    return this.validateLocale(potentialLocale);
  }

  private detectFromSubdomain(
    context: ClientLocaleDetectionContext,
  ): string | null {
    const subdomains = context.hostname.split(".");
    if (subdomains.length < 2) return null;

    const subdomain = subdomains[0];
    return this.validateLocale(subdomain);
  }

  private detectFromBrowserHeaders(
    context: ClientLocaleDetectionContext,
  ): string | null {
    // Access browser's preferred languages
    const browserLanguages = context.languages;

    for (const lang of browserLanguages) {
      // Try exact match first
      const exactMatch = this.validateLocale(lang);
      if (exactMatch) return exactMatch;

      // Try language code without region (e.g., "en" from "en-US")
      const langCode = lang.split("-")[0];
      const langMatch = this.validateLocale(langCode);
      if (langMatch) return langMatch;
    }

    return null;
  }

  private detectFromUserPreference(
    context: ClientLocaleDetectionContext,
  ): string | null {
    if (!context.storage) return null;

    const storedLocale = context.storage.getItem("typebot-preferred-locale");
    return storedLocale ? this.validateLocale(storedLocale) : null;
  }

  private detectFromCustomVariable(
    context: ClientLocaleDetectionContext,
  ): string | null {
    const variableName = this.config.customVariableName;
    if (!variableName) return null;

    // Check URL params for custom variable
    const customValue = context.searchParams.get(variableName);
    return customValue ? this.validateLocale(customValue) : null;
  }

  private validateLocale(locale: string): string | null {
    return optimizedValidateLocale(locale, this.availableLocales);
  }

  private getConfidenceForMethod(method: string): number {
    const confidenceMap: Record<string, number> = {
      urlParam: 1.0,
      urlPath: 0.9,
      userPreference: 0.8,
      subdomain: 0.7,
      browserHeaders: 0.6,
      geolocation: 0.5,
      customVariable: 0.8,
      fallback: 0.3,
    };

    return confidenceMap[method] || 0.5;
  }
}

/**
 * Convenience function to detect locale on the client side
 */
export function detectClientLocale(
  config: LocaleDetectionConfig,
  availableLocales: string[],
  context?: Partial<ClientLocaleDetectionContext>,
): LocaleDetectionResult {
  const detector = new ClientLocaleDetector(config, availableLocales);

  const fullContext: ClientLocaleDetectionContext = {
    url: new URL(window.location.href),
    userAgent: navigator.userAgent,
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
    languages: navigator.languages,
    storage: {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
    },
    ...context,
  };

  return detector.detectLocale(fullContext);
}

/**
 * Save user's locale preference for future sessions (debounced for performance)
 */
export function saveLocalePreference(locale: string, typebotId?: string): void {
  debouncedSaveLocalePreference(locale, typebotId);
}

/**
 * Get saved locale preference
 */
export function getLocalePreference(): string | null {
  try {
    return localStorage.getItem("typebot-preferred-locale");
  } catch (error) {
    // Silently fail if localStorage is not available
    return null;
  }
}
