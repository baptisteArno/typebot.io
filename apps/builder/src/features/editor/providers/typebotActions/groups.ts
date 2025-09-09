import { createId } from "@paralleldrive/cuid2";
import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";
import { type Draft, produce } from "immer";
import type { Coordinates, CoordinatesMap } from "@/features/graph/types";
import type { SetTypebot } from "../TypebotProvider";
import {
  createBlockDraft,
  deleteGroupDraft,
  duplicateBlockDraft,
} from "./blocks";

export type GroupsActions = {
  createGroup: (
    props: Coordinates & {
      id: string;
      block: BlockV6 | BlockV6["type"];
      indices: BlockIndices;
    },
  ) => string | void;
  updateGroup: (
    groupIndex: number,
    updates: Partial<Omit<GroupV6, "id">>,
  ) => void;
  pasteGroups: (
    clipboard: {
      groups: GroupV6[];
      edges: Edge[];
      variables: Omit<Variable, "value">[];
    },
    params: {
      newCoordinates: {
        mousePosition: Coordinates;
        farLeftElement: {
          id: string;
        } & Coordinates;
      };
    },
  ) => { newGroups: GroupV6[]; oldToNewIdsMapping: Map<string, string> };
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => void;
  deleteGroup: (groupIndex: number) => void;
  deleteGroups: (groupIds: string[]) => void;
};

const groupsActions = (setTypebot: SetTypebot): GroupsActions => ({
  createGroup: ({
    id,
    block,
    indices,
    groupLabel,
    ...graphCoordinates
  }: Coordinates & {
    id: string;
    groupLabel?: string;
    block: BlockV6 | BlockV6["type"];
    indices: BlockIndices;
  }) => {
    let newBlockId;
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newGroup: GroupV6 = {
          id,
          graphCoordinates,
          title: `${groupLabel ?? "Group"} #${typebot.groups.length + 1}`,
          blocks: [],
        };
        typebot.groups.push(newGroup);
        newBlockId = createBlockDraft(typebot, block, indices);
      }),
    );
    return newBlockId;
  },
  updateGroup: (groupIndex: number, updates: Partial<Omit<GroupV6, "id">>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex];
        typebot.groups[groupIndex] = { ...block, ...updates };
      }),
    ),
  updateGroupsCoordinates: (newCoord: CoordinatesMap) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.groups.forEach((group) => {
          if (newCoord[group.id]) {
            group.graphCoordinates = newCoord[group.id];
          }
        });
      }),
    );
  },
  deleteGroup: (groupIndex: number) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteGroupDraft(typebot)(groupIndex);
      }),
    ),
  deleteGroups: (groupIds: string[]) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        groupIds.forEach((groupId) => {
          deleteGroupByIdDraft(typebot)(groupId);
        });
      }),
    ),
  pasteGroups: (clipboard, { newCoordinates }) => {
    const oldToNewIdsMapping = new Map<string, string>();
    const newEdgesWithOldIds: Edge[] = [];
    let newGroups: GroupV6[] = [];

    setTypebot((typebot) => {
      const variablesToCreate = clipboard.variables
        .map((variable) => {
          const existingVariable = typebot.variables.find(
            (v) => v.name === variable.name || v.id === variable.id,
          );
          if (existingVariable) {
            oldToNewIdsMapping.set(variable.id, existingVariable.id);
            return;
          }
          const newVariableId = createId();
          oldToNewIdsMapping.set(variable.id, newVariableId);
          return {
            ...variable,
            id: newVariableId,
          };
        })
        .filter(isDefined);

      newGroups = clipboard.groups.map((group) => {
        const newGroupId = createId();
        oldToNewIdsMapping.set(group.id, newGroupId);

        const newBlocks = group.blocks.map((block) => {
          const { newBlock, newEdges } = duplicateBlockDraft(block, {
            edges: clipboard.edges,
          });
          oldToNewIdsMapping.set(block.id, newBlock.id);

          if (newEdges) newEdgesWithOldIds.push(...newEdges);
          return replaceOldIdReferences(newBlock, oldToNewIdsMapping);
        });

        return {
          ...group,
          id: newGroupId,
          graphCoordinates:
            group.id === newCoordinates.farLeftElement.id
              ? newCoordinates.mousePosition
              : {
                  x:
                    newCoordinates.mousePosition.x +
                    group.graphCoordinates.x -
                    newCoordinates.farLeftElement.x,
                  y:
                    newCoordinates.mousePosition.y +
                    group.graphCoordinates.y -
                    newCoordinates.farLeftElement.y,
                },
          blocks: newBlocks,
        };
      });
      const edgesToCreate = newEdgesWithOldIds
        .map((edge) => {
          if ("eventId" in edge.from) return;
          const toGroupId = oldToNewIdsMapping.get(edge.to.groupId);
          if (!toGroupId) return;
          return {
            ...edge,
            to: {
              groupId: toGroupId,
              blockId: edge.to.blockId
                ? oldToNewIdsMapping.get(edge.to.blockId)
                : undefined,
            },
          } satisfies Edge;
        })
        .filter(isDefined);

      return produce(typebot, (typebot) => {
        typebot.groups.push(...newGroups);
        typebot.edges.push(...edgesToCreate);
        typebot.variables.unshift(...variablesToCreate);
      });
    });
    return { newGroups, oldToNewIdsMapping };
  },
});

const replaceOldIdReferences = <T>(obj: T, mapping: Map<string, string>): T => {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      replaceOldIdReferences(item, mapping),
    ) as unknown as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const newObj: any = { ...obj };

    Object.keys(newObj).forEach((key) => {
      const value = newObj[key];

      if (
        (key.toLowerCase().endsWith("variableid") ||
          key === "blockId" ||
          key === "groupId") &&
        typeof value === "string"
      ) {
        const newId = mapping.get(value);
        if (newId) {
          newObj[key] = newId;
        }
      } else {
        newObj[key] = replaceOldIdReferences(value, mapping);
      }
    });

    return newObj;
  }

  return obj;
};

const deleteGroupByIdDraft =
  (typebot: Draft<TypebotV6>) => (groupId: string) => {
    const groupIndex = typebot.groups.findIndex(byId(groupId));
    if (groupIndex === -1) return;
    deleteGroupDraft(typebot)(groupIndex);
  };

export { groupsActions };
