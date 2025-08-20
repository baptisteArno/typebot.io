import { SparklesIcon } from "@/components/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import { useState } from "react";
import useAITranslation from "../hooks/useAITranslation";
import type { TranslationTableRow } from "./TranslationManagementPage";

interface BulkAITranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  translationData: TranslationTableRow[];
  availableLocales: string[];
  fallbackLocale: string;
  onTranslationComplete: (results: {
    successCount: number;
    errorCount: number;
    targetLocale: string;
  }) => void;
}

export const BulkAITranslationModal = ({
  isOpen,
  onClose,
  translationData,
  availableLocales,
  fallbackLocale,
  onTranslationComplete,
}: BulkAITranslationModalProps) => {
  const [selectedLocale, setSelectedLocale] = useState<string>(
    availableLocales.find((locale) => locale !== fallbackLocale) || "",
  );
  const [translationMode, setTranslationMode] = useState<
    "missing" | "incomplete" | "all"
  >("missing");

  const {
    translateBulk,
    isTranslating,
    progress,
    error,
    clearError,
    hasOpenAiCredentials,
  } = useAITranslation();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Filter data based on selected mode
  const getFilteredData = () => {
    return translationData.filter((row) => {
      const completeness = row.translations[selectedLocale]?.completeness || 0;

      switch (translationMode) {
        case "missing":
          return completeness === 0;
        case "incomplete":
          return completeness > 0 && completeness < 100;
        case "all":
          return true;
        default:
          return false;
      }
    });
  };

  const filteredData = getFilteredData();

  const handleTranslate = async () => {
    if (!selectedLocale || filteredData.length === 0) return;

    clearError();

    // Prepare bulk translation request
    const items = filteredData.map((row) => ({
      id: row.blockId,
      text: row.defaultContent,
      context: row.groupTitle,
      blockType: row.blockType,
    }));

    const result = await translateBulk({
      items,
      sourceLocale: fallbackLocale,
      targetLocale: selectedLocale,
    });

    if (result) {
      onTranslationComplete({
        successCount: result.translations.length,
        errorCount: result.errors.length,
        targetLocale: selectedLocale,
      });

      if (result.errors.length === 0) {
        onClose();
      }
    }
  };

  const getEstimatedCost = () => {
    // Rough estimation: ~$0.0001 per translation for short texts
    const estimatedCost = filteredData.length * 0.0001;
    return estimatedCost.toFixed(4);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isTranslating}
    >
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor}>
        <ModalHeader>
          <HStack>
            <SparklesIcon boxSize={5} />
            <Text>AI Bulk Translation</Text>
          </HStack>
        </ModalHeader>
        {!isTranslating && <ModalCloseButton />}

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Target Language Selection */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="medium">Target Language</Text>
              <Select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                placeholder="Select target language"
              >
                {availableLocales
                  .filter((locale) => locale !== fallbackLocale)
                  .map((locale) => (
                    <option key={locale} value={locale}>
                      {getLocaleFlagEmoji(locale)}{" "}
                      {getLocaleDisplayName(locale)}
                    </option>
                  ))}
              </Select>
            </VStack>

            {/* Translation Mode Selection */}
            <VStack align="start" spacing={2}>
              <Text fontWeight="medium">What to translate</Text>
              <Select
                value={translationMode}
                onChange={(e) =>
                  setTranslationMode(e.target.value as typeof translationMode)
                }
              >
                <option value="missing">Missing translations only</option>
                <option value="incomplete">Incomplete translations only</option>
                <option value="all">All blocks (overwrite existing)</option>
              </Select>
            </VStack>

            {/* Statistics */}
            {selectedLocale && (
              <VStack
                align="start"
                spacing={2}
                p={3}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius="md"
              >
                <Text fontSize="sm" fontWeight="medium">
                  Translation Summary
                </Text>
                <Text fontSize="sm">
                  <strong>{filteredData.length}</strong> blocks will be
                  translated
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Estimated cost: ~${getEstimatedCost()} USD
                </Text>
              </VStack>
            )}

            {/* Progress Bar */}
            {isTranslating && (
              <VStack spacing={2}>
                <Progress
                  value={progress}
                  width="100%"
                  colorScheme="blue"
                  hasStripe
                  isAnimated
                />
                <Text fontSize="sm" color="gray.500">
                  Translating... {Math.round(progress)}% complete
                </Text>
              </VStack>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Warning for no OpenAI credentials */}
            {!hasOpenAiCredentials && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  OpenAI credentials are required for AI translation. Please add
                  OpenAI credentials to your workspace or add an OpenAI block to
                  your chatbot first.
                </AlertDescription>
              </Alert>
            )}

            {/* Warning for no items */}
            {selectedLocale && filteredData.length === 0 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  No blocks match the selected criteria for{" "}
                  {getLocaleDisplayName(selectedLocale)}.
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={isTranslating}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<SparklesIcon />}
              onClick={handleTranslate}
              isLoading={isTranslating}
              isDisabled={
                !selectedLocale ||
                filteredData.length === 0 ||
                !hasOpenAiCredentials
              }
              loadingText="Translating..."
            >
              Translate {filteredData.length} blocks
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
