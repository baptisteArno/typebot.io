import { Badge, Box, HStack, Text, Tooltip, VStack } from "@chakra-ui/react";
import type React from "react";

interface ContentRendererProps {
  content: string;
  blockType: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  blockType,
}) => {
  if (!content || content.trim() === "") {
    return (
      <Text fontSize="sm" color="gray.400" fontStyle="italic">
        No content
      </Text>
    );
  }

  // Check if content is rich text (JSON format)
  const isRichText = (text: string): boolean => {
    try {
      const parsed = JSON.parse(text);
      return (
        Array.isArray(parsed) &&
        parsed.some(
          (item) => item && typeof item === "object" && "type" in item,
        )
      );
    } catch {
      return false;
    }
  };

  // Extract plain text from rich text structure
  const extractTextFromRichText = (richTextJson: string): string => {
    try {
      const richTextArray = JSON.parse(richTextJson);
      if (!Array.isArray(richTextArray)) return richTextJson;

      return richTextArray
        .map((node: any) => {
          if (typeof node === "string") return node;
          if (node?.text) return node.text;
          if (node?.children) {
            return node.children
              .map((child: any) => {
                if (typeof child === "string") return child;
                return child?.text || "";
              })
              .join("");
          }
          return "";
        })
        .join("")
        .trim();
    } catch {
      return content;
    }
  };

  // For regular content, show with expandable behavior for long text
  const isLongContent = content.length > 100;

  // Handle different content types based on block type
  const renderContent = () => {
    // For choice inputs, display as comma-separated items
    if (blockType === "choice input" && content.includes(", ")) {
      const items = content.split(", ").filter(Boolean);
      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Choice Input
            </Badge>
          </HStack>
          <Box>
            {items.map((item, index) => (
              <HStack key={index} spacing={1}>
                <Badge colorScheme="blue" size="sm" variant="outline">
                  {index + 1}
                </Badge>
                <Text fontSize="sm">{item}</Text>
              </HStack>
            ))}
          </Box>
        </VStack>
      );
    } else if (blockType === "choice input" && !content.includes(", ")) {
      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Choice Input
            </Badge>
          </HStack>
          <Box>
            <Text fontSize="sm">{content}</Text>
          </Box>
        </VStack>
      );
    }

    if (blockType === "image" && !content.includes(" | ")) {
      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Image
            </Badge>
          </HStack>
          <Box>
            {isLongContent ? (
              <Tooltip label={content} placement="top" hasArrow>
                <Text fontSize="sm" noOfLines={3} cursor="help">
                  {content.substring(0, 40)}...
                </Text>
              </Tooltip>
            ) : (
              <Text fontSize="sm">{content}</Text>
            )}
          </Box>
        </VStack>
      );
    }

    // For rating input blocks with labels (left | right | button)
    if (blockType === "rating input" && content.includes(" | ")) {
      const [left, right, button] = content.split(" | ");
      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Rating Input
            </Badge>
          </HStack>
          <Box>
            {left && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" minW="fit-content">
                  Left Label:
                </Text>
                <Text fontSize="sm">{left}</Text>
              </HStack>
            )}
            {right && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" minW="fit-content">
                  Right Label:
                </Text>
                <Text fontSize="sm">{right}</Text>
              </HStack>
            )}
            {button && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" minW="fit-content">
                  Button:
                </Text>
                <Text fontSize="sm">{button}</Text>
              </HStack>
            )}
          </Box>
        </VStack>
      );
    }

    // For input blocks with labels (placeholder / button)
    if (content.includes(" / ")) {
      const [placeholder, button] = content.split(" / ");
      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Text Input
            </Badge>
          </HStack>
          <Box>
            {placeholder && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" minW="fit-content">
                  Placeholder:
                </Text>
                <Text fontSize="sm">{placeholder}</Text>
              </HStack>
            )}
            {button && (
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500" minW="fit-content">
                  Button:
                </Text>
                <Text fontSize="sm">{button}</Text>
              </HStack>
            )}
          </Box>
        </VStack>
      );
    }

    // Handle rich text content
    if (isRichText(content)) {
      const plainText = extractTextFromRichText(content);
      const isLongContent = plainText.length > 100;

      return (
        <VStack align="start" spacing={1}>
          <HStack spacing={2}>
            <Badge colorScheme="purple" size="sm" variant="outline">
              Rich Text
            </Badge>
          </HStack>
          <Box>
            {isLongContent ? (
              <Tooltip label={plainText} placement="top" hasArrow>
                <Text fontSize="sm" noOfLines={3} cursor="help">
                  {plainText}
                </Text>
              </Tooltip>
            ) : (
              <Text fontSize="sm">{plainText}</Text>
            )}
          </Box>
        </VStack>
      );
    }

    // For regular content, show with expandable behavior for long text
    return (
      <Box>
        {isLongContent ? (
          <Tooltip label={content} placement="top" hasArrow>
            <Text fontSize="sm" noOfLines={3} cursor="help">
              {content}
            </Text>
          </Tooltip>
        ) : (
          <Text fontSize="sm">{content}</Text>
        )}
      </Box>
    );
  };

  return renderContent();
};
