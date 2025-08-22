import { SparklesIcon } from "@/components/icons";
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
  translateRichTextContent,
} from "../helpers/richTextUtils";
import useAITranslation from "../hooks/useAITranslation";
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

  // AI Translation
  const { translateText, isTranslating, hasOpenAiCredentials } =
    useAITranslation();

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
            console.log(`🔍 DEBUGGING: getEditableContent for ${locale}:`, {
              loc,
              locEditableContent,
              richTextType: typeof locEditableContent.richText,
              richTextIsArray: Array.isArray(locEditableContent.richText),
            });
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
      console.log("📋 Extracted localization keys:", Object.keys(extracted));
      console.log("📋 Available locales:", availableLocales);
      console.log(
        "📋 Target locales:",
        availableLocales.filter((locale) => locale !== fallbackLocale),
      );
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
    console.log(`📝 handleContentChange called for ${locale}:`, {
      newContent,
      newContentLength: newContent.length,
      previous: localizations[locale]?.originalContent,
      previousLength: localizations[locale]?.originalContent?.length || 0,
      localizations: localizations,
      localizationExists: !!localizations[locale],
    });

    // Log the current state before the update
    console.log(`📝 Current localizations state before update:`, localizations);

    setLocalizations((prev) => {
      // Initialize locale data if it doesn't exist
      if (!prev[locale]) {
        console.log(`🆕 Initializing new locale data for ${locale}`);
        prev = {
          ...prev,
          [locale]: {
            content: "",
            richText: plainTextToRichText(""),
            originalContent: "", // This will be the baseline for change detection
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
      // Force change detection if we have content and the original was empty (new translation)
      const isNewTranslation = trimmedOriginal === "" && trimmedNew !== "";
      const contentActuallyChanged =
        hasChanges || lengthChanged || isNewTranslation;

      console.log(`🔍 Enhanced change detection for ${locale}:`, {
        newContent: `"${trimmedNew}"`,
        originalContent: `"${trimmedOriginal}"`,
        newLength: newContent.length,
        originalLength: originalContent.length,
        hasChanges,
        lengthChanged,
        isNewTranslation,
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

      console.log(`📝 Updated localizations state for ${locale}:`, updated);
      console.log(`📝 hasUnsavedChanges set to:`, hasAnyChanges);

      // Schedule a verification in the next tick to ensure state consistency
      setTimeout(() => {
        console.log(`📝 Post-update verification for ${locale}`);
      }, 0);

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
      newRichTextType: typeof newRichText,
      newRichTextIsArray: Array.isArray(newRichText),
      previous: localizations[locale]?.originalRichText,
    });

    // Simple validation - just ensure we have an array
    const validRichText = Array.isArray(newRichText) ? newRichText : [];

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
      const newContent = richTextToPlainText(validRichText);
      const originalContent = richTextToPlainText(originalRichText);

      // More robust change detection for rich text
      const trimmedNew = newContent.trim();
      const trimmedOriginal = originalContent.trim();
      const hasChanges = trimmedNew !== trimmedOriginal;

      // Extra check: if we're going from empty to non-empty or vice versa, that's definitely a change
      const lengthChanged = newContent.length !== originalContent.length;
      // Force change detection if we have content and the original was empty (new translation)
      const isNewTranslation = trimmedOriginal === "" && trimmedNew !== "";
      const contentActuallyChanged =
        hasChanges || lengthChanged || isNewTranslation;

      console.log(`🔍 Enhanced rich text change detection for ${locale}:`, {
        newContent: `"${trimmedNew}"`,
        originalContent: `"${trimmedOriginal}"`,
        newLength: newContent.length,
        originalLength: originalContent.length,
        hasChanges,
        lengthChanged,
        isNewTranslation,
        contentActuallyChanged,
        finalDecision: contentActuallyChanged,
      });

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          content: newContent,
          richText: validRichText,
          originalContent: prev[locale]?.originalContent || "",
          originalRichText: prev[locale]?.originalRichText || [],
          hasChanges: contentActuallyChanged,
          isRichText: prev[locale]?.isRichText || false,
        },
      };

      // Debug what we're actually storing in state
      console.log(`📦 State update for ${locale}:`, {
        validRichText,
        validRichTextType: typeof validRichText,
        validRichTextIsArray: Array.isArray(validRichText),
        stateRichText: updated[locale].richText,
        stateRichTextType: typeof updated[locale].richText,
        stateRichTextIsArray: Array.isArray(updated[locale].richText),
      });

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
          blockUpdates.content = { ...content };
        }
        if (!blockUpdates.content.localizations) {
          // Create a completely new localizations object to avoid extensibility issues
          blockUpdates.content.localizations = {};
          // Copy existing localizations
          if (content.localizations) {
            Object.keys(content.localizations).forEach((existingLocale) => {
              blockUpdates.content.localizations[existingLocale] = {
                ...content.localizations[existingLocale],
              };
            });
          }
        }
        if (!blockUpdates.content.localizations[locale]) {
          blockUpdates.content.localizations[locale] = {
            ...(content.localizations?.[locale] || {}),
          };
        }

        // Determine content type and apply
        if (content.richText !== undefined && data.isRichText) {
          console.log(`📝 Setting richText for ${locale}:`, {
            dataRichText: data.richText,
            dataRichTextType: typeof data.richText,
            dataRichTextIsArray: Array.isArray(data.richText),
          });

          // Ensure we're setting proper rich text array, not a string
          let richTextToSet = data.richText;
          if (typeof data.richText === "string") {
            console.error(
              `❌ CRITICAL: Attempting to save richText as string for ${locale}:`,
              data.richText,
            );
            try {
              richTextToSet = JSON.parse(data.richText);
              console.log(
                `✅ Parsed richText string for ${locale}:`,
                richTextToSet,
              );
            } catch (err) {
              console.error(
                `❌ Failed to parse richText string for ${locale}:`,
                err,
              );
              richTextToSet = plainTextToRichText(data.richText);
            }
          }

          blockUpdates.content.localizations[locale].richText = richTextToSet;
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
          blockUpdates.items = items.map((item) => ({ ...item }));
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
          blockUpdates.options = { ...options };
        }
        if (!blockUpdates.options.localizations) {
          blockUpdates.options.localizations = {};
          // Copy existing localizations
          if (options.localizations) {
            Object.keys(options.localizations).forEach((existingLocale) => {
              blockUpdates.options.localizations[existingLocale] = {
                ...options.localizations[existingLocale],
              };
            });
          }
        }
        if (!blockUpdates.options.localizations[locale]) {
          blockUpdates.options.localizations[locale] = {
            ...(options.localizations?.[locale] || {}),
          };
        }
        if (!blockUpdates.options.localizations[locale].labels) {
          blockUpdates.options.localizations[locale].labels = {
            ...(options.localizations?.[locale]?.labels || {}),
          };
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
          blockUpdates.options = { ...options };
        }
        if (!blockUpdates.options.localizations) {
          blockUpdates.options.localizations = {};
          // Copy existing localizations
          if (options.localizations) {
            Object.keys(options.localizations).forEach((existingLocale) => {
              blockUpdates.options.localizations[existingLocale] = {
                ...options.localizations[existingLocale],
              };
            });
          }
        }
        if (!blockUpdates.options.localizations[locale]) {
          blockUpdates.options.localizations[locale] = {
            ...(options.localizations?.[locale] || {}),
          };
        }
        if (!blockUpdates.options.localizations[locale].labels) {
          blockUpdates.options.localizations[locale].labels = {
            ...(options.localizations?.[locale]?.labels || {}),
          };
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

  // AI Translation handler
  const handleAITranslate = async (locale: string) => {
    const sourceText = defaultContent;
    if (!sourceText || !sourceText.trim()) {
      toast({
        title: "No content to translate",
        description: "The default content is empty",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Get the original rich text structure for rich text blocks
    const block = findBlock();
    let originalRichText: TElement[] = [];

    if (block && "content" in block && block.content && isDefaultRichText) {
      const content = block.content as any;
      const editableContent = getEditableContent(content);
      originalRichText = editableContent.richText;
    }

    console.log(`🤖 Starting AI translation for ${locale}:`, {
      sourceText,
      blockType,
      fallbackLocale,
      hasOpenAiCredentials,
      isTranslating,
    });

    // Check prerequisites
    if (!hasOpenAiCredentials) {
      console.log(`❌ No OpenAI credentials available for ${locale}`);
      toast({
        title: "No OpenAI credentials",
        description: "OpenAI credentials are required for AI translation",
        status: "error",
        duration: 3000,
      });
      return;
    }

    console.log(`🔄 Calling translateText for ${locale}...`);
    const result = await translateText({
      sourceText,
      sourceLocale: fallbackLocale,
      targetLocale: locale,
      context: `${blockType} block in ${groupTitle}`,
      blockType,
    });

    console.log(`🤖 AI translation result for ${locale}:`, result);

    // Add explicit check for null/undefined result
    if (!result) {
      console.log(`❌ No result returned from translateText for ${locale}`);
      toast({
        title: "Translation failed",
        description: "No translation result received",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!result.translatedText) {
      console.log(`❌ No translatedText in result for ${locale}:`, result);
      toast({
        title: "Translation failed",
        description: "Empty translation result",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Process the translation result
    console.log(`🤖 Processing translation result for ${locale}:`, {
      translatedText: result.translatedText,
      blockType,
      isRatingInput: blockType === "rating input",
      isInputBlock: [
        "text input",
        "number input",
        "email input",
        "url input",
        "date input",
        "time input",
        "phone number input",
        "file input",
      ].includes(blockType),
      currentLocalizations: localizations[locale],
    });

    // Apply the translation based on block type
    if (blockType === "rating input") {
      // For rating input, we need to parse the combined content
      // Try both "|" and " | " separators for more robust parsing
      const parts = result.translatedText.includes(" | ")
        ? result.translatedText.split(" | ")
        : result.translatedText.split("|").map((part) => part.trim());

      console.log(`⭐ Rating input parts for ${locale}:`, parts);

      if (parts.length >= 2) {
        console.log(`⭐ Setting rating labels for ${locale}:`, {
          leftLabel: parts[0] || "",
          rightLabel: parts[1] || "",
          button: parts[2] || "",
        });
        handleLeftLabelChange(locale, parts[0] || "");
        handleRightLabelChange(locale, parts[1] || "");
        if (parts[2]) {
          handleRatingButtonChange(locale, parts[2]);
        }
      } else {
        // Fallback: treat as single content
        console.log(
          `⭐ Rating input fallback for ${locale}: treating as single content`,
        );
        handleContentChange(locale, result.translatedText);
      }
    } else if (
      [
        "text input",
        "number input",
        "email input",
        "url input",
        "date input",
        "time input",
        "phone number input",
        "file input",
      ].includes(blockType)
    ) {
      // For input blocks, parse placeholder and button
      // Try both " / " and "/" separators for more robust parsing
      const parts = result.translatedText.includes(" / ")
        ? result.translatedText.split(" / ")
        : result.translatedText.split("/").map((part) => part.trim());

      console.log(`📝 Input block parts for ${locale}:`, parts);

      if (parts.length >= 1) {
        console.log(`📝 Setting input labels for ${locale}:`, {
          placeholder: parts[0] || "",
          button: parts[1] || "",
        });
        handlePlaceholderChange(locale, parts[0] || "");
        if (parts[1]) {
          handleButtonChange(locale, parts[1]);
        }
      } else {
        // Fallback: treat as single content
        console.log(
          `📝 Input block fallback for ${locale}: treating as single content`,
        );
        handleContentChange(locale, result.translatedText);
      }
    } else {
      // For text and other content blocks
      console.log(`📄 Regular content block for ${locale}:`, {
        isRichText: isDefaultRichText,
        translatedText: result.translatedText,
      });

      if (isDefaultRichText) {
        const richText = translateRichTextContent(
          originalRichText,
          result.translatedText,
        );
        console.log(`📄 Setting rich text for ${locale}:`, {
          originalRichText,
          translatedText: result.translatedText,
          resultRichText: richText,
          resultType: typeof richText,
          resultIsArray: Array.isArray(richText),
          resultFirstElement: richText[0],
        });

        // Additional debugging right before calling handleRichTextChange
        console.log(`🚀 About to call handleRichTextChange for ${locale}:`, {
          richText,
          richTextType: typeof richText,
          richTextIsArray: Array.isArray(richText),
          richTextStringified: JSON.stringify(richText),
        });

        handleRichTextChange(locale, richText);
      } else {
        console.log(
          `📄 Setting plain text for ${locale}:`,
          result.translatedText,
        );
        handleContentChange(locale, result.translatedText);
      }
    }

    console.log(`✅ AI translation applied for ${locale}`);
    toast({
      title: "AI Translation Applied",
      description: `Successfully translated to ${getLocaleDisplayName(locale)}`,
      status: "success",
      duration: 3000,
    });
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
                      <HStack justify="space-between">
                        <HStack>
                          <Text>
                            {getLocaleFlagEmoji(locale)}{" "}
                            {getLocaleDisplayName(locale)} (
                            {locale.toUpperCase()})
                          </Text>
                          {localizations[locale]?.hasChanges && (
                            <Badge colorScheme="orange" size="sm">
                              Modified
                            </Badge>
                          )}
                        </HStack>
                        <HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            leftIcon={<SparklesIcon />}
                            onClick={() => handleAITranslate(locale)}
                            isLoading={isTranslating}
                            isDisabled={!hasOpenAiCredentials}
                            colorScheme="blue"
                            title={
                              !hasOpenAiCredentials
                                ? "OpenAI credentials required. Add OpenAI credentials to your workspace or add an OpenAI block to your chatbot."
                                : undefined
                            }
                          >
                            AI Translate
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              console.log(
                                `🧪 Testing manual translation for ${locale}`,
                              );
                              const testTranslation = `Test translation for ${locale} - ${new Date().getTime()}`;
                              console.log(
                                `🧪 Setting test content: ${testTranslation}`,
                              );
                              handleContentChange(locale, testTranslation);
                            }}
                            colorScheme="gray"
                          >
                            Test
                          </Button>
                        </HStack>
                      </HStack>
                    </FormLabel>

                    {/* Rich text editor for text blocks */}
                    {blockType === "text" &&
                    (isDefaultRichText || localizations[locale]?.isRichText) ? (
                      <TranslationRichTextEditor
                        id={`translation-${blockId}-${locale}`}
                        initialValue={(() => {
                          const richText =
                            localizations[locale]?.richText || [];
                          console.log(
                            `🔍 DEBUGGING: TranslationRichTextEditor initialValue for ${locale}:`,
                            {
                              richText,
                              richTextType: typeof richText,
                              richTextIsArray: Array.isArray(richText),
                              richTextStringified: JSON.stringify(richText),
                              localizationData: localizations[locale],
                            },
                          );

                          // If it's a string, it means somewhere the rich text got serialized
                          if (typeof richText === "string") {
                            console.error(
                              `❌ PROBLEM: Rich text is a string for ${locale}:`,
                              richText,
                            );
                            try {
                              const parsed = JSON.parse(richText);
                              console.log(
                                `✅ Successfully parsed JSON for ${locale}:`,
                                parsed,
                              );
                              return parsed;
                            } catch (err) {
                              console.error(
                                `❌ JSON parse failed for ${locale}, falling back to plain text:`,
                                err,
                              );
                              return plainTextToRichText(richText);
                            }
                          }

                          // Should be array, but let's verify
                          if (!Array.isArray(richText)) {
                            console.error(
                              `❌ PROBLEM: Rich text is not array for ${locale}:`,
                              richText,
                            );
                            return [];
                          }

                          return richText;
                        })()}
                        onChange={(newRichText) =>
                          handleRichTextChange(locale, newRichText)
                        }
                        placeholder={`Enter ${getLocaleDisplayName(locale)} translation...`}
                        height="120px"
                        key={`richtext-${locale}-${hasUnsavedChanges ? "modified" : "original"}`}
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
                            key={`leftLabel-${locale}-${localizations[locale]?.leftLabel || "empty"}`}
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
                            key={`rightLabel-${locale}-${localizations[locale]?.rightLabel || "empty"}`}
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
                            key={`placeholder-${locale}-${localizations[locale]?.placeholder || "empty"}`}
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
                            key={`button-${locale}-${localizations[locale]?.button || "empty"}`}
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
                        key={`textarea-${locale}-${localizations[locale]?.content || "empty"}`}
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
