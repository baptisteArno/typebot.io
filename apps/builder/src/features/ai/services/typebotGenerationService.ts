import { mockTypebot } from "@/features/ai/services/mockTypebotResponse";
import { createId } from "@typebot.io/lib/createId";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import type { DetectedElement } from "../types"; // Helper function to generate content-aware IDs

// Helper function to generate content-aware IDs
const generateContentAwareId = (
  type: string,
  content?: string | null,
  index?: number,
): string => {
  const baseId = createId();
  const typePrefix = type.replace(/\s+/g, "").toLowerCase();
  const contentHash = content
    ? content
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 8)
    : "";
  const indexSuffix = index !== undefined ? `-${index}` : "";

  return `${typePrefix}_${contentHash}${indexSuffix}_${baseId.substring(0, 8)}`;
};

// Helper function to generate camelCase variable names from element labels
const generateCamelCaseVariableName = (
  element: DetectedElement,
  index: number,
): string => {
  let baseName = element.label || element.type;

  // Clean and convert to camelCase
  const words = baseName
    .toLowerCase()
    // Split on spaces, hyphens, underscores, and other word boundaries
    .split(/[\s\-_,.;:!?()[\]{}'"]+/)
    // Filter out empty strings and common words that add no value
    .filter(
      (word) =>
        word.length > 0 &&
        ![
          "the",
          "a",
          "an",
          "and",
          "or",
          "but",
          "in",
          "on",
          "at",
          "to",
          "for",
          "of",
          "with",
          "by",
        ].includes(word),
    )
    // Take only the first 3-4 meaningful words to keep names concise
    .slice(0, 4);

  if (words.length === 0) {
    // Fallback to element type if no meaningful words found
    baseName = element.type.replace(/\s+/g, "");
  } else {
    // Convert to camelCase: first word lowercase, subsequent words capitalized
    baseName =
      words[0] +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
  }

  // Ensure it starts with a letter (JavaScript variable naming rule)
  if (!/^[a-zA-Z]/.test(baseName)) {
    baseName = "input" + baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }

  // Add suffix if it's a generic name to make it unique
  if (baseName === "input" || baseName === "field" || baseName === "value") {
    baseName += (index + 1).toString();
  }

  return baseName;
};

// Helper function to generate variable ID based on element
const generateVariableId = (
  element: DetectedElement,
  index: number,
): string => {
  const baseId = createId();
  const cleanLabel = element.label
    ? element.label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 12)
    : element.type.replace(/\s+/g, "").toLowerCase();

  return `var_${cleanLabel}_${index}_${baseId.substring(0, 8)}`;
};

const mapElementTypeToBlockType = (elementType: string): string => {
  const typeMapping: Record<string, string> = {
    text_input: "text input",
    number_input: "number input",
    email_input: "email input",
    phone_input: "phone number input",
    date_input: "date input",
    choice: "choice input",
    rating: "rating input",
    file_upload: "file input",
    text: "text",
    button: "choice input", // buttons become choice inputs for selection
    heading: "text",
    checkbox: "choice input", // legacy mapping
    slider: "rating input", // legacy mapping
    textInput: "text input", // camelCase fallback
    numberInput: "number input", // camelCase fallback
    emailInput: "email input", // camelCase fallback
  };

  return typeMapping[elementType] || "text";
};

export const generateTypebot = async (
  elements: DetectedElement[],
  apiKey: string,
): Promise<TypebotV6> => {
  const typebotId = createId();
  const groupId = createId();
  const startEventId = createId();

  // Pre-generate consistent IDs for elements and variables
  const processedElements = elements.map((element, index) => {
    const blockType = mapElementTypeToBlockType(element.type);
    const blockId = generateContentAwareId(blockType, element.label, index);
    const hasVariable = [
      "text input",
      "number input",
      "email input",
      "phone number input",
      "date input",
      "choice input",
      "rating input",
      "file input",
    ].includes(blockType);

    const variableId = hasVariable
      ? generateVariableId(element, index)
      : undefined;
    const variableName = hasVariable
      ? generateCamelCaseVariableName(element, index)
      : undefined;

    return {
      ...element,
      type: blockType,
      blockId,
      variableId,
      variableName,
      index,
    };
  });

  const systemPrompt = `You are a Typebot generator. Create a complete TypebotV6 JSON structure based on the detected form elements.

CRITICAL: Use the EXACT IDs provided in the user prompt for ALL blocks and variables. Do not generate your own IDs.

Important requirements:
1. ALWAYS include ALL required fields with correct structure
2. version MUST be exactly "6.1" (string)
3. events MUST be an array with at least one START event
4. groups MUST have title, graphCoordinates {x, y}, and blocks array
5. blocks MUST have id and type fields at minimum
6. Use the exact block and variable IDs provided in the user prompt
7. Include proper variables, theme, settings

Required structure template:
{
  "version": "6.1",
  "id": "${typebotId}",
  "name": "Generated Typebot",
  "events": [{"id": "${startEventId}", "type": "start", "graphCoordinates": {"x": 0, "y": 0}}],
  "groups": [
    {
      "id": "${groupId}", 
      "title": "Main", 
      "graphCoordinates": {"x": 200, "y": 0}, 
      "blocks": [
        {"id": "EXACT_BLOCK_ID_FROM_USER_PROMPT", "type": "text", "content": {"plainText": "Welcome!"}}
      ]
    }
  ],
  "edges": [],
  "variables": [{"id": "EXACT_VARIABLE_ID_FROM_USER_PROMPT", "name": "Variable Name"}],
  "theme": {},
  "settings": {},
  "createdAt": "${new Date().toISOString()}",
  "updatedAt": "${new Date().toISOString()}",
  "icon": null,
  "folderId": null,
  "publicId": null,
  "customDomain": null,
  "workspaceId": "default-workspace",
  "resultsTablePreferences": null,
  "isArchived": false,
  "isClosed": false,
  "whatsAppCredentialsId": null,
  "riskLevel": null
}

Block types (use EXACT type strings):
- text: {"id": "EXACT_ID", "type": "text", "content": {"richText": [{"type": "p", "children": [{"text": "..."}]}]}}
- text input: {"id": "EXACT_ID", "type": "text input", "options": {"variableId": "EXACT_VARIABLE_ID"}}  
- number input: {"id": "EXACT_ID", "type": "number input", "options": {"variableId": "EXACT_VARIABLE_ID"}}
- email input: {"id": "EXACT_ID", "type": "email input", "options": {"variableId": "EXACT_VARIABLE_ID"}}
- phone number input: {"id": "EXACT_ID", "type": "phone number input", "options": {"variableId": "EXACT_VARIABLE_ID"}}
- date input: {"id": "EXACT_ID", "type": "date input", "options": {"variableId": "EXACT_VARIABLE_ID"}}
- choice input: {"id": "EXACT_ID", "type": "choice input", "items": [{"id": "UNIQUE_ITEM_ID", "content": "Option"}], "options": {"variableId": "EXACT_VARIABLE_ID"}}
- rating input: {"id": "EXACT_ID", "type": "rating input", "options": {"variableId": "EXACT_VARIABLE_ID"}}
- image: {"id": "EXACT_ID", "type": "image", "content": {"url": "..."}}

CRITICAL: 
- Use spaces in type names exactly as shown (e.g., "text input" not "textInput")
- For choice input: items array goes at block level, NOT inside options
- For variables: use format {"id": "exact-variable-id", "name": "exactCamelCaseName"} - use the EXACT variableName provided in the user prompt for each element (these follow JavaScript camelCase naming conventions)
- For choice input items: generate unique IDs using createId pattern (e.g., "item_${createId().substring(0, 8)}")

Return ONLY valid JSON, no markdown or explanations.`;

  const userPrompt = `Create a complete Typebot using these EXACT IDs and elements:

Typebot ID: ${typebotId}
Group ID: ${groupId}  
Start Event ID: ${startEventId}

Elements with their assigned IDs:
${JSON.stringify(processedElements, null, 2)}

Make sure to:
1. Use the EXACT blockId for each element as the block's "id" field
2. Use the EXACT variableId for input blocks in their "options.variableId" field
3. Create corresponding variables using the exact variableId and the EXACT variableName provided (these are pre-generated camelCase names following JavaScript naming conventions)
4. For choice input blocks, include an "items" array with choice options using unique generated item IDs
5. For text blocks, include "content" with "richText" array containing proper paragraph structure
6. Place all blocks in the group with ID: ${groupId}

Example choice input structure:
{
  "id": "EXACT_BLOCK_ID_FROM_LIST",
  "type": "choice input", 
  "items": [
    {"id": "item_abc123de", "content": "Option 1"},
    {"id": "item_xyz789fg", "content": "Option 2"}
  ],
  "options": {
    "variableId": "EXACT_VARIABLE_ID_FROM_LIST"
  }
}`;

  try {
    // Use mock response in development to avoid API costs
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Development mode: Using mock generation");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return JSON.parse(
        mockTypebot({
          typebotId,
          groupId,
          startEventId,
          processedElements,
        }),
      );
    }

    // Production: Use real OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    try {
      const parsedContent = JSON.parse(content);

      // Enhanced validation with ID consistency checks
      if (!parsedContent.version) {
        throw new Error("Missing required field: version");
      }
      if (!parsedContent.id) {
        throw new Error("Missing required field: id");
      }
      if (parsedContent.id !== typebotId) {
        throw new Error(
          `Typebot ID mismatch: expected ${typebotId}, got ${parsedContent.id}`,
        );
      }
      if (!parsedContent.groups || !Array.isArray(parsedContent.groups)) {
        throw new Error("Missing or invalid groups array");
      }
      if (!parsedContent.events || !Array.isArray(parsedContent.events)) {
        throw new Error("Missing or invalid events array");
      }

      // Validate groups structure with ID consistency
      for (const group of parsedContent.groups) {
        if (!group.id) {
          throw new Error("Group missing id field");
        }
        if (!group.title) {
          throw new Error("Group missing title field");
        }
        if (
          !group.graphCoordinates ||
          typeof group.graphCoordinates.x !== "number" ||
          typeof group.graphCoordinates.y !== "number"
        ) {
          throw new Error("Group missing or invalid graphCoordinates");
        }
        if (!group.blocks || !Array.isArray(group.blocks)) {
          throw new Error("Group missing or invalid blocks array");
        }

        // Validate block IDs match our generated ones
        group.blocks.forEach((block: any, index: number) => {
          if (!block.id) {
            throw new Error(`Block ${index} missing id field`);
          }
          const expectedElement = processedElements.find(
            (el) => el.blockId === block.id,
          );
          if (!expectedElement) {
            console.warn(`Block ID ${block.id} not found in expected elements`);
          }
        });
      }

      // Validate events structure with ID consistency
      for (const event of parsedContent.events) {
        if (!event.id) {
          throw new Error("Event missing id field");
        }
        if (!event.type) {
          throw new Error("Event missing type field");
        }
        if (
          !event.graphCoordinates ||
          typeof event.graphCoordinates.x !== "number" ||
          typeof event.graphCoordinates.y !== "number"
        ) {
          throw new Error("Event missing or invalid graphCoordinates");
        }
      }

      // Ensure all required fields have defaults
      const typebot = {
        ...parsedContent,
        createdAt: parsedContent.createdAt || new Date().toISOString(),
        updatedAt: parsedContent.updatedAt || new Date().toISOString(),
        icon: parsedContent.icon !== undefined ? parsedContent.icon : null,
        folderId:
          parsedContent.folderId !== undefined ? parsedContent.folderId : null,
        publicId:
          parsedContent.publicId !== undefined ? parsedContent.publicId : null,
        customDomain:
          parsedContent.customDomain !== undefined
            ? parsedContent.customDomain
            : null,
        workspaceId: parsedContent.workspaceId || "default-workspace",
        resultsTablePreferences:
          parsedContent.resultsTablePreferences !== undefined
            ? parsedContent.resultsTablePreferences
            : null,
        isArchived: parsedContent.isArchived || false,
        isClosed: parsedContent.isClosed || false,
        whatsAppCredentialsId:
          parsedContent.whatsAppCredentialsId !== undefined
            ? parsedContent.whatsAppCredentialsId
            : null,
        riskLevel:
          parsedContent.riskLevel !== undefined
            ? parsedContent.riskLevel
            : null,
        edges: parsedContent.edges || [],
        variables: parsedContent.variables || [],
        theme: parsedContent.theme || {},
        settings: parsedContent.settings || {},
      };

      return typebot as TypebotV6;
    } catch (parseError: any) {
      console.error("Failed to parse OpenAI response:", content);
      if (parseError instanceof SyntaxError) {
        throw new Error("Invalid JSON syntax in generated response");
      }
      throw new Error(`Typebot validation failed: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Typebot generation error:", error);
    throw error;
  }
};
