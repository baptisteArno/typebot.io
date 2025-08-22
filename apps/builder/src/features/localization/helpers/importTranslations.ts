import type { LocalizedTypebotV6 } from "@/features/editor/providers/TypebotProvider";
import type { ImportedTranslationData } from "../schemas/importValidation";

interface ImportResult {
  success: boolean;
  updatedBlocks: number;
  errors: string[];
  warnings: string[];
}

/**
 * Imports translations from exported JSON data and applies them to the typebot
 */
export const importTranslations = (
  typebot: LocalizedTypebotV6,
  importData: ImportedTranslationData,
): ImportResult => {
  const result: ImportResult = {
    success: false,
    updatedBlocks: 0,
    errors: [],
    warnings: [],
  };

  // Validate that the import is for the correct typebot
  if (importData.typebot.id !== typebot.id) {
    result.warnings.push(
      `Import data is from a different typebot (${importData.typebot.name}). Continuing with import...`,
    );
  }

  // Check if locales match
  const typebotLocales = Array.isArray(typebot.supportedLocales)
    ? typebot.supportedLocales
    : JSON.parse(typebot.supportedLocales || '["en"]');

  const importLocales = importData.typebot.supportedLocales;
  const missingLocales = importLocales.filter(
    (locale) => !typebotLocales.includes(locale),
  );

  if (missingLocales.length > 0) {
    result.warnings.push(
      `Import contains translations for locales not supported in current typebot: ${missingLocales.join(", ")}`,
    );
  }

  // Process each translation
  for (const translation of importData.translations) {
    const blockFound = typebot.groups?.some((group) =>
      group.blocks?.some((block) => {
        if (block.id !== translation.blockId) return false;

        // Apply translations based on block type and structure
        let updated = false;

        // Handle blocks with content property (text blocks, image blocks, etc.)
        if ("content" in block && block.content) {
          const content = block.content as any;

          // Initialize localizations if not present
          if (!content.localizations) {
            content.localizations = {};
          }

          // Apply translations for each locale
          Object.entries(translation.translations).forEach(([locale, data]) => {
            if (typebotLocales.includes(locale) && data.content.trim()) {
              if (!content.localizations[locale]) {
                content.localizations[locale] = {};
              }

              // Determine the content type and apply translation
              if (content.plainText !== undefined) {
                content.localizations[locale].plainText = data.content;
              } else if (content.html !== undefined) {
                content.localizations[locale].html = data.content;
              } else if (content.url !== undefined) {
                content.localizations[locale].url = data.content;
              } else if (content.richText !== undefined) {
                // For rich text, we'll set plain text as fallback
                content.localizations[locale].plainText = data.content;
              }

              updated = true;
            }
          });
        }

        // Handle blocks with items property (choice blocks, button blocks)
        if (
          "items" in block &&
          block.items?.length &&
          translation.defaultContent.includes(",")
        ) {
          const items = block.items as any[];
          const translatedItems = translation.defaultContent.split(", ");

          Object.entries(translation.translations).forEach(([locale, data]) => {
            if (typebotLocales.includes(locale) && data.content.trim()) {
              const localizedItems = data.content.split(", ");

              items.forEach((item, index) => {
                if (localizedItems[index]) {
                  if (!item.localizations) {
                    item.localizations = {};
                  }
                  if (!item.localizations[locale]) {
                    item.localizations[locale] = {};
                  }
                  item.localizations[locale].content = localizedItems[index];
                  updated = true;
                }
              });
            }
          });
        }

        // Handle blocks with options.labels (input blocks)
        if (
          "options" in block &&
          block.options?.labels &&
          translation.defaultContent.includes("/")
        ) {
          const options = block.options as any;
          const [placeholder, button] = translation.defaultContent.split(" / ");

          Object.entries(translation.translations).forEach(([locale, data]) => {
            if (typebotLocales.includes(locale) && data.content.trim()) {
              const [localizedPlaceholder, localizedButton] =
                data.content.split(" / ");

              if (!options.labels.localizations) {
                options.labels.localizations = {};
              }
              if (!options.labels.localizations[locale]) {
                options.labels.localizations[locale] = {};
              }

              if (localizedPlaceholder && placeholder) {
                options.labels.localizations[locale].placeholder =
                  localizedPlaceholder;
                updated = true;
              }
              if (localizedButton && button) {
                options.labels.localizations[locale].button = localizedButton;
                updated = true;
              }
            }
          });
        }

        if (updated) {
          result.updatedBlocks++;
        }

        return true; // Block found and processed
      }),
    );

    if (!blockFound) {
      result.warnings.push(
        `Block ${translation.blockId} (${translation.blockType}) not found in current typebot`,
      );
    }
  }

  result.success = result.errors.length === 0;

  return result;
};
