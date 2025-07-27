import type { LocalizedTypebotV6 } from "@/features/editor/providers/TypebotProvider";
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
import {
  getEditableContent,
  plainTextToRichText,
  richTextToPlainText,
} from "../helpers/richTextUtils";
import { useLocalization } from "../providers/LocalizationProvider";
import { TranslationRichTextEditor } from "./TranslationRichTextEditor";

interface EditTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string;
  blockType: string;
  groupTitle: string;
  defaultContent: string;
}

interface LocalizationData {
  [locale: string]: {
    content: string;
    richText: TElement[];
    originalContent: string;
    originalRichText: TElement[];
    hasChanges: boolean;
    isRichText: boolean;
  };
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
  const { availableLocales, fallbackLocale } = useLocalization();
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

    const data: LocalizationData = {};
    const targetLocales = availableLocales.filter(
      (locale) => locale !== fallbackLocale,
    );

    // Check if default content is rich text
    let defaultIsRichText = false;
    if ("content" in block && block.content) {
      const content = block.content as any;
      const editableContent = getEditableContent(content);
      defaultIsRichText = editableContent.isRichText;
      setIsDefaultRichText(defaultIsRichText);
    }

    targetLocales.forEach((locale) => {
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
      if (
        "items" in block &&
        block.items?.length &&
        defaultContent.includes(",")
      ) {
        const items = block.items as any[];
        const localizedItems: string[] = [];

        items.forEach((item) => {
          if (item.localizations?.[locale]?.content) {
            localizedItems.push(item.localizations[locale].content);
          } else {
            localizedItems.push(""); // Empty for missing translations
          }
        });

        currentContent = localizedItems.join(", ");
      }

      // Handle options.labels (input blocks)
      if (
        "options" in block &&
        block.options?.labels &&
        defaultContent.includes("/")
      ) {
        const options = block.options as any;
        const parts: string[] = [];

        if (options.labels.localizations?.[locale]?.placeholder) {
          parts.push(options.labels.localizations[locale].placeholder);
        } else {
          parts.push("");
        }

        if (options.labels.localizations?.[locale]?.button) {
          parts.push(options.labels.localizations[locale].button);
        } else {
          parts.push("");
        }

        currentContent = parts.join(" / ");
      }

      data[locale] = {
        content: currentContent,
        richText: currentRichText,
        originalContent: currentContent,
        originalRichText: [...currentRichText], // Create a copy
        hasChanges: false,
        isRichText: isRichTextForLocale,
      };
    });

    return data;
  };

  // Initialize localizations when modal opens and disable auto-save
  useEffect(() => {
    if (isOpen && typebot && blockId) {
      // Disable auto-save while modal is open to prevent conflicts
      setAutoSaveEnabled(false);

      const extracted = extractCurrentLocalizations();
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
  }, [isOpen, typebot, blockId, setAutoSaveEnabled]);

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
      previous: localizations[locale]?.originalContent,
    });

    setLocalizations((prev) => {
      const originalContent = prev[locale]?.originalContent || "";
      const hasChanges = newContent.trim() !== originalContent.trim();

      console.log(`🔍 Change detection for ${locale}:`, {
        newContent: newContent.trim(),
        originalContent: originalContent.trim(),
        hasChanges,
      });

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          content: newContent,
          richText: plainTextToRichText(newContent),
          originalContent: prev[locale]?.originalContent || "",
          originalRichText: prev[locale]?.originalRichText || [],
          hasChanges,
          isRichText: prev[locale]?.isRichText || false,
        },
      };

      // Check if any locale has changes
      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      console.log(`🎯 Overall changes detected:`, hasAnyChanges);
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
      const originalRichText = prev[locale]?.originalRichText || [];
      const newContent = richTextToPlainText(newRichText);
      const originalContent = richTextToPlainText(originalRichText);
      const hasChanges = newContent.trim() !== originalContent.trim();

      console.log(`🔍 Rich text change detection for ${locale}:`, {
        newContent: newContent.trim(),
        originalContent: originalContent.trim(),
        hasChanges,
      });

      const updated = {
        ...prev,
        [locale]: {
          ...prev[locale],
          content: newContent,
          richText: newRichText,
          originalContent: prev[locale]?.originalContent || "",
          originalRichText: prev[locale]?.originalRichText || [],
          hasChanges,
          isRichText: prev[locale]?.isRichText || false,
        },
      };

      // Check if any locale has changes
      const hasAnyChanges = Object.values(updated).some(
        (data) => data.hasChanges,
      );
      console.log(`🎯 Overall changes detected:`, hasAnyChanges);
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

        // Prepare the content updates
        if (!blockUpdates.content) {
          blockUpdates.content = { ...content };
        }
        if (!blockUpdates.content.localizations) {
          blockUpdates.content.localizations = {
            ...(content.localizations || {}),
          };
        }
        if (!blockUpdates.content.localizations[locale]) {
          blockUpdates.content.localizations[locale] = {
            ...(content.localizations?.[locale] || {}),
          };
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
      if (
        "items" in block &&
        block.items?.length &&
        data.content.includes(",")
      ) {
        console.log(`🔘 Processing items block for ${locale}`);
        const items = block.items as any[];
        const localizedItems = data.content.split(", ");
        console.log("📋 Items to update:", localizedItems);

        if (!blockUpdates.items) {
          blockUpdates.items = [...items];
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

      // Handle options.labels (input blocks)
      if (
        "options" in block &&
        block.options?.labels &&
        data.content.includes("/")
      ) {
        console.log(`🏷️ Processing options.labels block for ${locale}`);
        const options = block.options as any;
        const [placeholder, button] = data.content.split(" / ");
        console.log("🏷️ Labels to update:", { placeholder, button });

        if (!blockUpdates.options) {
          blockUpdates.options = { ...options };
        }
        if (!blockUpdates.options.labels) {
          blockUpdates.options.labels = { ...options.labels };
        }
        if (!blockUpdates.options.labels.localizations) {
          blockUpdates.options.labels.localizations = {
            ...(options.labels.localizations || {}),
          };
        }
        if (!blockUpdates.options.labels.localizations[locale]) {
          blockUpdates.options.labels.localizations[locale] = {
            ...(options.labels.localizations?.[locale] || {}),
          };
        }

        if (placeholder !== undefined) {
          console.log(`📝 Setting placeholder for ${locale}:`, placeholder);
          blockUpdates.options.labels.localizations[locale].placeholder =
            placeholder;
          hasAnyUpdates = true;
        }
        if (button !== undefined) {
          console.log(`🔘 Setting button for ${locale}:`, button);
          blockUpdates.options.labels.localizations[locale].button = button;
          hasAnyUpdates = true;
        }
        console.log(`✅ Options block updated for ${locale}`);
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
    });

    if (!typebot || !hasUnsavedChanges || !blockId) {
      console.log("❌ Save aborted - No typebot, no changes, or no blockId");
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
                <Text fontSize="sm" color="gray.700">
                  {defaultContent}
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* Translations */}
            <VStack spacing={4} align="stretch">
              <Text fontWeight="semibold">Translations</Text>

              {targetLocales.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No additional locales configured. Add more languages in the
                  localization settings.
                </Alert>
              ) : (
                targetLocales.map((locale) => (
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
                    ) : (
                      <Textarea
                        value={localizations[locale]?.content || ""}
                        onChange={(e) =>
                          handleContentChange(locale, e.target.value)
                        }
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
                    {blockType === "choice input" && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Separate multiple choices with ", " (comma and space)
                      </Text>
                    )}
                    {blockType === "text input" &&
                      defaultContent.includes("/") && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Format: placeholder / button text
                        </Text>
                      )}
                  </FormControl>
                ))
              )}
            </VStack>

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
                });
                handleSave();
              }}
              isLoading={isSaving}
              loadingText="Saving..."
              isDisabled={!hasUnsavedChanges}
            >
              Save Translations
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
