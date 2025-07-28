import {
  buttonContentResolver,
  getTranslationCompleteness,
  hasUntranslatedContent,
  imageContentResolver,
  resolveLocalizedContent,
  textContentResolver,
} from "./contentResolver";
import {
  type LocaleDetectionContext,
  detectLocaleClient,
  detectLocaleServer,
  getLocaleDisplayName,
  getLocaleFlagEmoji,
  normalizeLocale,
} from "./localeDetection";
import type {
  LocaleContext,
  LocaleDetectionConfig,
  LocaleDetectionResult,
  LocalizedButtonContent,
  LocalizedImageContent,
  LocalizedTextContent,
  SupportedLocale,
} from "./types";
import { supportedLocales } from "./types";

export class LocalizationService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Locale detection
  detectLocale(
    context: LocaleDetectionContext,
    config: LocaleDetectionConfig,
    isServerSide = false,
  ): LocaleDetectionResult {
    const cacheKey = `detection_${JSON.stringify({ context, config, isServerSide })}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = isServerSide
      ? detectLocaleServer(context, config)
      : detectLocaleClient(context, config);

    this.setCache(cacheKey, result);
    return result;
  }

  // Content resolution
  resolveTextContent(
    content: LocalizedTextContent,
    locale: string,
    fallbackLocale: string,
  ): LocalizedTextContent {
    return textContentResolver.resolve(content, locale, fallbackLocale);
  }

  resolveImageContent(
    content: LocalizedImageContent,
    locale: string,
    fallbackLocale: string,
  ): LocalizedImageContent {
    return imageContentResolver.resolve(content, locale, fallbackLocale);
  }

  resolveButtonContent(
    content: LocalizedButtonContent,
    locale: string,
    fallbackLocale: string,
  ): LocalizedButtonContent {
    return buttonContentResolver.resolve(content, locale, fallbackLocale);
  }

  // Generic content resolution
  resolveContent<T extends Record<string, any>>(
    content: T & { localizations?: Record<string, Partial<T>> },
    locale: string,
    fallbackLocale: string,
  ): T {
    return resolveLocalizedContent(content, locale, fallbackLocale);
  }

  // Typebot-level content resolution
  resolveTypebotContent(
    typebot: any,
    locale: string,
    fallbackLocale: string,
  ): any {
    const resolved = { ...typebot };

    // Resolve groups and their blocks
    if (resolved.groups) {
      resolved.groups = resolved.groups.map((group: any) => ({
        ...group,
        title: this.resolveContent(
          { title: group.title, localizations: group.localizations?.title },
          locale,
          fallbackLocale,
        ).title,
        blocks: group.blocks?.map((block: any) =>
          this.resolveBlockContent(block, locale, fallbackLocale),
        ),
      }));
    }

    return resolved;
  }

  // Block-level content resolution
  resolveBlockContent(block: any, locale: string, fallbackLocale: string): any {
    const resolved = { ...block };

    // Handle content if it exists
    if (block.content) {
      // Handle different block types
      switch (block.type) {
        case "text":
          resolved.content = this.resolveTextContent(
            block.content,
            locale,
            fallbackLocale,
          );
          break;

        case "image":
          resolved.content = this.resolveImageContent(
            block.content,
            locale,
            fallbackLocale,
          );
          break;

        case "choice":
        case "choice input":
        case "picture choice input":
        case "cards":
          if (block.items) {
            resolved.items = block.items.map((item: any) =>
              this.resolveButtonContent(item, locale, fallbackLocale),
            );
          }
          break;

        default:
          // Generic content resolution for other block types
          resolved.content = this.resolveContent(
            block.content,
            locale,
            fallbackLocale,
          );
          break;
      }
    }

    // Handle input blocks with options.labels
    if (block.options?.labels) {
      resolved.options = {
        ...block.options,
        labels: this.resolveContent(
          block.options.labels,
          locale,
          fallbackLocale,
        ),
      };
    }

    // Handle choice items (for choice blocks, picture choice, and cards)
    if (
      block.items &&
      (block.type === "choice" ||
        block.type === "choice input" ||
        block.type === "picture choice input" ||
        block.type === "cards")
    ) {
      console.log(
        `🔄 Resolving choice block ${block.id} for locale ${locale}:`,
        {
          originalItems: block.items.map((item) => ({
            id: item.id,
            content: item.content,
            hasLocalizations: !!item.localizations,
            localizationKeys: item.localizations
              ? Object.keys(item.localizations)
              : [],
            localizationForLocale: item.localizations?.[locale],
          })),
        },
      );

      resolved.items = block.items.map((item: any) => {
        const resolvedItem = this.resolveButtonContent(
          item,
          locale,
          fallbackLocale,
        );
        console.log(
          `  ✏️ Item ${item.id}: "${item.content}" → "${resolvedItem.content}"`,
        );
        return resolvedItem;
      });

      console.log(`✅ Choice block ${block.id} resolved:`, {
        resolvedItems: resolved.items.map((item) => ({
          id: item.id,
          content: item.content,
        })),
      });
    }

    return resolved;
  }

  // Translation management
  getTranslationStatus(
    content: any,
    requiredLocales: string[],
  ): Record<string, { completeness: number; hasUntranslated: boolean }> {
    const status: Record<
      string,
      { completeness: number; hasUntranslated: boolean }
    > = {};

    for (const locale of requiredLocales) {
      status[locale] = {
        completeness: getTranslationCompleteness(content, locale),
        hasUntranslated: hasUntranslatedContent(content, [locale]),
      };
    }

    return status;
  }

  getTypebotTranslationStatus(
    typebot: any,
    requiredLocales: string[],
  ): {
    overall: Record<string, { completeness: number; hasUntranslated: boolean }>;
    byBlock: Record<
      string,
      Record<string, { completeness: number; hasUntranslated: boolean }>
    >;
  } {
    const overall: Record<
      string,
      { completeness: number; hasUntranslated: boolean }
    > = {};
    const byBlock: Record<
      string,
      Record<string, { completeness: number; hasUntranslated: boolean }>
    > = {};

    // Calculate overall completeness
    let totalBlocks = 0;
    const localeCompleteness: Record<string, number> = {};

    // Initialize locale tracking
    for (const locale of requiredLocales) {
      localeCompleteness[locale] = 0;
    }

    // Process all blocks
    if (typebot.groups) {
      for (const group of typebot.groups) {
        if (group.blocks) {
          for (const block of group.blocks) {
            if (block.content || block.items) {
              totalBlocks++;
              byBlock[block.id] = this.getTranslationStatus(
                block.content || { items: block.items },
                requiredLocales,
              );

              // Add to overall completeness
              for (const locale of requiredLocales) {
                localeCompleteness[locale] +=
                  byBlock[block.id][locale].completeness;
              }
            }
          }
        }
      }
    }

    // Calculate averages
    for (const locale of requiredLocales) {
      const avgCompleteness =
        totalBlocks > 0
          ? Math.round(localeCompleteness[locale] / totalBlocks)
          : 100;

      overall[locale] = {
        completeness: avgCompleteness,
        hasUntranslated: avgCompleteness < 100,
      };
    }

    return { overall, byBlock };
  }

  // Locale utilities
  getSupportedLocales(): SupportedLocale[] {
    return [...supportedLocales];
  }

  isLocaleSupported(locale: string): boolean {
    return supportedLocales.includes(
      normalizeLocale(locale) as SupportedLocale,
    );
  }

  getLocaleInfo(locale: string) {
    const normalized = normalizeLocale(locale);
    if (!normalized) return null;

    return {
      code: normalized,
      displayName: getLocaleDisplayName(normalized),
      flagEmoji: getLocaleFlagEmoji(normalized),
      isSupported: this.isLocaleSupported(normalized),
    };
  }

  // Create locale context
  createLocaleContext(
    currentLocale: string,
    availableLocales: string[],
    fallbackLocale: string,
    detectionResult?: LocaleDetectionResult,
  ): LocaleContext {
    return {
      currentLocale: normalizeLocale(currentLocale) || fallbackLocale,
      availableLocales: availableLocales.filter((locale) =>
        this.isLocaleSupported(locale),
      ),
      fallbackLocale,
      detectionMethod: detectionResult?.method,
      confidence: detectionResult?.confidence,
    };
  }

  // Cache management
  private setCache(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Bulk operations
  async processLocalizationBatch(
    operations: Array<{
      type: "resolve" | "status";
      content: any;
      locale?: string;
      fallbackLocale?: string;
      requiredLocales?: string[];
    }>,
  ): Promise<any[]> {
    return Promise.all(
      operations.map(async (op) => {
        switch (op.type) {
          case "resolve":
            return this.resolveContent(
              op.content,
              op.locale!,
              op.fallbackLocale!,
            );
          case "status":
            return this.getTranslationStatus(op.content, op.requiredLocales!);
          default:
            throw new Error(`Unknown operation type: ${(op as any).type}`);
        }
      }),
    );
  }
}

// Singleton instance
export const localizationService = new LocalizationService();
