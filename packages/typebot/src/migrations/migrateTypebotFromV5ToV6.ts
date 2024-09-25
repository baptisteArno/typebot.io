import { migrateBlocksFromV1ToV2 } from "@typebot.io/blocks-core/migrations/migrateBlocksFromV1ToV2";
import { byId } from "@typebot.io/lib/utils";
import { EventType } from "../schemas/events/constants";
import type {
  PublicTypebotV5,
  PublicTypebotV6,
} from "../schemas/publicTypebot";
import type { TypebotV5, TypebotV6 } from "../schemas/typebot";

export const migrateTypebotFromV5ToV6 = async (
  typebot: TypebotV5 | PublicTypebotV5,
): Promise<TypebotV6 | PublicTypebotV6> => {
  const startGroup = typebot.groups.find((group) =>
    group.blocks.some((b) => b.type === "start"),
  );

  if (!startGroup) throw new Error("Start group not found");

  const startBlock = startGroup?.blocks.find((b) => b.type === "start");

  if (!startBlock) throw new Error("Start block not found");

  const startOutgoingEdge = typebot.edges.find(byId(startBlock.outgoingEdgeId));

  return {
    ...typebot,
    groups: migrateGroups(
      typebot.groups.filter((g) => g.blocks.some((b) => b.type !== "start")),
    ),
    version: "6",
    events: [
      {
        id: startGroup.id,
        type: EventType.START,
        graphCoordinates: startGroup.graphCoordinates,
        outgoingEdgeId: startBlock.outgoingEdgeId,
      },
    ],
    edges: startOutgoingEdge
      ? [
          {
            ...startOutgoingEdge,
            from: {
              eventId: startGroup.id,
            },
          },
          ...typebot.edges.filter((e) => e.id !== startOutgoingEdge.id),
        ]
      : typebot.edges,
  };
};

const migrateGroups = (groups: TypebotV5["groups"]): TypebotV6["groups"] =>
  groups.map((group) => ({
    ...group,
    blocks: migrateBlocksFromV1ToV2(group.blocks),
  }));
