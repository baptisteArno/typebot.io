import {
  Badge,
  Box,
  Button,
  Checkbox,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import type {
  ClarificationChoice,
  DetectedElement,
  PreviewChoice,
} from "../types";

interface BlockPreviewStepProps {
  elements: DetectedElement[];
  clarificationChoices: ClarificationChoice[];
  previewChoices: PreviewChoice[];
  onPreviewChoiceChange: (elementIndex: number, isIncluded: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const BlockPreviewStep = ({
  elements,
  clarificationChoices,
  previewChoices,
  onPreviewChoiceChange,
  onGenerate,
  isLoading,
}: BlockPreviewStepProps) => {
  const borderColorSelected = useColorModeValue("blue.200", "blue.300");
  const borderColorUnselected = useColorModeValue("gray.200", "gray.600");
  const bgColorSelected = useColorModeValue("blue.50", "blue.900");
  const bgColorUnselected = useColorModeValue("gray.50", "gray.700");
  const textColorSecondary = useColorModeValue("gray.600", "gray.300");
  const textColorTertiary = useColorModeValue("gray.500", "gray.400");
  const textColorBlue = useColorModeValue("blue.600", "blue.300");
  const getBlockType = (elementIndex: number) => {
    const clarification = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    return (
      clarification?.selectedBlockType ||
      elements[elementIndex].suggestedBlockType ||
      elements[elementIndex].type
    );
  };

  const getIsMultiple = (elementIndex: number) => {
    const clarification = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    return clarification?.isMultiple;
  };

  const getIsIncluded = (elementIndex: number) => {
    const choice = previewChoices.find((c) => c.elementIndex === elementIndex);
    return choice?.isIncluded ?? true;
  };

  const formatBlockType = (blockType: string, isMultiple?: boolean) => {
    const formatted = blockType.replace(/_/g, " ");
    if (blockType === "button" && isMultiple !== undefined) {
      return `${formatted} (${isMultiple ? "Multiple" : "Single"} choice)`;
    }
    return formatted;
  };

  const includedCount = elements.filter((_, index) =>
    getIsIncluded(index),
  ).length;

  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="medium">
          Preview & Select Blocks
        </Text>
        <Text fontSize="sm" color={textColorSecondary} textAlign="center">
          Review the detected blocks and select which ones to include in your
          typebot. All blocks are selected by default, but you can uncheck any
          you don't want to include.
        </Text>
        <Text fontSize="sm" color={textColorBlue}>
          {includedCount} of {elements.length} blocks selected
        </Text>
      </VStack>

      <VStack spacing={4} align="stretch">
        {elements.map((element, index) => {
          const blockType = getBlockType(index);
          const isMultiple = getIsMultiple(index);
          const isIncluded = getIsIncluded(index);

          return (
            <Box
              key={index}
              p={4}
              border="1px"
              borderColor={
                isIncluded ? borderColorSelected : borderColorUnselected
              }
              borderRadius="md"
              bg={isIncluded ? bgColorSelected : bgColorUnselected}
              opacity={isIncluded ? 1 : 0.7}
            >
              <HStack spacing={4} align="start">
                <Checkbox
                  isChecked={isIncluded}
                  onChange={(e) =>
                    onPreviewChoiceChange(index, e.target.checked)
                  }
                  size="lg"
                  colorScheme="blue"
                />

                <VStack spacing={2} align="start" flex={1}>
                  <HStack spacing={2} wrap="wrap">
                    <Text fontWeight="medium">
                      {element.label || "Unlabeled element"}
                    </Text>
                    <Badge colorScheme="blue" size="sm">
                      {formatBlockType(blockType, isMultiple)}
                    </Badge>
                  </HStack>

                  {element.placeholder && (
                    <Text fontSize="sm" color={textColorSecondary}>
                      Placeholder: "{element.placeholder}"
                    </Text>
                  )}

                  {element.options && element.options.length > 0 && (
                    <Text fontSize="sm" color={textColorSecondary}>
                      Options: {element.options.join(", ")}
                    </Text>
                  )}

                  <Text fontSize="xs" color={textColorTertiary}>
                    Confidence: {Math.round(element.confidence * 100)}%
                  </Text>
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      <Button
        colorScheme="blue"
        size="lg"
        onClick={onGenerate}
        isLoading={isLoading}
        loadingText="Generating..."
        isDisabled={includedCount === 0}
        width="full"
      >
        {includedCount === 0
          ? "Select at least one block to continue"
          : `Generate Typebot with ${includedCount} block${includedCount === 1 ? "" : "s"}`}
      </Button>
    </VStack>
  );
};
