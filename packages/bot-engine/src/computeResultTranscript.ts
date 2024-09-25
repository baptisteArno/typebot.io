import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import { isBubbleBlock, isInputBlock } from "@typebot.io/blocks-core/helpers";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { Group } from "@typebot.io/groups/schemas";
import { createId } from "@typebot.io/lib/createId";
import type { Answer } from "@typebot.io/results/schemas/answers";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import {
  type BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from "./parseBubbleBlock";
import type { ContinueChatResponse } from "./schemas/api";
import type { TypebotInSession } from "./schemas/chatSession";

type TranscriptMessage = {
  role: "bot" | "user";
} & (
  | { type: "text"; text: string }
  | { type: "image"; image: string }
  | { type: "video"; video: string }
  | { type: "audio"; audio: string }
);

export const parseTranscriptMessageText = (
  message: TranscriptMessage,
): string => {
  switch (message.type) {
    case "text":
      return message.text;
    case "image":
      return message.image;
    case "video":
      return message.video;
    case "audio":
      return message.audio;
  }
};

export const computeResultTranscript = ({
  typebot,
  answers,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  typebot: TypebotInSession;
  answers: Pick<Answer, "blockId" | "content" | "attachedFileUrls">[];
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    "blockId" | "variableId" | "value"
  >[];
  visitedEdges: string[];
  stopAtBlockId?: string;
}): TranscriptMessage[] => {
  const firstEdgeId = getFirstEdgeId(typebot);
  if (!firstEdgeId) return [];
  const firstEdge = typebot.edges.find((edge) => edge.id === firstEdgeId);
  if (!firstEdge) return [];
  const firstGroup = getNextGroup(typebot, firstEdgeId);
  if (!firstGroup) return [];
  return executeGroup({
    typebotsQueue: [{ typebot }],
    nextGroup: firstGroup,
    currentTranscript: [],
    answers: [...answers],
    setVariableHistory: [...setVariableHistory],
    visitedEdges,
    stopAtBlockId,
  });
};

const getFirstEdgeId = (typebot: TypebotInSession) => {
  if (typebot.version === "6") return typebot.events?.[0].outgoingEdgeId;
  return typebot.groups.at(0)?.blocks.at(0)?.outgoingEdgeId;
};

const getNextGroup = (
  typebot: TypebotInSession,
  edgeId: string,
): { group: Group; blockIndex?: number } | undefined => {
  const edge = typebot.edges.find((edge) => edge.id === edgeId);
  if (!edge) return;
  const group = typebot.groups.find((group) => group.id === edge.to.groupId);
  if (!group) return;
  const blockIndex = edge.to.blockId
    ? group.blocks.findIndex((block) => block.id === edge.to.blockId)
    : undefined;
  return { group, blockIndex };
};

const executeGroup = ({
  currentTranscript,
  typebotsQueue,
  answers,
  nextGroup,
  setVariableHistory,
  visitedEdges,
  stopAtBlockId,
}: {
  currentTranscript: TranscriptMessage[];
  nextGroup:
    | {
        group: Group;
        blockIndex?: number | undefined;
      }
    | undefined;
  typebotsQueue: {
    typebot: TypebotInSession;
    resumeEdgeId?: string;
  }[];
  answers: Pick<Answer, "blockId" | "content" | "attachedFileUrls">[];
  setVariableHistory: Pick<
    SetVariableHistoryItem,
    "blockId" | "variableId" | "value"
  >[];
  visitedEdges: string[];
  stopAtBlockId?: string;
}): TranscriptMessage[] => {
  if (!nextGroup) return currentTranscript;
  for (const block of nextGroup?.group.blocks.slice(
    nextGroup.blockIndex ?? 0,
  )) {
    if (
      stopAtBlockId &&
      block.id === stopAtBlockId &&
      answers.length === 0 &&
      setVariableHistory.length === 0 &&
      visitedEdges.length === 0
    )
      return currentTranscript;
    if (stopAtBlockId && block.id === stopAtBlockId) return currentTranscript;
    const typebot = typebotsQueue[0]?.typebot;
    if (!typebot) throw new Error("Typebot not found in session");
    if (setVariableHistory.at(0)?.blockId === block.id)
      typebot.variables = applySetVariable(setVariableHistory.shift(), typebot);
    let nextEdgeId = block.outgoingEdgeId;
    if (isBubbleBlock(block)) {
      if (!block.content) continue;
      const parsedBubbleBlock = parseBubbleBlock(
        block as BubbleBlockWithDefinedContent,
        {
          version: 2,
          variables: typebot.variables,
          typebotVersion: typebot.version,
          textBubbleContentFormat: "markdown",
        },
      );
      const newMessage =
        convertChatMessageToTranscriptMessage(parsedBubbleBlock);
      if (newMessage) currentTranscript.push(newMessage);
    } else if (isInputBlock(block)) {
      const answer = answers.shift();
      if (!answer) break;
      if (block.options?.variableId) {
        const replyVariable = typebot.variables.find(
          (variable) => variable.id === block.options?.variableId,
        );
        if (replyVariable) {
          typebot.variables = typebot.variables.map((v) =>
            v.id === replyVariable.id ? { ...v, value: answer.content } : v,
          );
        }
      }
      if (
        block.type === InputBlockType.TEXT &&
        block.options?.attachments?.isEnabled &&
        block.options?.attachments?.saveVariableId &&
        answer.attachedFileUrls &&
        answer.attachedFileUrls?.length > 0
      ) {
        const variable = typebot.variables.find(
          (variable) =>
            variable.id === block.options?.attachments?.saveVariableId,
        );
        if (variable) {
          typebot.variables = typebot.variables.map((v) =>
            v.id === variable.id
              ? {
                  ...v,
                  value: Array.isArray(variable.value)
                    ? variable.value.concat(answer.attachedFileUrls!)
                    : answer.attachedFileUrls!.length === 1
                      ? answer.attachedFileUrls![0]
                      : answer.attachedFileUrls,
                }
              : v,
          );
        }
      }
      currentTranscript.push({
        role: "user",
        type: "text",
        text:
          (answer.attachedFileUrls?.length ?? 0) > 0
            ? `${answer.attachedFileUrls?.join(", ")}\n\n${answer.content}`
            : answer.content,
      });
      const outgoingEdge = getOutgoingEdgeId({
        block,
        answer: answer.content,
        variables: typebot.variables,
      });
      if (outgoingEdge.isOffDefaultPath) visitedEdges.shift();
      nextEdgeId = outgoingEdge.edgeId;
    } else if (block.type === LogicBlockType.CONDITION) {
      const passedCondition = block.items.find(
        (item) =>
          item.content &&
          executeCondition({
            variables: typebot.variables,
            condition: item.content,
          }),
      );
      if (passedCondition) {
        visitedEdges.shift();
        nextEdgeId = passedCondition.outgoingEdgeId;
      }
    } else if (block.type === LogicBlockType.AB_TEST) {
      nextEdgeId = visitedEdges.shift() ?? nextEdgeId;
    } else if (block.type === LogicBlockType.JUMP) {
      if (!block.options?.groupId) continue;
      const groupToJumpTo = typebot.groups.find(
        (group) => group.id === block.options?.groupId,
      );
      const blockToJumpTo =
        groupToJumpTo?.blocks.find((b) => b.id === block.options?.blockId) ??
        groupToJumpTo?.blocks[0];

      if (!blockToJumpTo) continue;

      const portalEdge = {
        id: createId(),
        from: { blockId: "", groupId: "" },
        to: { groupId: block.options.groupId, blockId: blockToJumpTo.id },
      };
      typebot.edges.push(portalEdge);
      visitedEdges.shift();
      nextEdgeId = portalEdge.id;
    } else if (block.type === LogicBlockType.TYPEBOT_LINK) {
      const isLinkingSameTypebot =
        block.options &&
        (block.options.typebotId === "current" ||
          block.options.typebotId === typebot.id);

      const linkedGroup = typebot.groups.find(
        (g) => g.id === block.options?.groupId,
      );
      if (!isLinkingSameTypebot || !linkedGroup) continue;
      let resumeEdge: Edge | undefined;
      if (!block.outgoingEdgeId) {
        const currentBlockIndex = nextGroup.group.blocks.findIndex(
          (b) => b.id === block.id,
        );
        const nextBlockInGroup =
          currentBlockIndex === -1
            ? undefined
            : nextGroup.group.blocks.at(currentBlockIndex + 1);
        if (nextBlockInGroup)
          resumeEdge = {
            id: createId(),
            from: {
              blockId: "",
            },
            to: {
              groupId: nextGroup.group.id,
              blockId: nextBlockInGroup.id,
            },
          };
      }
      return executeGroup({
        typebotsQueue: [
          {
            typebot: typebot,
            resumeEdgeId: resumeEdge ? resumeEdge.id : block.outgoingEdgeId,
          },
          {
            typebot: resumeEdge
              ? {
                  ...typebot,
                  edges: typebot.edges.concat([resumeEdge]),
                }
              : typebot,
          },
        ],
        answers,
        setVariableHistory,
        currentTranscript,
        nextGroup: {
          group: linkedGroup,
        },
        visitedEdges,
        stopAtBlockId,
      });
    }
    if (nextEdgeId) {
      const nextGroup = getNextGroup(typebot, nextEdgeId);
      if (nextGroup) {
        return executeGroup({
          typebotsQueue,
          answers,
          setVariableHistory,
          currentTranscript,
          nextGroup,
          visitedEdges,
          stopAtBlockId,
        });
      }
    }
  }
  if (
    typebotsQueue.length > 1 &&
    typebotsQueue[0]?.resumeEdgeId &&
    typebotsQueue[1]?.typebot
  ) {
    return executeGroup({
      typebotsQueue: typebotsQueue.slice(1),
      answers,
      setVariableHistory,
      currentTranscript,
      nextGroup: getNextGroup(
        typebotsQueue[1].typebot,
        typebotsQueue[0].resumeEdgeId,
      ),
      visitedEdges: visitedEdges.slice(1),
      stopAtBlockId,
    });
  }
  return currentTranscript;
};

const applySetVariable = (
  setVariable:
    | Pick<SetVariableHistoryItem, "blockId" | "variableId" | "value">
    | undefined,
  typebot: TypebotInSession,
): Variable[] => {
  if (!setVariable) return typebot.variables;
  const variable = typebot.variables.find(
    (variable) => variable.id === setVariable.variableId,
  );
  if (!variable) return typebot.variables;
  return typebot.variables.map((v) =>
    v.id === variable.id ? { ...v, value: setVariable.value } : v,
  );
};

const convertChatMessageToTranscriptMessage = (
  chatMessage: ContinueChatResponse["messages"][number],
): TranscriptMessage | null => {
  switch (chatMessage.type) {
    case BubbleBlockType.TEXT: {
      if (chatMessage.content.type === "richText") return null;
      return {
        role: "bot",
        type: "text",
        text: chatMessage.content.markdown,
      };
    }
    case BubbleBlockType.IMAGE: {
      if (!chatMessage.content.url) return null;
      return {
        role: "bot",
        type: "image",
        image: chatMessage.content.url,
      };
    }
    case BubbleBlockType.VIDEO: {
      if (!chatMessage.content.url) return null;
      return {
        role: "bot",
        type: "video",
        video: chatMessage.content.url,
      };
    }
    case BubbleBlockType.AUDIO: {
      if (!chatMessage.content.url) return null;
      return {
        role: "bot",
        type: "audio",
        audio: chatMessage.content.url,
      };
    }
    case "custom-embed":
    case BubbleBlockType.EMBED: {
      return null;
    }
  }
};

const getOutgoingEdgeId = ({
  block,
  answer,
  variables,
}: {
  block: InputBlock;
  answer: string | undefined;
  variables: Variable[];
}): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
  if (
    block.type === InputBlockType.CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultChoiceInputOptions.isMultipleChoice
    ) &&
    answer
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(variables)(item.content).normalize() ===
        answer.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  if (
    block.type === InputBlockType.PICTURE_CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultPictureChoiceOptions.isMultipleChoice
    ) &&
    answer
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(variables)(item.title).normalize() ===
        answer.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false };
};
