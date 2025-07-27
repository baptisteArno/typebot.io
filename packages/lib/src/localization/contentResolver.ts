import type {
  ContentResolver,
  LocalizedButtonContent,
  LocalizedImageContent,
  LocalizedTextContent,
} from "./types";

// Base content resolution logic
export function resolveLocalizedContent<T extends Record<string, any>>(
  content: T & { localizations?: Record<string, Partial<T>> },
  locale: string,
  fallbackLocale: string,
): T {
  if (!content.localizations) {
    return content;
  }

  const localizedContent = content.localizations[locale];
  const fallbackContent = content.localizations[fallbackLocale];

  // Create resolved content by merging in priority order:
  // 1. Specific locale content
  // 2. Fallback locale content
  // 3. Default content
  const resolved = { ...content };

  // Apply fallback content first
  if (fallbackContent) {
    Object.keys(fallbackContent).forEach((key) => {
      if (fallbackContent[key] !== undefined) {
        (resolved as any)[key] = fallbackContent[key];
      }
    });
  }

  // Apply specific locale content (overrides fallback)
  if (localizedContent) {
    Object.keys(localizedContent).forEach((key) => {
      if (localizedContent[key] !== undefined) {
        (resolved as any)[key] = localizedContent[key];
      }
    });
  }

  // Special handling for text blocks: if plainText is localized but richText is not,
  // generate richText from plainText to ensure UI displays localized content
  if (
    typeof (resolved as any).plainText === "string" &&
    (resolved as any).richText &&
    Array.isArray((resolved as any).richText)
  ) {
    // Always regenerate richText from plainText for localized content to ensure consistency
    (resolved as any).richText = [
      {
        type: "p",
        children: [
          {
            text: (resolved as any).plainText,
          },
        ],
      },
    ];
  }

  // Remove localizations from resolved content
  resolved.localizations = undefined;

  return resolved;
}

// Text content resolver
export const textContentResolver: ContentResolver<LocalizedTextContent> = {
  resolve: (content, locale, fallbackLocale) =>
    resolveLocalizedContent(content, locale, fallbackLocale),

  getAvailableLocales: (content) =>
    content.localizations ? Object.keys(content.localizations) : [],

  hasLocalization: (content, locale) =>
    content.localizations?.[locale] !== undefined,
};

// Image content resolver
export const imageContentResolver: ContentResolver<LocalizedImageContent> = {
  resolve: (content, locale, fallbackLocale) =>
    resolveLocalizedContent(content, locale, fallbackLocale),

  getAvailableLocales: (content) =>
    content.localizations ? Object.keys(content.localizations) : [],

  hasLocalization: (content, locale) =>
    content.localizations?.[locale] !== undefined,
};

// Button content resolver
export const buttonContentResolver: ContentResolver<LocalizedButtonContent> = {
  resolve: (content, locale, fallbackLocale) =>
    resolveLocalizedContent(content, locale, fallbackLocale),

  getAvailableLocales: (content) =>
    content.localizations ? Object.keys(content.localizations) : [],

  hasLocalization: (content, locale) =>
    content.localizations?.[locale] !== undefined,
};

// Generic content resolver for any localized content
export function createContentResolver<
  T extends Record<string, any>,
>(): ContentResolver<T & { localizations?: Record<string, Partial<T>> }> {
  return {
    resolve: (content, locale, fallbackLocale) =>
      resolveLocalizedContent(content, locale, fallbackLocale),

    getAvailableLocales: (content) =>
      content.localizations ? Object.keys(content.localizations) : [],

    hasLocalization: (content, locale) =>
      content.localizations?.[locale] !== undefined,
  };
}

// Helper function to get translation completion percentage
export function getTranslationCompleteness<T extends Record<string, any>>(
  content: T & { localizations?: Record<string, Partial<T>> },
  locale: string,
): number {
  if (!content.localizations?.[locale]) return 0;

  const localization = content.localizations[locale];
  const totalFields = Object.keys(content).filter(
    (key) => key !== "localizations",
  ).length;
  const translatedFields = Object.keys(localization).filter(
    (key) =>
      localization[key] !== undefined &&
      localization[key] !== null &&
      localization[key] !== "",
  ).length;

  return totalFields > 0
    ? Math.round((translatedFields / totalFields) * 100)
    : 0;
}

// Helper to check if content needs translation
export function hasUntranslatedContent<T extends Record<string, any>>(
  content: T & { localizations?: Record<string, Partial<T>> },
  requiredLocales: string[],
): boolean {
  return requiredLocales.some(
    (locale) =>
      !content.localizations?.[locale] ||
      getTranslationCompleteness(content, locale) < 100,
  );
}
