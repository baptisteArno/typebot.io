import type { BlockV5, BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { createId } from "@typebot.io/lib/createId";
import { isDefined } from "@typebot.io/lib/utils";
import { EventType } from "@typebot.io/typebot/schemas/events/constants";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot, TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { proWorkspaceId } from "./databaseSetup";

export const parseTestTypebot = (partialTypebot: Partial<Typebot>): Typebot => {
  const version = partialTypebot.version ?? ("3" as any);

  return {
    id: createId(),
    version,
    workspaceId: proWorkspaceId,
    folderId: null,
    name: "My typebot",
    theme: {},
    settings: {},
    publicId: null,
    updatedAt: new Date(),
    createdAt: new Date(),
    customDomain: null,
    icon: null,
    selectedThemeTemplateId: null,
    isArchived: false,
    isClosed: false,
    resultsTablePreferences: null,
    whatsAppCredentialsId: null,
    riskLevel: null,
    events:
      version === "6"
        ? [
            {
              id: "group1",
              type: EventType.START,
              graphCoordinates: { x: 0, y: 0 },
              outgoingEdgeId: "edge1",
            },
          ]
        : null,
    variables: [{ id: "var1", name: "var1" }],
    ...partialTypebot,
    edges: [
      {
        id: "edge1",
        from: { blockId: "block0" },
        to: { groupId: "group1" },
      },
    ],
    groups: (version === "6"
      ? (partialTypebot.groups ?? [])
      : [
          {
            id: "group0",
            title: "Group #0",
            blocks: [
              {
                id: "block0",
                type: "start",
                label: "Start",
                outgoingEdgeId: "edge1",
              },
            ],
            graphCoordinates: { x: 0, y: 0 },
          },
          ...(partialTypebot.groups ?? []),
        ]) as any[],
  };
};

export const parseTypebotToPublicTypebot = (
  id: string,
  typebot: Typebot,
): Omit<PublicTypebot, "createdAt" | "updatedAt"> => ({
  id,
  version: typebot.version,
  groups: typebot.groups,
  typebotId: typebot.id,
  theme: typebot.theme,
  settings: typebot.settings,
  variables: typebot.variables,
  edges: typebot.edges,
  events: typebot.events,
});

type Options = {
  withGoButton?: boolean;
};

export const parseDefaultGroupWithBlock = (
  block: Partial<BlockV6>,
  options?: Options,
): Pick<TypebotV6, "groups"> => ({
  groups: [
    {
      graphCoordinates: { x: 200, y: 200 },
      id: "group1",
      blocks: [
        options?.withGoButton
          ? {
              id: "block1",
              groupId: "group1",
              type: InputBlockType.CHOICE,
              items: [
                {
                  id: "item1",
                  blockId: "block1",
                  content: "Go",
                },
              ],
              options: {},
            }
          : undefined,
        {
          id: "block2",
          ...block,
        } as BlockV5,
      ].filter(isDefined) as BlockV6[],
      title: "Group #1",
    },
  ],
});
