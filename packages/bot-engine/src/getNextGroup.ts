import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { Group } from "@typebot.io/groups/schemas";
import { byId, isDefined, isNotDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { VariableWithValue } from "@typebot.io/variables/schemas";
import { upsertResult } from "./queries/upsertResult";

export type NextGroup = {
  group?: Group;
  newSessionState: SessionState;
  visitedEdge?: Prisma.VisitedEdge;
};

export const getNextGroup = async ({
  state,
  edgeId,
  isOffDefaultPath,
}: {
  state: SessionState;
  edgeId?: string;
  isOffDefaultPath: boolean;
}): Promise<NextGroup> => {
  const nextEdge = state.typebotsQueue[0].typebot.edges.find(byId(edgeId));
  if (!nextEdge) {
    const nextEdgeResponse = popQueuedEdge(state);
    let newSessionState = nextEdgeResponse.state;
    if (newSessionState.typebotsQueue.length > 1) {
      const isMergingWithParent =
        newSessionState.typebotsQueue[0].isMergingWithParent;
      const currentResultId = newSessionState.typebotsQueue[0].resultId;
      if (!isMergingWithParent && currentResultId)
        await upsertResult({
          resultId: currentResultId,
          typebot: newSessionState.typebotsQueue[0].typebot,
          isCompleted: true,
          hasStarted: newSessionState.typebotsQueue[0].answers.length > 0,
        });
      newSessionState = {
        ...newSessionState,
        typebotsQueue: [
          {
            ...newSessionState.typebotsQueue[1],
            typebot: isMergingWithParent
              ? {
                  ...newSessionState.typebotsQueue[1].typebot,
                  variables: newSessionState.typebotsQueue[1].typebot.variables
                    .map((variable) => ({
                      ...variable,
                      value:
                        newSessionState.typebotsQueue[0].typebot.variables.find(
                          (v) => v.name === variable.name,
                        )?.value ?? variable.value,
                    }))
                    .concat(
                      newSessionState.typebotsQueue[0].typebot.variables.filter(
                        (variable) =>
                          isDefined(variable.value) &&
                          isNotDefined(
                            newSessionState.typebotsQueue[1].typebot.variables.find(
                              (v) => v.name === variable.name,
                            ),
                          ),
                      ) as VariableWithValue[],
                    ),
                }
              : newSessionState.typebotsQueue[1].typebot,
            answers: isMergingWithParent
              ? [
                  ...newSessionState.typebotsQueue[1].answers.filter(
                    (incomingAnswer) =>
                      !newSessionState.typebotsQueue[0].answers.find(
                        (currentAnswer) =>
                          currentAnswer.key === incomingAnswer.key,
                      ),
                  ),
                  ...newSessionState.typebotsQueue[0].answers,
                ]
              : newSessionState.typebotsQueue[1].answers,
          },
          ...newSessionState.typebotsQueue.slice(2),
        ],
      } satisfies SessionState;
      if (newSessionState.progressMetadata)
        newSessionState.progressMetadata = {
          ...newSessionState.progressMetadata,
          totalAnswers:
            newSessionState.progressMetadata.totalAnswers +
            newSessionState.typebotsQueue[0].answers.length,
        };
    }
    if (nextEdgeResponse.edgeId)
      return getNextGroup({
        state: newSessionState,
        edgeId: nextEdgeResponse.edgeId,
        isOffDefaultPath,
      });
    return {
      newSessionState,
    };
  }
  const nextGroup = state.typebotsQueue[0].typebot.groups.find(
    byId(nextEdge.to.groupId),
  );
  if (!nextGroup)
    return {
      newSessionState: state,
    };
  const startBlockIndex = nextEdge.to.blockId
    ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
    : 0;
  const currentVisitedEdgeIndex = isOffDefaultPath
    ? (state.currentVisitedEdgeIndex ?? -1) + 1
    : state.currentVisitedEdgeIndex;
  const resultId = state.typebotsQueue[0].resultId;
  return {
    group: {
      ...nextGroup,
      blocks: nextGroup.blocks.slice(startBlockIndex),
    } as Group,
    newSessionState: {
      ...state,
      currentVisitedEdgeIndex,
      previewMetadata:
        resultId || !isOffDefaultPath
          ? state.previewMetadata
          : {
              ...state.previewMetadata,
              visitedEdges: (state.previewMetadata?.visitedEdges ?? []).concat(
                nextEdge.id,
              ),
            },
    },
    visitedEdge:
      resultId && isOffDefaultPath && !nextEdge.id.startsWith("virtual-")
        ? {
            index: currentVisitedEdgeIndex as number,
            edgeId: nextEdge.id,
            resultId,
          }
        : undefined,
  };
};

export async function getNextBlockById(
  state: SessionState,
  blockId: string,
  groups: Group[],
): Promise<{
  block: Block;
  group: Group;
  blockIndex: number;
  groupIndex: number;
} | null> {
  const { block, blockIndex, groupIndex } = getBlockById(blockId, groups);

  // If the block is the last block in the group, get the first block in the next group
  if (blockIndex === groups[groupIndex]!.blocks.length - 1) {
    const nextGroup = await getNextGroup({
      state,
      edgeId: block.outgoingEdgeId,
      isOffDefaultPath: false,
    });
    if (!nextGroup.group) {
      return null;
    }

    const firstBlock = nextGroup.group.blocks[0];
    if (!firstBlock) return null;

    return {
      block: firstBlock,
      group: nextGroup.group,
      blockIndex: 0,
      groupIndex: groups.findIndex(byId(nextGroup.group.id)),
    };
  }

  const nextBlockIndex = blockIndex + 1;
  const nextBlock = groups[groupIndex]!.blocks[nextBlockIndex];
  return {
    block: nextBlock,
    group: groups[groupIndex]!,
    blockIndex: nextBlockIndex,
    groupIndex,
  };
}

const popQueuedEdge = (
  state: SessionState,
): { edgeId?: string; state: SessionState } => {
  const edgeId = state.typebotsQueue[0].queuedEdgeIds?.[0];
  if (!edgeId) return { state };
  return {
    edgeId,
    state: {
      ...state,
      typebotsQueue: [
        {
          ...state.typebotsQueue[0],
          queuedEdgeIds: state.typebotsQueue[0].queuedEdgeIds?.slice(1),
        },
        ...state.typebotsQueue.slice(1),
      ],
    },
  };
};
