import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import type { TElement } from "@udecode/plate-common";
import { useEffect, useState } from "react";
import { isLogicBlock } from "../helpers/logicBlockTypes";
import {
  getEditableContent,
  plainTextToRichText,
  richTextToPlainText,
} from "../helpers/richTextUtils";
import { useLocalization } from "../providers/LocalizationProvider";
import { ContentRenderer } from "./ContentRenderer";
import { TranslationRichTextEditor } from "./TranslationRichTextEditor";

interface EditTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string;
  blockType: string;
  groupTitle: string;
  defaultContent: string;
}

interface LocaleData {
  content: string;
  richText: TElement[];
  originalContent: string;
  originalRichText: TElement[];
  hasChanges: boolean;
  isRichText: boolean;
  // For input blocks with separate placeholder and button
  placeholder?: string;
  button?: string;
  originalPlaceholder?: string;
  originalButton?: string;
  // For rating input blocks
  leftLabel?: string;
  rightLabel?: string;
  originalLeftLabel?: string;
  originalRightLabel?: string;
}

interface LocalizationData {
  [locale: string]: LocaleData;
}

export const EditTranslationModal = ({
  isOpen,
  onClose,
  blockId,
  blockType,
  groupTitle,
  defaultContent,
}: EditTranslationModalProps) => {
  const { typebot, save, setAutoSaveEnabled, updateBlock } = useTypebot();
  const localizationContext = useLocalization();

  // Ensure we have some locales to work with, even if localization isn't fully configured
  const availableLocales =
    localizationContext.availableLocales.length > 1
      ? localizationContext.availableLocales
      : ["en", "fr", "de", "es"]; // Default set for testing/development
  const fallbackLocale = localizationContext.fallbackLocale;
  const [localizations, setLocalizations] = useState<LocalizationData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDefaultRichText, setIsDefaultRichText] = useState(false);
  const toast = useToast();

  // Find the block and its indices in the typebot
  const findBlockWithIndices = () => {
    if (!typebot || !blockId) return null;

    for (
      let groupIndex = 0;
      groupIndex < (typebot.groups || []).length;
      groupIndex++
    ) {
      const group = typebot.groups[groupIndex];
      for (
        let blockIndex = 0;
        blockIndex < (group.blocks || []).length;
        blockIndex++
      ) {
        const block = group.blocks[blockIndex];
        if (block.id === blockId) {
          return { block, groupIndex, blockIndex };
        }
      }
    }
    return null;
  };

  // Find the block in the typebot (backwards compatibility)
  const findBlock = () => {
    const result = findBlockWithIndices();
    return result ? result.block : null;
  };

  // Extract current localizations from the block
  const extractCurrentLocalizations = () => {
    const block = findBlock();
    if (!block) return {};

    // Skip logic blocks - they contain technical configuration, not user-facing content
    if (isLogicBlock(block.type as string)) {
      console.log(`⚠️ Skipping logic block type: ${block.type}`);
      return {};
    }

    const data: LocalizationData = {};
    const targetLocales = availableLocales.filter(
      (locale) => locale !== fallbackLocale,
    );

    // If no target locales, use default ones for development
    const localizationTargets =
      targetLocales.length > 0 ? targetLocales : ["fr", "de", "es"];

    // Check if default content is rich text
    let defaultIsRichText = false;
    if ("content" in block && block.content) {
      const content = block.content as any;
      const editableContent = getEditableContent(content);
      defaultIsRichText = editableContent.isRichText;
      setIsDefaultRichText(defaultIsRichText);
    }

    localizationTargets.forEach((locale) => {
      let currentContent = "";
      let currentRichText: TElement[] = [];
      let isRichTextForLocale = defaultIsRichText;

      // Extract content based on block structure
      if ("content" in block && block.content) {
        const content = block.content as any;
        if (content.localizations?.[locale]) {
          const loc = content.localizations[locale];

          // For text blocks, check if we should use rich text
          if (blockType === "text") {
            const locEditableContent = getEditableContent(loc);
            currentContent = locEditableContent.text;
            currentRichText = locEditableContent.richText;
            isRichTextForLocale = locEditableContent.isRichText;
          } else {
            currentContent = loc.plainText || loc.html || loc.url || "";
            currentRichText = plainTextToRichText(currentContent);
          }
        } else {
          // No localization exists, use empty content
          currentRichText = plainTextToRichText("");
        }
      }

      // Handle items (choice blocks, button blocks)
      if ("items" in block && block.items?.length) {
        const items = block.items as any[];
        const localizedItems: string[] = [];

        items.forEach((item) => {
          if (item.localizations?.[locale]?.content) {
            localizedItems.push(item.localizations[locale].content);
          } else {
            localizedItems.push(""); // Empty for missing translations
          }
        });

        // For single items, don't use comma separation
        currentContent =
          items.length === 1 ? localizedItems[0] : localizedItems.join(", ");
      }

      // Initialize the base data structure
      let localeData: LocaleData = {
        content: currentContent,
        richText: currentRichText,
        originalContent: currentContent, // This represents the baseline for change detection
        originalRichText: [...currentRichText], // Create a copy
        hasChanges: false,
        isRichText: isRichTextForLocale,
      };

      // Handle options.labels (input blocks) - check for input block types
      const isInputBlock = [
        "text input",
        "number input",
        "email input",
        "url input",
        "date input",
        "time input",
        "phone number input",
        "file input",
      ].includes(blockType);

      const isRatingInputBlock = blockType === "rating input";

      if ("options" in block && block.options?.labels && isInputBlock) {
        const options = block.options as any;

        // Extract separate placeholder and button values
        const placeholder =
          options.localizations?.[locale]?.labels?.placeholder || "";
        const button = options.localizations?.[locale]?.labels?.button || "";

        // Store both separate values and combined content for backward compatibility
        currentContent = [placeholder, button].filter(Boolean).join(" / ");

        // Add input-specific fields to the locale data
        localeData = {
          ...localeData,
          content: currentContent,
          originalContent: currentContent,
          placeholder,
          button,
          originalPlaceholder: placeholder,
          originalButton: button,
        };
      }

      // Handle rating input blocks separately
      if ("options" in block && block.options?.labels && isRatingInputBlock) {
        const options = block.options as any;

        // Extract rating-specific labels
        const leftLabel = options.localizations?.[locale]?.labels?.left || "";
        const rightLabel = options.localizations?.[locale]?.labels?.right || "";
        const button = options.localizations?.[locale]?.labels?.button || "";

        // Store combined content as used in TranslationManagementPage
        currentContent = [leftLabel, rightLabel, button]
          .filter(Boolean)
          .join(" | ");

        // Add rating-specific fields to the locale data
        localeData = {
          ...localeData,
          content: currentContent,
          originalContent: currentContent,
          leftLabel,
          rightLabel,
          button,
          originalLeftLabel: leftLabel,
          originalRightLabel: rightLabel,
          originalButton: button,
        };
      }

      data[locale] = localeData;
    });

    return data;
  };

  // Initialize localizations when modal opens and disable auto-save
  useEffect(() => {
    if (isOpen && typebot && blockId) {
      // Disable auto-save while modal is open to prevent conflicts
      setAutoSaveEnabled(false);

      console.log("🔄 Initializing EditTranslationModal:", {
        availableLocales,
        fallbackLocale,
        blockId,
        blockType,
      });

      const extracted = extractCurrentLocalizations();
      console.log("📋 Extracted localizations:", extracted);
      setLocalizations(extracted);
      setHasUnsavedChanges(false);
    }

    // Re-enable auto-save when modal closes
    if (!isOpen) {
      setAutoSaveEnabled(true);
      // Reset state when modal closes
      setLocalizations({});
      setHasUnsavedChanges(false);
    }
  }, [
    isOpen,
    typebot,
    blockId,
    setAutoSaveEnabled,
    availableLocales,
    fallbackLocale,
    blockType,
  ]);

  // Ensure auto-save is re-enabled when component unmounts
  useEffect(() => {
    return () => {
      setAutoSaveEnabled(true);
    };
  }, [setAutoSaveEnabled]);

  // Handle content change for a specific locale (plain text)
  const handleContentChange = (locale: string, newContent: string) => {
    console.log(`📝 Content changed for ${locale}:`, {
      newContent,
      newContentLength: newContent.length,
      previous: localizations[locale]?.originalContent,
      previousLength: localizations[locale]?.originalContent?.length || 0,
    });

    setLocalizations((prev) => {
      // Initialize locale data if it doesn't exist
      if (!prev[locale]) {
        console.log(`🆕 Initializing new locale data for ${locale}`);
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
          },
        };
      }

      const originalContent = prev[locale]?.originalContent || "";

      // More robust change detection
      const trimmedNew = newContent.trim();
      const trimmedOriginal = originalContent.trim();
      const hasChanges = trimmedNew !== trimmedOriginal;

      // Extra check: if we're going from empty to non-empty or vice versa, that's definitely a change
      const lengthChanged = newContent.length !== originalContent.length;
      const contentActuallyChanged = hasChanges || lengthChanged;

      console.log(`🔍 Enhanced change detection for ${locale}:`, {
        newContent: `"${trimmedNew}"`,
        originalContent: `"${trimmedOriginal}"`,
        newLength: newContent.length,
        originalLength: originalContent.length,
        hasChanges,
        lengthChanged,
        contentActuallyChanged,
        finalDecision: contentActuallyChanged,
      });

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          content: newContent,
          richText: plainTextToRichText(newContent),
          originalContent: prev[locale]?.originalContent || "",
          originalRichText: prev[locale]?.originalRichText || [],
          hasChanges: contentActuallyChanged,
          isRichText: prev[locale]?.isRichText || false,
        },
      };

      // Check if any locale has changes
      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      console.log(`🎯 Overall changes detected (text):`, {
        hasAnyChanges,
        localeData: Object.entries(updated).map(([loc, data]) => ({
          locale: loc,
          hasChanges: data.hasChanges,
          content: `"${data.content}"`,
          originalContent: `"${data.originalContent}"`,
          contentLength: data.content.length,
          originalLength: data.originalContent.length,
        })),
      });
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle placeholder change for input blocks
  const handlePlaceholderChange = (locale: string, newPlaceholder: string) => {
    console.log(`📝 Placeholder changed for ${locale}:`, newPlaceholder);

    setLocalizations((prev) => {
      if (!prev[locale]) {
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
            placeholder: "",
            button: "",
            originalPlaceholder: "",
            originalButton: "",
          },
        };
      }

      const originalPlaceholder = prev[locale]?.originalPlaceholder || "";
      const button = prev[locale]?.button || "";
      const hasChanges = newPlaceholder.trim() !== originalPlaceholder.trim();

      // Update combined content
      const newContent = [newPlaceholder, button].filter(Boolean).join(" / ");

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          placeholder: newPlaceholder,
          content: newContent,
          hasChanges:
            hasChanges ||
            prev[locale]?.button?.trim() !==
              prev[locale]?.originalButton?.trim(),
        },
      };

      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle button change for input blocks
  const handleButtonChange = (locale: string, newButton: string) => {
    console.log(`📝 Button changed for ${locale}:`, newButton);

    setLocalizations((prev) => {
      if (!prev[locale]) {
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
            placeholder: "",
            button: "",
            originalPlaceholder: "",
            originalButton: "",
          },
        };
      }

      const originalButton = prev[locale]?.originalButton || "";
      const placeholder = prev[locale]?.placeholder || "";
      const hasChanges = newButton.trim() !== originalButton.trim();

      // Update combined content
      const newContent = [placeholder, newButton].filter(Boolean).join(" / ");

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          button: newButton,
          content: newContent,
          hasChanges:
            hasChanges ||
            prev[locale]?.placeholder?.trim() !==
              prev[locale]?.originalPlaceholder?.trim(),
        },
      };

      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle left label change for rating input blocks
  const handleLeftLabelChange = (locale: string, newLeftLabel: string) => {
    console.log(`📝 Left label changed for ${locale}:`, newLeftLabel);

    setLocalizations((prev) => {
      if (!prev[locale]) {
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
            leftLabel: "",
            rightLabel: "",
            button: "",
            originalLeftLabel: "",
            originalRightLabel: "",
            originalButton: "",
          },
        };
      }

      const originalLeftLabel = prev[locale]?.originalLeftLabel || "";
      const rightLabel = prev[locale]?.rightLabel || "";
      const button = prev[locale]?.button || "";
      const hasChanges = newLeftLabel.trim() !== originalLeftLabel.trim();

      // Update combined content for rating input (left | right | button)
      const newContent = [newLeftLabel, rightLabel, button]
        .filter(Boolean)
        .join(" | ");

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          leftLabel: newLeftLabel,
          content: newContent,
          hasChanges:
            hasChanges ||
            prev[locale]?.rightLabel?.trim() !==
              prev[locale]?.originalRightLabel?.trim() ||
            prev[locale]?.button?.trim() !==
              prev[locale]?.originalButton?.trim(),
        },
      };

      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle right label change for rating input blocks
  const handleRightLabelChange = (locale: string, newRightLabel: string) => {
    console.log(`📝 Right label changed for ${locale}:`, newRightLabel);

    setLocalizations((prev) => {
      if (!prev[locale]) {
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
            leftLabel: "",
            rightLabel: "",
            button: "",
            originalLeftLabel: "",
            originalRightLabel: "",
            originalButton: "",
          },
        };
      }

      const originalRightLabel = prev[locale]?.originalRightLabel || "";
      const leftLabel = prev[locale]?.leftLabel || "";
      const button = prev[locale]?.button || "";
      const hasChanges = newRightLabel.trim() !== originalRightLabel.trim();

      // Update combined content for rating input (left | right | button)
      const newContent = [leftLabel, newRightLabel, button]
        .filter(Boolean)
        .join(" | ");

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          rightLabel: newRightLabel,
          content: newContent,
          hasChanges:
            hasChanges ||
            prev[locale]?.leftLabel?.trim() !==
              prev[locale]?.originalLeftLabel?.trim() ||
            prev[locale]?.button?.trim() !==
              prev[locale]?.originalButton?.trim(),
        },
      };

      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle button change for rating input blocks (separate from regular input blocks)
  const handleRatingButtonChange = (locale: string, newButton: string) => {
    console.log(`📝 Rating button changed for ${locale}:`, newButton);

    setLocalizations((prev) => {
      if (!prev[locale]) {
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
            leftLabel: "",
            rightLabel: "",
            button: "",
            originalLeftLabel: "",
            originalRightLabel: "",
            originalButton: "",
          },
        };
      }

      const originalButton = prev[locale]?.originalButton || "";
      const leftLabel = prev[locale]?.leftLabel || "";
      const rightLabel = prev[locale]?.rightLabel || "";
      const hasChanges = newButton.trim() !== originalButton.trim();

      // Update combined content for rating input (left | right | button)
      const newContent = [leftLabel, rightLabel, newButton]
        .filter(Boolean)
        .join(" | ");

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          button: newButton,
          content: newContent,
          hasChanges:
            hasChanges ||
            prev[locale]?.leftLabel?.trim() !==
              prev[locale]?.originalLeftLabel?.trim() ||
            prev[locale]?.rightLabel?.trim() !==
              prev[locale]?.originalRightLabel?.trim(),
        },
      };

      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Handle rich text content change for a specific locale
  const handleRichTextChange = (locale: string, newRichText: TElement[]) => {
    console.log(`📝 Rich text changed for ${locale}:`, {
      newRichText,
      previous: localizations[locale]?.originalRichText,
    });

    setLocalizations((prev) => {
      // Initialize locale data if it doesn't exist
      if (!prev[locale]) {
        console.log(
          `🆕 Initializing new locale data for ${locale} (rich text)`,
        );
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "",
            originalRichText: [],
            hasChanges: false,
            isRichText: false,
          },
        };
      }

      const originalRichText = prev[locale]?.originalRichText || [];
      const newContent = richTextToPlainText(newRichText);
      const originalContent = richTextToPlainText(originalRichText);

      // More robust change detection for rich text
      const trimmedNew = newContent.trim();
      const trimmedOriginal = originalContent.trim();
      const hasChanges = trimmedNew !== trimmedOriginal;

      // Extra check: if we're going from empty to non-empty or vice versa, that's definitely a change
      const lengthChanged = newContent.length !== originalContent.length;
      const contentActuallyChanged = hasChanges || lengthChanged;

      console.log(`🔍 Enhanced rich text change detection for ${locale}:`, {
        newContent: `"${trimmedNew}"`,
        originalContent: `"${trimmedOriginal}"`,
        newLength: newContent.length,
        originalLength: originalContent.length,
        hasChanges,
        lengthChanged,
        contentActuallyChanged,
        finalDecision: contentActuallyChanged,
      });

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          content: newContent,
          richText: newRichText,
          originalContent: prev[locale]?.originalContent || "",
          originalRichText: prev[locale]?.originalRichText || [],
          hasChanges: contentActuallyChanged,
          isRichText: prev[locale]?.isRichText || false,
        },
      };

      // Check if any locale has changes
      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      console.log(`🎯 Overall changes detected (rich text):`, {
        hasAnyChanges,
        localeData: Object.entries(updated).map(([loc, data]) => ({
          locale: loc,
          hasChanges: data.hasChanges,
          content: `"${data.content}"`,
          originalContent: `"${data.originalContent}"`,
          contentLength: data.content.length,
          originalLength: data.originalContent.length,
        })),
      });
      setHasUnsavedChanges(hasAnyChanges);

      return updated;
    });
  };

  // Apply localizations to the block using proper immutable updates
  const applyLocalizationsToBlock = () => {
    console.log("🔍 Finding block with ID:", blockId);
    const blockData = findBlockWithIndices();
    if (!blockData) {
      console.log("❌ Block not found!");
      return false;
    }

    const { block, groupIndex, blockIndex } = blockData;
    console.log("✅ Block found:", {
      type: block.type,
      id: block.id,
      groupIndex,
      blockIndex,
    });

    let hasAnyUpdates = false;
    console.log("📊 Localizations to process:", localizations);

    // Collect all changes to apply in a single update
    const blockUpdates: any = {};

    Object.entries(localizations).forEach(([locale, data]) => {
      console.log(`🔄 Processing locale ${locale}:`, data);
      if (!data.hasChanges) {
        console.log(`⏭️ Skipping ${locale} - no changes`);
        return;
      }
      console.log(`✏️ Applying changes for ${locale}:`, data.content);

      // Handle content blocks
      if ("content" in block && block.content) {
        console.log(`📝 Processing content block for ${locale}`);
        const content = block.content as any;
        console.log("📄 Block content structure:", content);

        // Prepare the content updates with deep cloning to avoid immutability issues
        if (!blockUpdates.content) {
          blockUpdates.content = JSON.parse(JSON.stringify(content));
        }
        if (!blockUpdates.content.localizations) {
          blockUpdates.content.localizations = JSON.parse(
            JSON.stringify(content.localizations || {}),
          );
        }
        if (!blockUpdates.content.localizations[locale]) {
          blockUpdates.content.localizations[locale] = JSON.parse(
            JSON.stringify(content.localizations?.[locale] || {}),
          );
        }

        // Determine content type and apply
        if (content.richText !== undefined && data.isRichText) {
          console.log(`📝 Setting richText for ${locale}:`, data.richText);
          blockUpdates.content.localizations[locale].richText = data.richText;
          // Also set plainText as fallback
          blockUpdates.content.localizations[locale].plainText = data.content;
        } else if (content.plainText !== undefined) {
          console.log(`✏️ Setting plainText for ${locale}:`, data.content);
          blockUpdates.content.localizations[locale].plainText = data.content;
        } else if (content.html !== undefined) {
          console.log(`🏷️ Setting html for ${locale}:`, data.content);
          blockUpdates.content.localizations[locale].html = data.content;
        } else if (content.url !== undefined) {
          console.log(`🔗 Setting url for ${locale}:`, data.content);
          blockUpdates.content.localizations[locale].url = data.content;
        } else if (content.richText !== undefined) {
          console.log(
            `📝 Setting richText as plainText for ${locale}:`,
            data.content,
          );
          blockUpdates.content.localizations[locale].plainText = data.content;
        }

        hasAnyUpdates = true;
        console.log(`✅ Content block updated for ${locale}`);
      }

      // Handle items (choice blocks, button blocks)
      if ("items" in block && block.items?.length) {
        console.log(`🔘 Processing items block for ${locale}`);
        const items = block.items as any[];
        // Handle both single items and comma-separated items
        const localizedItems = data.content.includes(", ")
          ? data.content.split(", ")
          : [data.content]; // Single item
        console.log("📋 Items to update:", localizedItems);

        if (!blockUpdates.items) {
          blockUpdates.items = JSON.parse(JSON.stringify(items));
        }

        blockUpdates.items.forEach((item: any, index: number) => {
          if (localizedItems[index] !== undefined) {
            console.log(
              `🔹 Updating item ${index} for ${locale}:`,
              localizedItems[index],
            );
            if (!item.localizations) {
              item.localizations = {};
            }
            if (!item.localizations[locale]) {
              item.localizations[locale] = {};
            }
            item.localizations[locale].content = localizedItems[index];
            hasAnyUpdates = true;
          }
        });
        console.log(`✅ Items block updated for ${locale}`);
      }

      // Handle options.labels (input blocks) - check for input block types
      const isInputBlock = [
        "text input",
        "number input",
        "email input",
        "url input",
        "date input",
        "time input",
        "phone number input",
        "file input",
      ].includes(blockType);

      const isRatingInputBlock = blockType === "rating input";

      if ("options" in block && block.options?.labels && isInputBlock) {
        console.log(`🏷️ Processing options.labels block for ${locale}`);
        const options = block.options as any;

        // Use separate values if available, otherwise parse from content
        let placeholder: string;
        let button: string;

        if (data.placeholder !== undefined && data.button !== undefined) {
          placeholder = data.placeholder;
          button = data.button;
        } else {
          // Fallback to parsing from content for backward compatibility
          [placeholder, button] = data.content.includes(" / ")
            ? data.content.split(" / ")
            : [data.content, ""];
        }

        console.log("🏷️ Labels to update:", { placeholder, button });

        if (!blockUpdates.options) {
          blockUpdates.options = JSON.parse(JSON.stringify(options));
        }
        if (!blockUpdates.options.localizations) {
          blockUpdates.options.localizations = JSON.parse(
            JSON.stringify(options.localizations || {}),
          );
        }
        if (!blockUpdates.options.localizations[locale]) {
          blockUpdates.options.localizations[locale] = JSON.parse(
            JSON.stringify(options.localizations?.[locale] || {}),
          );
        }
        if (!blockUpdates.options.localizations[locale].labels) {
          blockUpdates.options.localizations[locale].labels = JSON.parse(
            JSON.stringify(options.localizations?.[locale]?.labels || {}),
          );
        }

        console.log(`📝 Setting placeholder for ${locale}:`, placeholder);
        blockUpdates.options.localizations[locale].labels.placeholder =
          placeholder;
        console.log(`🔘 Setting button for ${locale}:`, button);
        blockUpdates.options.localizations[locale].labels.button = button;
        hasAnyUpdates = true;
        console.log(`✅ Options block updated for ${locale}`);
      }

      // Handle rating input blocks separately
      if ("options" in block && block.options?.labels && isRatingInputBlock) {
        console.log(`⭐ Processing rating input labels for ${locale}`);
        const options = block.options as any;

        // Use separate values if available, otherwise parse from content
        let leftLabel: string;
        let rightLabel: string;
        let button: string;

        if (
          data.leftLabel !== undefined &&
          data.rightLabel !== undefined &&
          data.button !== undefined
        ) {
          leftLabel = data.leftLabel;
          rightLabel = data.rightLabel;
          button = data.button;
        } else {
          // Fallback to parsing from content for backward compatibility
          [leftLabel, rightLabel, button] = data.content.includes(" | ")
            ? data.content.split(" | ")
            : [data.content, "", ""];
        }

        console.log("⭐ Rating labels to update:", {
          leftLabel,
          rightLabel,
          button,
        });

        if (!blockUpdates.options) {
          blockUpdates.options = JSON.parse(JSON.stringify(options));
        }
        if (!blockUpdates.options.localizations) {
          blockUpdates.options.localizations = JSON.parse(
            JSON.stringify(options.localizations || {}),
          );
        }
        if (!blockUpdates.options.localizations[locale]) {
          blockUpdates.options.localizations[locale] = JSON.parse(
            JSON.stringify(options.localizations?.[locale] || {}),
          );
        }
        if (!blockUpdates.options.localizations[locale].labels) {
          blockUpdates.options.localizations[locale].labels = JSON.parse(
            JSON.stringify(options.localizations?.[locale]?.labels || {}),
          );
        }

        console.log(`⬅️ Setting left label for ${locale}:`, leftLabel);
        blockUpdates.options.localizations[locale].labels.left = leftLabel;
        console.log(`➡️ Setting right label for ${locale}:`, rightLabel);
        blockUpdates.options.localizations[locale].labels.right = rightLabel;
        console.log(`🔘 Setting button for ${locale}:`, button);
        blockUpdates.options.localizations[locale].labels.button = button;
        hasAnyUpdates = true;
        console.log(`✅ Rating input block updated for ${locale}`);
      }
    });

    // Apply all updates at once using the updateBlock action
    if (hasAnyUpdates && Object.keys(blockUpdates).length > 0) {
      console.log("🚀 Applying block updates:", blockUpdates);
      updateBlock({ groupIndex, blockIndex }, blockUpdates);
      console.log("✅ Block updated successfully");
    }

    console.log("🏁 Final update result:", hasAnyUpdates);
    return hasAnyUpdates;
  };

  // Handle save
  const handleSave = async () => {
    console.log("🔄 Save initiated:", {
      typebot: !!typebot,
      hasUnsavedChanges,
      blockId,
      localizationsState: localizations,
      localizationsKeys: Object.keys(localizations),
    });

    // Detailed debugging of the localizations state
    console.log("🔍 Detailed localizations analysis:");
    Object.entries(localizations).forEach(([locale, data]) => {
      console.log(`  Locale ${locale}:`, {
        content: `"${data.content}"`,
        originalContent: `"${data.originalContent}"`,
        hasChanges: data.hasChanges,
        contentLength: data.content.length,
        originalLength: data.originalContent.length,
        contentTrimmed: `"${data.content.trim()}"`,
        originalTrimmed: `"${data.originalContent.trim()}"`,
        areEqual: data.content === data.originalContent,
        areEqualTrimmed: data.content.trim() === data.originalContent.trim(),
      });
    });

    const localesWithChanges = Object.entries(localizations).filter(
      ([, data]) => data.hasChanges,
    );
    console.log(
      "🎯 Locales with changes:",
      localesWithChanges.map(([locale, data]) => ({
        locale,
        content: `"${data.content}"`,
        originalContent: `"${data.originalContent}"`,
      })),
    );

    if (!typebot || !blockId) {
      console.log("❌ Save aborted - No typebot or no blockId");
      return;
    }

    if (!hasUnsavedChanges) {
      console.log("❌ Save aborted - No unsaved changes detected");
      console.log(
        "🔍 hasUnsavedChanges is false but let's check individual locale changes:",
      );
      const manualChangeCheck = Object.values(localizations).some((data) => {
        const hasChange = data.content.trim() !== data.originalContent.trim();
        console.log(
          `  Manual check: "${data.content.trim()}" !== "${data.originalContent.trim()}" = ${hasChange}`,
        );
        return hasChange;
      });
      console.log("🔍 Manual change check result:", manualChangeCheck);
      return;
    }

    setIsSaving(true);
    try {
      console.log("🔍 Applying localizations to block...");
      const wasUpdated = applyLocalizationsToBlock();
      console.log("📝 Block update result:", wasUpdated);

      if (wasUpdated) {
        console.log("💾 Calling save function...");
        await save();
        console.log("✅ Save completed successfully");

        // Update original content to current content
        setLocalizations((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((locale) => {
            updated[locale] = {
              ...updated[locale],
              originalContent: updated[locale].content,
              originalRichText: [...updated[locale].richText], // Create a copy
              hasChanges: false,
              // Reset original values for input blocks
              originalPlaceholder: updated[locale].placeholder,
              originalButton: updated[locale].button,
            };
          });
          return updated;
        });

        setHasUnsavedChanges(false);

        toast({
          title: "Translations saved",
          description: "Block translations have been updated successfully",
          status: "success",
          duration: 3000,
        });

        // Re-enable auto-save before closing
        setAutoSaveEnabled(true);
        onClose();
      } else {
        console.log("⚠️ No updates were made to the block");
        toast({
          title: "No changes detected",
          description: "No translations were updated",
          status: "info",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("💥 Save error:", error);
      toast({
        title: "Save failed",
        description: `Failed to save translations: ${error instanceof Error ? error.message : "Unknown error"}`,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?",
        )
      ) {
        // Re-enable auto-save before closing
        setAutoSaveEnabled(true);
        onClose();
      }
    } else {
      // Re-enable auto-save before closing
      setAutoSaveEnabled(true);
      onClose();
    }
  };

  const targetLocales = availableLocales.filter(
    (locale) => locale !== fallbackLocale,
  );

  console.log("🎯 Target locales for translation:", {
    availableLocales,
    fallbackLocale,
    targetLocales,
  });

  // Don't render modal content if we don't have valid data
  if (!blockId && isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxH="80vh">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <Text fontSize="lg" fontWeight="bold">
              Edit Translations
            </Text>
            <HStack>
              <Badge colorScheme="blue" size="sm">
                {blockType}
              </Badge>
              <Text fontSize="sm" color="gray.600">
                {groupTitle}
              </Text>
            </HStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Default Content */}
            <Box>
              <FormLabel fontWeight="semibold" mb={2}>
                Default Content ({fallbackLocale.toUpperCase()})
              </FormLabel>
              <Box
                p={3}
                bg="gray.50"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <ContentRenderer
                  content={defaultContent}
                  blockType={blockType}
                />
              </Box>
            </Box>

            <Divider />

            {/* Translations */}
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">Translations</Text>

              {targetLocales.length === 0 && (
                <Alert status="info">
                  <AlertIcon />
                  No additional locales configured. The system will use default
                  locales (French, German, Spanish) for development.
                </Alert>
              )}

              {/* Always show translation fields, even if targetLocales is empty */}
              {(targetLocales.length > 0
                ? targetLocales
                : ["fr", "de", "es"]
              ).map((locale) => {
                const isInputBlockWithLabels =
                  [
                    "text input",
                    "number input",
                    "email input",
                    "url input",
                    "date input",
                    "time input",
                    "phone number input",
                    "file input",
                  ].includes(blockType) && defaultContent.includes("/");

                const isRatingInputBlock = blockType === "rating input";

                return (
                  <FormControl key={locale}>
                    <FormLabel>
                      <HStack>
                        <Text>
                          {getLocaleFlagEmoji(locale)}{" "}
                          {getLocaleDisplayName(locale)} ({locale.toUpperCase()}
                          )
                        </Text>
                        {localizations[locale]?.hasChanges && (
                          <Badge colorScheme="orange" size="sm">
                            Modified
                          </Badge>
                        )}
                      </HStack>
                    </FormLabel>

                    {/* Rich text editor for text blocks */}
                    {blockType === "text" &&
                    (isDefaultRichText || localizations[locale]?.isRichText) ? (
                      <TranslationRichTextEditor
                        id={`translation-${blockId}-${locale}`}
                        initialValue={localizations[locale]?.richText || []}
                        onChange={(newRichText) =>
                          handleRichTextChange(locale, newRichText)
                        }
                        placeholder={`Enter ${getLocaleDisplayName(locale)} translation...`}
                        height="120px"
                      />
                    ) : isRatingInputBlock ? (
                      /* Separate inputs for rating input labels */
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Left Label
                          </Text>
                          <Textarea
                            value={localizations[locale]?.leftLabel || ""}
                            onChange={(e) => {
                              console.log(
                                `📝 Left label changed for ${locale}:`,
                                e.target.value,
                              );
                              handleLeftLabelChange(locale, e.target.value);
                            }}
                            placeholder={`Enter ${getLocaleDisplayName(locale)} left label...`}
                            rows={1}
                            resize="vertical"
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Right Label
                          </Text>
                          <Textarea
                            value={localizations[locale]?.rightLabel || ""}
                            onChange={(e) => {
                              console.log(
                                `📝 Right label changed for ${locale}:`,
                                e.target.value,
                              );
                              handleRightLabelChange(locale, e.target.value);
                            }}
                            placeholder={`Enter ${getLocaleDisplayName(locale)} right label...`}
                            rows={1}
                            resize="vertical"
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Button Text
                          </Text>
                          <Textarea
                            value={localizations[locale]?.button || ""}
                            onChange={(e) => {
                              console.log(
                                `📝 Rating button changed for ${locale}:`,
                                e.target.value,
                              );
                              handleRatingButtonChange(locale, e.target.value);
                            }}
                            placeholder={`Enter ${getLocaleDisplayName(locale)} button text...`}
                            rows={1}
                            resize="vertical"
                          />
                        </Box>
                      </VStack>
                    ) : isInputBlockWithLabels ? (
                      /* Separate inputs for placeholder and button text */
                      <VStack spacing={3} align="stretch">
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Placeholder Text
                          </Text>
                          <Textarea
                            value={localizations[locale]?.placeholder || ""}
                            onChange={(e) => {
                              console.log(
                                `📝 Placeholder changed for ${locale}:`,
                                e.target.value,
                              );
                              handlePlaceholderChange(locale, e.target.value);
                            }}
                            placeholder={`Enter ${getLocaleDisplayName(locale)} placeholder text...`}
                            rows={2}
                            resize="vertical"
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Button Text
                          </Text>
                          <Textarea
                            value={localizations[locale]?.button || ""}
                            onChange={(e) => {
                              console.log(
                                `📝 Button changed for ${locale}:`,
                                e.target.value,
                              );
                              handleButtonChange(locale, e.target.value);
                            }}
                            placeholder={`Enter ${getLocaleDisplayName(locale)} button text...`}
                            rows={1}
                            resize="vertical"
                          />
                        </Box>
                      </VStack>
                    ) : (
                      /* Regular textarea for other block types */
                      <Textarea
                        value={localizations[locale]?.content || ""}
                        onChange={(e) => {
                          console.log(
                            `📝 Textarea changed for ${locale}:`,
                            e.target.value,
                          );
                          handleContentChange(locale, e.target.value);
                        }}
                        placeholder={`Enter ${getLocaleDisplayName(locale)} translation...`}
                        rows={
                          blockType === "choice input" ||
                          defaultContent.includes(",")
                            ? 3
                            : 2
                        }
                        resize="vertical"
                      />
                    )}

                    {/* Help text */}
                    {blockType === "choice input" && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Separate multiple choices with ", " (comma and space)
                      </Text>
                    )}
                    {isInputBlockWithLabels && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Use separate fields above for placeholder and button
                        text
                      </Text>
                    )}
                    {isRatingInputBlock && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Configure the left label, right label, and button text
                        for the rating input
                      </Text>
                    )}
                  </FormControl>
                );
              })}
            </VStack>

            {/* Debug info */}
            <Alert status="info" fontSize="xs">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text>
                  Debug: hasUnsavedChanges = {hasUnsavedChanges.toString()}
                </Text>
                <Text>
                  Localizations: {Object.keys(localizations).join(", ")}
                </Text>
                <Text>
                  Changes:{" "}
                  {Object.entries(localizations)
                    .map(
                      ([locale, data]) =>
                        `${locale}: ${data.hasChanges ? "YES" : "NO"}`,
                    )
                    .join(", ")}
                </Text>
              </VStack>
            </Alert>

            {hasUnsavedChanges && (
              <Alert status="warning">
                <AlertIcon />
                You have unsaved changes. Click Save to apply them.
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                console.log("🖱️ Save button clicked!", {
                  hasUnsavedChanges,
                  isSaving,
                  localizationsState: localizations,
                  targetLocales,
                });
                handleSave();
              }}
              isLoading={isSaving}
              loadingText="Saving..."
              isDisabled={!hasUnsavedChanges}
            >
              Save Translations{" "}
              {!hasUnsavedChanges && "(Disabled - No Changes)"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
