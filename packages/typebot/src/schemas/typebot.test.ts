import { describe, expect, it } from "bun:test";
import { blockSchemaV6 } from "@typebot.io/blocks-core/schemas/schema";
import { publicTypebotSchema } from "./publicTypebot";
import { typebotSchema } from "./typebot";

const legacyBlocks = [
  { id: "condition", type: "Condition", items: [] },
  {
    id: "set-variable",
    type: "Set variable",
    options: { variableId: "variable", expressionToEvaluate: "42" },
  },
  { id: "openai", type: "OpenAI", options: {} },
  { id: "google-sheets", type: "Google Sheets", options: {} },
  { id: "pixel", type: "Pixel", options: {} },
];

describe("stored typebot compatibility", () => {
  for (const version of ["3", "4", "5", "6", "6.1"]) {
    it(`loads draft and published v${version} bots with omitted undefined fields`, () => {
      const blocks =
        Number(version) >= 6
          ? [
              ...legacyBlocks,
              { id: "forged-with-base-options", type: "openai", options: {} },
              {
                id: "forged-without-base-options",
                type: "qr-code",
                options: {},
              },
            ]
          : legacyBlocks;
      const storedTypebot = {
        id: "typebot",
        typebotId: "draft-typebot",
        version,
        name: "Existing bot",
        workspaceId: "workspace",
        groups: [
          {
            id: "group",
            title: "Existing blocks",
            graphCoordinates: { x: 0, y: 0 },
            blocks: JSON.parse(JSON.stringify(blocks)),
          },
        ],
        events:
          Number(version) >= 6
            ? [{ id: "start", type: "start", graphCoordinates: { x: 0, y: 0 } }]
            : null,
        edges: [],
        variables: [],
        theme: {},
        settings: {},
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        selectedThemeTemplateId: null,
        icon: null,
        folderId: null,
        publicId: null,
        customDomain: null,
        resultsTablePreferences: null,
        isArchived: false,
        isClosed: false,
        whatsAppCredentialsId: null,
        riskLevel: null,
        spaceId: null,
      };

      expect(typebotSchema.parse(storedTypebot).groups).toEqual(
        storedTypebot.groups,
      );
      expect(publicTypebotSchema.parse(storedTypebot).groups).toEqual(
        storedTypebot.groups,
      );
    });
  }

  it.each([
    { id: "condition", type: "Condition", items: [], options: {} },
    { id: "set-variable", type: "Set variable", options: { type: "Unknown" } },
    { id: "openai", type: "OpenAI", options: { task: null } },
    { id: "google-sheets", type: "Google Sheets", options: { action: null } },
    { id: "pixel", type: "Pixel", options: { eventType: null } },
    { id: "forged", type: "openai", options: { action: "Unknown" } },
  ])("still rejects invalid block values: %j", (block) => {
    expect(blockSchemaV6.safeParse(block).success).toBe(false);
  });
});
