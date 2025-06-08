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
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { isTypebotVersionAtLeastV6 } from "@typebot.io/schemas/helpers/isTypebotVersionAtLeastV6";
import { settingsSchema } from "@typebot.io/settings/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import { addVirtualEdge } from "../../../addPortalEdge";
import { isTypebotInSessionAtLeastV6 } from "../../../helpers/isTypebotInSessionAtLeastV6";
import { createResultIfNotExist } from "../../../queries/createResultIfNotExist";
import type { ExecuteLogicResponse } from "../../../types";

export const executeTypebotLink = async (
  block: TypebotLinkBlock,
  { sessionStore, state }: { sessionStore: SessionStore; state: SessionState },
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
    nextGroupId = getNextGroupId(block.options?.groupId, {
      nextTypebot: state.typebotsQueue[0].typebot,
      state,
      sessionStore,
    });
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
    nextGroupId = getNextGroupId(block.options?.groupId, {
      nextTypebot: linkedTypebot,
      state,
      sessionStore,
    });
  }

  if (!nextGroupId) {
    logs.push({
      status: "error",
      description: `Failed to link typebot`,
      details: `Group with ID "${block.options?.groupId}" not found`,
    });
    return { outgoingEdgeId: block.outgoingEdgeId, logs };
  }

  const virtualEdgeMetadata = addVirtualEdge(newSessionState, {
    to: { groupId: nextGroupId },
  });

  newSessionState = virtualEdgeMetadata.newSessionState;

  return {
    outgoingEdgeId: virtualEdgeMetadata.edgeId,
    newSessionState,
  };
};

const addSameTypebotToState = async ({
  state,
  block,
}: {
  state: SessionState;
  block: TypebotLinkBlock;
}): Promise<SessionState> => {
  let newSessionState = state;
  const resumeTo = getResumeEdgeToProps(state, block);
  let resumeEdgeId: string | undefined;
  if (resumeTo) {
    const virtualEdgeMetadata = addVirtualEdge(state, {
      to: resumeTo,
    });
    newSessionState = virtualEdgeMetadata.newSessionState;
    resumeEdgeId = virtualEdgeMetadata.edgeId;
  }

  const edgeIdToQueue = block.outgoingEdgeId ?? resumeEdgeId;
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
  const resumeTo = getResumeEdgeToProps(state, block);
  let resumeEdgeId: string | undefined;
  if (resumeTo) {
    const virtualEdgeMetadata = addVirtualEdge(state, {
      to: resumeTo,
    });
    newSessionState = virtualEdgeMetadata.newSessionState;
    resumeEdgeId = virtualEdgeMetadata.edgeId;
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
  const edgeIdToQueue = block.outgoingEdgeId ?? resumeEdgeId;
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

const getResumeEdgeToProps = (
  state: SessionState,
  block: TypebotLinkBlock,
): Edge["to"] | undefined => {
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
    groupId: currentGroup.id,
    blockId: nextBlockInGroup.id,
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
  groupIdOrVariable: string | undefined,
  {
    nextTypebot,
    state,
    sessionStore,
  }: {
    nextTypebot: TypebotInSession;
    state: SessionState;
    sessionStore: SessionStore;
  },
) => {
  if (isSingleVariable(groupIdOrVariable)) {
    const groupTitle = parseVariables(groupIdOrVariable, {
      variables: state.typebotsQueue[0].typebot.variables,
      sessionStore,
    });
    return nextTypebot.groups.find((group) => group.title === groupTitle)?.id;
  }
  if (groupIdOrVariable) return groupIdOrVariable;
  if (isTypebotInSessionAtLeastV6(nextTypebot)) {
    const startEdge = nextTypebot.edges.find(
      byId(nextTypebot.events[0].outgoingEdgeId),
    );
    return startEdge?.to.groupId;
  }
  return nextTypebot.groups.find((group) =>
    group.blocks.some((block) => block.type === "start"),
  )?.id;
};
