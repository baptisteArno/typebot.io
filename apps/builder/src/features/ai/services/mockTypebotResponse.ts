// Generate a mock typebot based on the actual filtered elements
import { createId } from "@typebot.io/lib/createId";

export const mockTypebot = ({
  typebotId,
  groupId,
  startEventId,
  processedElements,
}: {
  typebotId: string;
  groupId: string;
  startEventId: string;
  processedElements: any[];
}) => {
  const mockTypebot = {
    version: "6.1" as const,
    id: typebotId,
    name: "Generated Typebot",
    events: [
      {
        id: startEventId,
        type: "start",
        graphCoordinates: { x: 0, y: 0 },
        outgoingEdgeId: processedElements.length > 0 ? "edge-1" : undefined,
      },
    ],
    groups: [
      {
        id: groupId,
        title: "Main",
        graphCoordinates: { x: 200, y: 0 },
        blocks: processedElements.flatMap((element) => {
          const blockType = element.type;

          // Create base block structure
          const baseBlock = {
            id: element.blockId,
            type: blockType,
          };

          // For rating inputs, add a text block with the label first
          if (blockType === "rating input" && element.label) {
            const textBlockId = `text_${createId().substring(0, 8)}`;
            const textBlock = {
              id: textBlockId,
              type: "text",
              content: {
                richText: [
                  {
                    type: "p",
                    children: [{ text: element.label }],
                  },
                ],
              },
            };

            const ratingBlock = {
              ...baseBlock,
              options: {
                variableId: element.variableId,
              },
            };

            return [textBlock, ratingBlock];
          }

          // Add content/options based on block type
          if (blockType === "text") {
            return {
              ...baseBlock,
              content: {
                richText: [
                  {
                    type: "p",
                    children: [{ text: element.label || "Text block" }],
                  },
                ],
              },
            };
          } else if (blockType === "choice input") {
            const actualOptions =
              element.options && element.options.length > 0
                ? element.options
                : ["Option 1", "Option 2"];

            // Use the isMultiple property that was applied from clarifications
            const isMultiple = (element as any).isMultiple ?? false;

            return {
              ...baseBlock,
              items: actualOptions.map((option: any) => ({
                id: `item_${createId().substring(0, 8)}`,
                content: option,
              })),
              options: {
                variableId: element.variableId,
                isMultipleChoice: isMultiple,
              },
            };
          } else if (
            [
              "text input",
              "number input",
              "email input",
              "phone number input",
              "date input",
            ].includes(blockType)
          ) {
            return {
              ...baseBlock,
              options: {
                variableId: element.variableId,
                labels: element.placeholder
                  ? { placeholder: element.placeholder }
                  : undefined,
              },
            };
          } else {
            return baseBlock;
          }
        }),
      },
    ],
    edges:
      processedElements.length > 1
        ? [
            {
              id: "edge-1",
              from: { eventId: startEventId },
              to: { groupId: groupId },
            },
          ]
        : [],
    variables: processedElements
      .filter((element) => element.variableId)
      .map((element) => ({
        id: element.variableId!,
        name: element.variableName || element.variableId!, // Use variableName if available, fallback to variableId
      })),
    selectedThemeTemplateId: null,
    theme: {},
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    icon: null,
    folderId: null,
    publicId: null,
    customDomain: null,
    workspaceId: "default-workspace",
    resultsTablePreferences: null,
    isArchived: false,
    isClosed: false,
    whatsAppCredentialsId: null,
    riskLevel: null,
  };

  return JSON.stringify(mockTypebot);
};
