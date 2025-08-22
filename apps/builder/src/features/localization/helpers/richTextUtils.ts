import type { TElement } from "@udecode/plate-common";

/**
 * Check if the content has rich text formatting (more than just plain text)
 */
export const hasRichTextFormatting = (richText: TElement[]): boolean => {
  if (!richText || richText.length === 0) return false;

  // Check if there's any formatting beyond plain paragraphs with text
  return richText.some((element: any) => {
    // Check for non-paragraph elements
    if (element.type && element.type !== "p") return true;

    // Check for formatted text within paragraphs
    if (element.children) {
      return element.children.some((child: any) => {
        // Check for text nodes with formatting
        if (child.text !== undefined) {
          return child.bold || child.italic || child.underline;
        }
        // Check for non-text nodes (like links)
        return child.type !== undefined;
      });
    }

    return false;
  });
};

/**
 * Convert rich text to plain text
 */
export const richTextToPlainText = (richText: TElement[]): string => {
  // Debug what we're receiving
  if (typeof richText === "string") {
    console.error(
      "❌ CRITICAL: richTextToPlainText received string instead of array:",
      richText,
    );
    return richText; // Return the string as-is to prevent further issues
  }

  if (!richText || !Array.isArray(richText) || richText.length === 0) return "";

  const extractText = (element: any): string => {
    if (typeof element === "string") return element;
    if (element.text !== undefined) return element.text;
    if (element.children) {
      return element.children.map(extractText).join("");
    }
    return "";
  };

  return richText.map(extractText).join("\n").trim();
};

/**
 * Convert plain text to rich text format
 */
export const plainTextToRichText = (text: string): TElement[] => {
  if (!text || text.trim() === "") {
    return [{ type: "p", children: [{ text: "" }] }];
  }

  // Split by newlines and create paragraph elements
  const lines = text.split("\n");
  return lines.map((line) => ({
    type: "p",
    children: [{ text: line }],
  }));
};

/**
 * Translate rich text content while preserving structure
 * This function translates only the text content within rich text elements
 * while maintaining all formatting (bold, italic, links, etc.)
 */
export const translateRichTextContent = (
  richText: TElement[],
  translatedText: string,
): TElement[] => {
  console.log(`🔄 translateRichTextContent called:`, {
    richText,
    richTextType: typeof richText,
    richTextIsArray: Array.isArray(richText),
    translatedText,
    translatedTextType: typeof translatedText,
  });

  if (!richText || richText.length === 0) {
    const result = plainTextToRichText(translatedText);
    console.log(`📝 translateRichTextContent returning (empty input):`, {
      result,
      resultType: typeof result,
      resultIsArray: Array.isArray(result),
    });
    return result;
  }

  // For simple cases where we have basic rich text structure,
  // we can replace the text content while preserving structure
  const originalText = richTextToPlainText(richText);

  // If original and translated text are roughly the same structure (same line count),
  // try to preserve formatting
  const originalLines = originalText.split("\n");
  const translatedLines = translatedText.split("\n");

  if (
    originalLines.length === translatedLines.length &&
    richText.length === originalLines.length
  ) {
    // Create new rich text with same structure but translated content
    const structurePreservedResult = richText.map(
      (element: any, index: number) => {
        if (element.type === "p" && element.children) {
          // For paragraph elements, replace text content while preserving formatting
          const newChildren = element.children.map((child: any) => {
            if (child.text !== undefined) {
              // This is a text node - replace with translated text
              return {
                ...child,
                text: translatedLines[index] || child.text,
              };
            }
            return child; // Keep non-text nodes (like links) as-is
          });

          return {
            ...element,
            children: newChildren,
          };
        }
        return element; // Keep non-paragraph elements as-is
      },
    );

    console.log(
      `📝 translateRichTextContent returning (structure preserved):`,
      {
        structurePreservedResult,
        structurePreservedResultType: typeof structurePreservedResult,
        structurePreservedResultIsArray: Array.isArray(
          structurePreservedResult,
        ),
      },
    );
    return structurePreservedResult;
  }

  // Fallback: if structure doesn't match, convert to plain rich text
  const fallbackResult = plainTextToRichText(translatedText);
  console.log(`📝 translateRichTextContent returning (fallback):`, {
    fallbackResult,
    fallbackResultType: typeof fallbackResult,
    fallbackResultIsArray: Array.isArray(fallbackResult),
  });
  return fallbackResult;
};

/**
 * Check if content should use rich text editor
 * Returns true if the content has rich text formatting or is explicitly rich text
 */
export const shouldUseRichTextEditor = (content: any): boolean => {
  // If it has richText property and it's formatted, use rich text editor
  if (content.richText && hasRichTextFormatting(content.richText)) {
    return true;
  }

  // If it has richText property but no formatting, and no plainText, use rich text editor
  if (content.richText && !content.plainText && !content.html) {
    return true;
  }

  // If it only has plainText or html, use textarea
  return false;
};

/**
 * Get the appropriate content for editing based on the content structure
 */
export const getEditableContent = (
  content: any,
): {
  isRichText: boolean;
  text: string;
  richText: TElement[];
} => {
  const useRichText = shouldUseRichTextEditor(content);

  if (useRichText && content.richText) {
    // Debug what type of richText we're getting
    console.log(`🔍 DEBUGGING: getEditableContent richText:`, {
      contentRichText: content.richText,
      richTextType: typeof content.richText,
      richTextIsArray: Array.isArray(content.richText),
    });

    // Handle case where richText is stored as a JSON string
    let richTextArray: TElement[];
    if (typeof content.richText === "string") {
      console.warn(
        `⚠️ PROBLEM: richText is stored as string, parsing:`,
        content.richText,
      );
      try {
        richTextArray = JSON.parse(content.richText);
      } catch (err) {
        console.error(`❌ JSON parse failed, creating from plain text:`, err);
        richTextArray = plainTextToRichText(content.richText);
      }
    } else if (Array.isArray(content.richText)) {
      richTextArray = content.richText;
    } else {
      console.warn(
        `⚠️ PROBLEM: unexpected richText type, creating empty:`,
        content.richText,
      );
      richTextArray = [];
    }

    return {
      isRichText: true,
      text: richTextToPlainText(richTextArray),
      richText: richTextArray,
    };
  }

  // Fallback to plain text
  const text = content.plainText || content.html || "";
  return {
    isRichText: false,
    text,
    richText: plainTextToRichText(text),
  };
};
