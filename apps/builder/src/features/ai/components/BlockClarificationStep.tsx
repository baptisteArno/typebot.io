import {
  Box,
  Button,
  Checkbox,
  HStack,
  Radio,
  RadioGroup,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ClarificationChoice, DetectedElement } from "../types";

interface BlockClarificationStepProps {
  elements: DetectedElement[];
  clarificationChoices: ClarificationChoice[];
  onClarificationChange: (
    elementIndex: number,
    selectedBlockType: string,
    isMultiple?: boolean,
  ) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const BLOCK_TYPE_OPTIONS = [
  {
    value: "text_input",
    label: "Text Input",
    description: "For open text responses",
  },
  {
    value: "number_input",
    label: "Number Input",
    description: "For numeric values",
  },
  {
    value: "email_input",
    label: "Email Input",
    description: "For email addresses",
  },
  {
    value: "phone_input",
    label: "Phone Input",
    description: "For phone numbers",
  },
  {
    value: "date_input",
    label: "Date Input",
    description: "For date selection",
  },
  { value: "url_input", label: "URL Input", description: "For website links" },
  {
    value: "button",
    label: "Choice/Button",
    description: "For selections or actions",
  },
  { value: "heading", label: "Heading", description: "For titles or headers" },
  { value: "text", label: "Text", description: "For regular text content" },
  { value: "image", label: "Image", description: "For pictures or visuals" },
];

export const BlockClarificationStep = ({
  elements,
  clarificationChoices,
  onClarificationChange,
  onGenerate,
  isLoading,
}: BlockClarificationStepProps) => {
  const elementsNeedingClarification = elements.filter(
    (el) => el.clarificationNeeded || el.type === "choice",
  );

  const getSelectedValue = (elementIndex: number) => {
    const choice = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    const element = elements[elementIndex];
    return (
      choice?.selectedBlockType ||
      element.suggestedBlockType ||
      (element.type === "choice" ? "button" : "") // Default choice elements to "button" for clarification
    );
  };

  const getIsMultiple = (elementIndex: number) => {
    const choice = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    return choice?.isMultiple ?? false;
  };

  const handleBlockTypeChange = (
    elementIndex: number,
    selectedBlockType: string,
  ) => {
    const existingChoice = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    onClarificationChange(
      elementIndex,
      selectedBlockType,
      existingChoice?.isMultiple ?? false,
    );
  };

  const handleMultipleChoiceChange = (
    elementIndex: number,
    isMultiple: boolean,
  ) => {
    const existingChoice = clarificationChoices.find(
      (c) => c.elementIndex === elementIndex,
    );
    if (existingChoice) {
      onClarificationChange(
        elementIndex,
        existingChoice.selectedBlockType,
        isMultiple,
      );
    } else {
      // If no existing choice, create one with the current selected value
      const element = elements[elementIndex];
      const selectedBlockType =
        element.suggestedBlockType ||
        (element.type === "choice" ? "button" : "");
      if (selectedBlockType) {
        onClarificationChange(elementIndex, selectedBlockType, isMultiple);
      }
    }
  };

  const allClarified = elementsNeedingClarification.every((_, index) => {
    const globalIndex = elements.findIndex(
      (el) => el === elementsNeedingClarification[index],
    );
    return getSelectedValue(globalIndex) !== "";
  });

  return (
    <VStack spacing={6} align="stretch">
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="medium">
          Clarify Ambiguous Elements
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          Some elements could be interpreted in multiple ways. Please clarify
          what type of block you want for each:
        </Text>
      </VStack>

      <VStack spacing={6} align="stretch">
        {elementsNeedingClarification.map((element, index) => {
          const globalIndex = elements.findIndex((el) => el === element);
          const selectedValue = getSelectedValue(globalIndex);
          const isMultiple = getIsMultiple(globalIndex);

          return (
            <Box
              key={globalIndex}
              p={4}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <VStack spacing={4} align="stretch">
                <VStack spacing={2} align="start">
                  <Text fontWeight="medium">
                    Element: "{element.label || "Unlabeled element"}"
                  </Text>
                  {element.placeholder && (
                    <Text fontSize="sm" color="gray.600">
                      Placeholder: "{element.placeholder}"
                    </Text>
                  )}
                  <Text fontSize="sm" color="gray.500">
                    Currently detected as: {element.type.replace("_", " ")}
                  </Text>
                </VStack>

                <RadioGroup
                  value={selectedValue}
                  onChange={(value) =>
                    handleBlockTypeChange(globalIndex, value)
                  }
                >
                  <VStack spacing={2} align="stretch">
                    {BLOCK_TYPE_OPTIONS.map((option) => (
                      <Radio key={option.value} value={option.value}>
                        <HStack spacing={2}>
                          <Text>{option.label}</Text>
                          <Text fontSize="sm" color="gray.500">
                            - {option.description}
                          </Text>
                        </HStack>
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>

                {selectedValue === "button" && (
                  <Box
                    pl={6}
                    pt={2}
                    cursor="pointer"
                    _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                    borderRadius="md"
                    p={2}
                  >
                    <Checkbox
                      isChecked={isMultiple}
                      onChange={(e) => {
                        handleMultipleChoiceChange(
                          globalIndex,
                          e.target.checked,
                        );
                      }}
                      colorScheme="blue"
                      size="md"
                    >
                      <Text fontSize="sm">Allow multiple selections</Text>
                    </Checkbox>
                  </Box>
                )}
              </VStack>
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
        isDisabled={!allClarified}
        width="full"
      >
        {allClarified
          ? "Continue to Preview"
          : "Select options for all elements"}
      </Button>
    </VStack>
  );
};
