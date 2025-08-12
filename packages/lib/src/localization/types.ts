import { z } from "@typebot.io/zod";

// Supported locales based on existing Tolgee configuration
export const supportedLocales = [
  "en",
  "fr",
  "de",
  "pt",
  "pt-BR",
  "es",
  "ro",
  "it",
  "el",
] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

// Locale detection methods in priority order
export enum LocaleDetectionMethod {
  URL_PARAM = "url-param",
  URL_PATH = "url-path",
  SUBDOMAIN = "subdomain",
  BROWSER_HEADER = "browser-header",
  BROWSER_JS = "browser-js",
  USER_PREFERENCE = "user-preference",
  GEOLOCATION = "geolocation",
  CUSTOM_VARIABLE = "custom-variable",
}

export const localeDetectionConfigSchema = z.object({
  enabled: z.boolean().default(false),
  methods: z
    .array(z.nativeEnum(LocaleDetectionMethod))
    .default([
      LocaleDetectionMethod.URL_PARAM,
      LocaleDetectionMethod.BROWSER_HEADER,
    ]),
  fallbackLocale: z.string().default("en"),
  urlParamName: z.string().default("locale").optional(),
  pathSegmentIndex: z.number().default(0).optional(),
});

export type LocaleDetectionConfig = z.infer<typeof localeDetectionConfigSchema>;

// Locale detection result
export interface LocaleDetectionResult {
  locale: string;
  method: LocaleDetectionMethod;
  confidence: number;
  fallbackUsed: boolean;
}

// Generic localized content wrapper
export const localizedContentSchema = <T extends z.ZodObject<any>>(
  contentSchema: T,
) =>
  z.object({
    // Default content (backward compatibility)
    ...contentSchema.shape,
    // Localized content
    localizations: z.record(z.string(), contentSchema).optional(),
  });

// Localized text content specifically
export const localizedTextContentSchema = z.object({
  html: z.string().optional(),
  richText: z.array(z.any()).optional(),
  plainText: z.string().optional(),
  localizations: z
    .record(
      z.string(),
      z.object({
        html: z.string().optional(),
        richText: z.array(z.any()).optional(),
        plainText: z.string().optional(),
      }),
    )
    .optional(),
});

export type LocalizedTextContent = z.infer<typeof localizedTextContentSchema>;

// Localized image content
export const localizedImageContentSchema = z.object({
  url: z.string().optional(),
  clickLink: z
    .object({
      url: z.string().optional(),
      alt: z.string().optional(),
    })
    .optional(),
  localizations: z
    .record(
      z.string(),
      z.object({
        url: z.string().optional(),
        clickLink: z
          .object({
            url: z.string().optional(),
            alt: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export type LocalizedImageContent = z.infer<typeof localizedImageContentSchema>;

// Localized button/choice content
export const localizedButtonContentSchema = z.object({
  content: z.string().optional(),
  value: z.string().optional(),
  localizations: z
    .record(
      z.string(),
      z.object({
        content: z.string().optional(),
      }),
    )
    .optional(),
});

export type LocalizedButtonContent = z.infer<
  typeof localizedButtonContentSchema
>;

// Locale context for runtime
export interface LocaleContext {
  currentLocale: string;
  availableLocales: string[];
  fallbackLocale: string;
  detectionMethod?: LocaleDetectionMethod;
  confidence?: number;
}

// Content resolution helpers
export interface ContentResolver<T> {
  resolve(content: T, locale: string, fallbackLocale: string): T;
  getAvailableLocales(content: T): string[];
  hasLocalization(content: T, locale: string): boolean;
}
