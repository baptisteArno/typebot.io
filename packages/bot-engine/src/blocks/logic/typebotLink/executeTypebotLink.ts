import { createId } from "@paralleldrive/cuid2";
import { defaultTypebotLinkOptions } from "@typebot.io/blocks-logic/typebotLink/constants";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import {
  type SessionState,
  type TypebotInSession,
  typebotInSessionStateSchema,
} from "@typebot.io/chat-session/schemas";
import { byId, isNotDefined } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import prisma from "@typebot.io/prisma";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { settingsSchema } from "@typebot.io/settings/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { Variable } from "@typebot.io/variables/schemas";
import { addPortalEdge } from "../../../addPortalEdge";
import { isTypebotInSessionAtLeastV6 } from "../../../helpers/isTypebotInSessionAtLeastV6";
import { createResultIfNotExist } from "../../../queries/createResultIfNotExist";
import type { ExecuteLogicResponse } from "../../../types";

export const executeTypebotLink = async (
  state: SessionState,
  block: TypebotLinkBlock,
): Promise<ExecuteLogicResponse> => {
  const logs: LogInSession[] = [];
  const typebotId = block.options?.typebotId;
  if (!typebotId) {
    logs.push({
      status: "error",
      description: `Failed to link typebot`,
      details: `Typebot ID is not specified`,
    });
    return { outgoingEdgeId: block.outgoingEdgeId, logs };
  }
  const isLinkingSameTypebot =
    typebotId === "current" || typebotId === state.typebotsQueue[0].typebot.id;
  let newSessionState = state;
  let nextGroupId: string | undefined;
  if (isLinkingSameTypebot) {
    newSessionState = await addSameTypebotToState({ state, block });
    nextGroupId = block.options?.groupId;
  } else {
    const linkedTypebot = await fetchTypebot(state, typebotId);
    if (!linkedTypebot) {
      logs.push({
        status: "error",
        description: `Failed to link typebot`,
        details: `Typebot with ID ${block.options?.typebotId} not found`,
      });
      return { outgoingEdgeId: block.outgoingEdgeId, logs };
    }
    newSessionState = await addLinkedTypebotToState(
      state,
      block,
      linkedTypebot,
    );
    nextGroupId = getNextGroupId(block.options?.groupId, linkedTypebot);
  }

  if (!nextGroupId) {
    logs.push({
      status: "error",
      description: `Failed to link typebot`,
      details: `Group with ID "${block.options?.groupId}" not found`,
    });
    return { outgoingEdgeId: block.outgoingEdgeId, logs };
  }

  newSessionState = addPortalEdge(`virtual-${block.id}`, newSessionState, {
    to: { groupId: nextGroupId },
  });

  return {
    outgoingEdgeId: `virtual-${block.id}`,
    newSessionState,
  };
};

const addSameTypebotToState = async ({
  state,
  block,
}: {
  state: SessionState;
  block: TypebotLinkBlock;
}) => {
  let newSessionState = state;
  const newEdgeId = `virtual-${block.id}-after`;
  const newEdge = createResumeEdgeIfNecessary(state, block);
  if (newEdge) {
    newSessionState = addPortalEdge(newEdgeId, state, {
      to: newEdge.to,
    });
  }

  const edgeIdToQueue = block.outgoingEdgeId ?? newEdgeId;
  return {
    ...newSessionState,
    typebotsQueue: [
      {
        typebot: {
          ...newSessionState.typebotsQueue[0].typebot,
        },
        resultId: newSessionState.typebotsQueue[0].resultId,
        queuedEdgeIds: edgeIdToQueue ? [edgeIdToQueue] : undefined,
        answers: newSessionState.typebotsQueue[0].answers,
        isMergingWithParent: true,
      },
      newSessionState.typebotsQueue[0],
      ...newSessionState.typebotsQueue.slice(1),
    ],
  };
};

const addLinkedTypebotToState = async (
  state: SessionState,
  block: TypebotLinkBlock,
  linkedTypebot: TypebotInSession,
): Promise<SessionState> => {
  let newSessionState = state;
  const newEdgeId = `virtual-${block.id}-after`;
  const newEdge = createResumeEdgeIfNecessary(state, block);
  if (newEdge) {
    newSessionState = addPortalEdge(newEdgeId, state, {
      to: newEdge.to,
    });
  }

  const shouldMergeResults = isTypebotVersionAtLeastV6(
    newSessionState.typebotsQueue[0].typebot.version,
  )
    ? (block.options?.mergeResults ?? defaultTypebotLinkOptions.mergeResults)
    : block.options?.mergeResults !== false;

  if (
    newSessionState.typebotsQueue[0].resultId &&
    newSessionState.typebotsQueue[0].answers.length === 0
  ) {
    await createResultIfNotExist({
      resultId: newSessionState.typebotsQueue[0].resultId,
      typebot: newSessionState.typebotsQueue[0].typebot,
      hasStarted: false,
      isCompleted: false,
    });
  }

  const isPreview = isNotDefined(newSessionState.typebotsQueue[0].resultId);
  const edgeIdToQueue = block.outgoingEdgeId ?? newEdgeId;
  return {
    ...state,
    typebotsQueue: [
      {
        typebot: {
          ...linkedTypebot,
          variables: fillVariablesWithExistingValues(
            linkedTypebot.variables,
            newSessionState.typebotsQueue,
          ),
        },
        resultId: isPreview
          ? undefined
          : shouldMergeResults
            ? newSessionState.typebotsQueue[0].resultId
            : createId(),
        queuedEdgeIds: edgeIdToQueue ? [edgeIdToQueue] : undefined,
        answers: shouldMergeResults
          ? newSessionState.typebotsQueue[0].answers
          : [],
        isMergingWithParent: shouldMergeResults,
      },
      newSessionState.typebotsQueue[0],
      ...newSessionState.typebotsQueue.slice(1),
    ],
  };
};

const createResumeEdgeIfNecessary = (
  state: SessionState,
  block: TypebotLinkBlock,
): Edge | undefined => {
  const currentTypebotInQueue = state.typebotsQueue[0];
  const blockId = block.id;
  if (block.outgoingEdgeId) return;
  const currentGroup = currentTypebotInQueue.typebot.groups.find((group) =>
    group.blocks.some((block) => block.id === blockId),
  );
  if (!currentGroup) return;
  const currentBlockIndex = currentGroup.blocks.findIndex(
    (block) => block.id === blockId,
  );
  const nextBlockInGroup =
    currentBlockIndex === -1
      ? undefined
      : currentGroup.blocks[currentBlockIndex + 1];
  if (!nextBlockInGroup) return;
  return {
    id: createId(),
    from: {
      blockId: "",
    },
    to: {
      groupId: currentGroup.id,
      blockId: nextBlockInGroup.id,
    },
  };
};

const fillVariablesWithExistingValues = (
  emptyVariables: Variable[],
  typebotsQueue: SessionState["typebotsQueue"],
): Variable[] =>
  emptyVariables.map((emptyVariable) => {
    let matchedVariable;
    for (const typebotInQueue of typebotsQueue) {
      matchedVariable = typebotInQueue.typebot.variables.find(
        (v) => v.name === emptyVariable.name,
      );
      if (matchedVariable) break;
    }
    return {
      ...emptyVariable,
      value: matchedVariable?.value,
    };
  });

const fetchTypebot = async (state: SessionState, typebotId: string) => {
  const { resultId } = state.typebotsQueue[0];
  const isPreview = !resultId;
  if (isPreview) {
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId, workspaceId: state.workspaceId },
      select: {
        version: true,
        id: true,
        edges: true,
        groups: true,
        variables: true,
        events: true,
        settings: true,
      },
    });
    if (!typebot) return null;
    return typebotInSessionStateSchema.parse({
      ...typebot,
      systemMessages: settingsSchema.parse(typebot.settings).general
        ?.systemMessages,
    });
  }
  const typebot = await prisma.publicTypebot.findUnique({
    where: {
      typebotId,
      typebot: { workspaceId: state.workspaceId },
    },
    select: {
      version: true,
      id: true,
      edges: true,
      groups: true,
      variables: true,
      events: true,
      settings: true,
    },
  });
  if (!typebot) return null;
  return typebotInSessionStateSchema.parse({
    ...typebot,
    id: typebotId,
    systemMessages: settingsSchema.parse(typebot.settings).general
      ?.systemMessages,
  });
};

const getNextGroupId = (
  groupId: string | undefined,
  typebot: TypebotInSession,
) => {
  if (groupId) return groupId;
  if (isTypebotInSessionAtLeastV6(typebot)) {
    const startEdge = typebot.edges.find(
      byId(typebot.events[0].outgoingEdgeId),
    );
    return startEdge?.to.groupId;
  }
  return typebot.groups.find((group) =>
    group.blocks.some((block) => block.type === "start"),
  )?.id;
};
