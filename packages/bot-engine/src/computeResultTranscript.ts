import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  blockHasItems,
  isBubbleBlock,
  isCardsInput,
  isInputBlock,
} from "@typebot.io/blocks-core/helpers";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import type { TypebotInSession } from "@typebot.io/chat-session/schemas";
import { executeCondition } from "@typebot.io/conditions/executeCondition";
import type { Group } from "@typebot.io/groups/schemas";
import { createId } from "@typebot.io/lib/createId";
import type { Answer } from "@typebot.io/results/schemas/answers";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type {
  SetVariableHistoryItem,
  Variable,
} from "@typebot.io/variables/schemas";
import { isTypebotInSessionAtLeastV6 } from "./helpers/isTypebotInSessionAtLeastV6";
import {
  type BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from "./parseBubbleBlock";

// -----------------------------------------------------------------------------
// 🛠️  Queue helpers ────────────────────────────────────────────────────────────
// -----------------------------------------------------------------------------

type QueueIterator<T> = {
  peek: () => T | undefined;
  next: () => T | undefined;
};

const iterator = <T>(items: readonly T[]): QueueIterator<T> => {
  let i = 0;
  return {
    peek: () => items[i],
    next: () => (i < items.length ? items[i++] : undefined),
  };
};

type SetVarSnapshot = Readonly<
  Pick<SetVariableHistoryItem, "blockId" | "variableId" | "value">
>;

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

// -----------------------------------------------------------------------------
// 🧮  Public API ────────────────────────────────────────────────────────────────
// -----------------------------------------------------------------------------

export const computeResultTranscript = ({
  typebot,
  answers,
  setVariableHistory,
  visitedEdges,
  currentBlockId,
  sessionStore,
}: {
  typebot: TypebotInSession;
  answers: Answer[];
  setVariableHistory: SetVarSnapshot[];
  visitedEdges: string[];
  currentBlockId?: string;
  sessionStore: SessionStore;
}): TranscriptMessage[] => {
  const firstEdgeId = getFirstEdgeId(typebot);
  if (!firstEdgeId) return [];
  const firstEdge = typebot.edges.find((edge) => edge.id === firstEdgeId);
  if (!firstEdge) return [];
  const firstGroup = getNextGroup(typebot, firstEdgeId);
  if (!firstGroup) return [];

  const queues = {
    answers: iterator(answers),
    setVariableHistory: iterator(setVariableHistory),
    visitedEdges: iterator(visitedEdges),
  } as const;

  return executeGroup({
    typebotsQueue: [{ typebot }],
    nextGroup: firstGroup,
    currentTranscript: [],
    queues,
    currentBlockId,
    sessionStore,
  });
};

// -----------------------------------------------------------------------------
// 🔍  Helpers ───────────────────────────────────────────────────────────────────
// -----------------------------------------------------------------------------

const getFirstEdgeId = (typebot: TypebotInSession) => {
  if (isTypebotInSessionAtLeastV6(typebot))
    return typebot.events?.[0].outgoingEdgeId;
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

// -----------------------------------------------------------------------------
// 🚶‍♂️  Graph traversal ──────────────────────────────────────────────────────────
// -----------------------------------------------------------------------------

const executeGroup = ({
  currentTranscript,
  nextGroup,
  typebotsQueue,
  queues,
  currentBlockId,
  sessionStore,
}: {
  currentTranscript: TranscriptMessage[];
  nextGroup: { group: Group; blockIndex?: number } | undefined;
  typebotsQueue: { typebot: TypebotInSession; resumeEdgeId?: string }[];
  queues: {
    answers: QueueIterator<Answer>;
    setVariableHistory: QueueIterator<SetVarSnapshot>;
    visitedEdges: QueueIterator<string>;
  };
  currentBlockId?: string;
  sessionStore: SessionStore;
}): TranscriptMessage[] => {
  if (!nextGroup) return currentTranscript;

  const { answers, setVariableHistory, visitedEdges } = queues;

  for (const block of nextGroup.group.blocks.slice(nextGroup.blockIndex ?? 0)) {
    if (
      currentBlockId &&
      block.id === currentBlockId &&
      !answers.peek() &&
      !setVariableHistory.peek() &&
      !visitedEdges.peek()
    )
      return currentTranscript;

    const typebot = typebotsQueue[0]?.typebot;
    if (!typebot) throw new Error("Typebot not found in session");

    if (setVariableHistory.peek()?.blockId === block.id) {
      typebot.variables = applySetVariable(setVariableHistory.next(), typebot);
    }

    let nextEdgeId = block.outgoingEdgeId;

    // ──────────────────────────────────────────────────────────── Bubble blocks
    if (isBubbleBlock(block)) {
      if (!block.content) continue;
      const parsedBubbleBlock = parseBubbleBlock(
        block as BubbleBlockWithDefinedContent,
        {
          version: 2,
          variables: typebot.variables,
          typebotVersion: typebot.version,
          textBubbleContentFormat: "markdown",
          sessionStore,
        },
      );
      const newMessage =
        convertChatMessageToTranscriptMessage(parsedBubbleBlock);
      if (newMessage) currentTranscript.push(newMessage);
    }
    // ──────────────────────────────────────────────────────────── Input blocks
    else if (isInputBlock(block)) {
      const answer = answers.next();
      if (!answer) break;

      // variable binding
      if (block.options?.variableId) {
        const replyVar = typebot.variables.find(
          (v) => v.id === block.options?.variableId,
        );
        if (replyVar) {
          typebot.variables = typebot.variables.map((v) =>
            v.id === replyVar.id ? { ...v, value: answer.content } : v,
          );
        }
      }

      // attachments (TEXT blocks only for now)
      if (
        block.type === InputBlockType.TEXT &&
        block.options?.attachments?.isEnabled &&
        block.options.attachments.saveVariableId &&
        answer.attachedFileUrls &&
        answer.attachedFileUrls.length > 0
      ) {
        const variable = typebot.variables.find(
          (v) => v.id === block.options!.attachments!.saveVariableId,
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

      const nextVisitedEdge = visitedEdges.peek();
      // Check if the next visited edge matches an non default outgoing edge
      if (nextVisitedEdge) {
        if (isCardsInput(block)) {
          for (const item of block.items) {
            if (!item.paths) continue;
            for (const path of item.paths) {
              if (path.outgoingEdgeId === nextVisitedEdge) {
                nextEdgeId = path.outgoingEdgeId;
                visitedEdges.next();
                break;
              }
            }
          }
        }
        if (blockHasItems(block)) {
          for (const item of block.items) {
            if (item.outgoingEdgeId !== nextVisitedEdge) continue;
            nextEdgeId = item.outgoingEdgeId;
            visitedEdges.next();
            break;
          }
        }
      }

      if (!nextEdgeId && block.outgoingEdgeId)
        nextEdgeId = block.outgoingEdgeId;
    }
    // ──────────────────────────────────────────────────────────── Condition
    else if (block.type === LogicBlockType.CONDITION) {
      const passed = block.items.find(
        (item) =>
          item.content &&
          executeCondition(item.content, {
            variables: typebot.variables,
            sessionStore,
          }),
      );
      if (passed) {
        visitedEdges.next();
        nextEdgeId = passed.outgoingEdgeId;
      }
    }
    // ──────────────────────────────────────────────────────────── AB Test
    // ──────────────────────────────────────────────────────────── Jump
    // ──────────────────────────────────────────────────────────── Return
    else if (
      block.type === LogicBlockType.AB_TEST ||
      block.type === LogicBlockType.JUMP ||
      block.type === LogicBlockType.RETURN
    ) {
      nextEdgeId = visitedEdges.next();
    }
    // ──────────────────────────────────────────────────────────── Typebot link
    else if (block.type === LogicBlockType.TYPEBOT_LINK) {
      const linksSame =
        block.options &&
        (block.options.typebotId === "current" ||
          block.options.typebotId === typebot.id);
      const linkedGroup = typebot.groups.find(
        (g) => g.id === block.options?.groupId,
      );
      if (!linksSame || !linkedGroup) continue;

      let resumeEdge: Edge | undefined;
      if (!block.outgoingEdgeId) {
        const idx = nextGroup.group.blocks.findIndex((b) => b.id === block.id);
        const nextBlock =
          idx === -1 ? undefined : nextGroup.group.blocks.at(idx + 1);
        if (nextBlock) {
          resumeEdge = {
            id: createId(),
            from: { blockId: "" },
            to: { groupId: nextGroup.group.id, blockId: nextBlock.id },
          };
        }
      }

      // tail‑call into linked group
      return executeGroup({
        typebotsQueue: [
          {
            typebot,
            resumeEdgeId: resumeEdge ? resumeEdge.id : block.outgoingEdgeId,
          },
          {
            typebot: resumeEdge
              ? { ...typebot, edges: typebot.edges.concat([resumeEdge]) }
              : typebot,
          },
        ],
        queues,
        currentTranscript,
        nextGroup: { group: linkedGroup },
        currentBlockId,
        sessionStore,
      });
    }

    // ──────────────────────────────────────────────────────────── Recurse
    if (nextEdgeId) {
      const next = getNextGroup(typebot, nextEdgeId);
      if (next) {
        return executeGroup({
          typebotsQueue,
          queues,
          currentTranscript,
          nextGroup: next,
          currentBlockId,
          sessionStore,
        });
      }
    }
  }

  // ────────────────────────────────────────── handle multi‑typebot queue unwind
  if (
    typebotsQueue.length > 1 &&
    typebotsQueue[0]?.resumeEdgeId &&
    typebotsQueue[1]?.typebot
  ) {
    visitedEdges.next(); // drop first visited edge to stay aligned with queue
    return executeGroup({
      typebotsQueue: typebotsQueue.slice(1),
      queues,
      currentTranscript,
      nextGroup: getNextGroup(
        typebotsQueue[1].typebot,
        typebotsQueue[0].resumeEdgeId,
      ),
      currentBlockId,
      sessionStore,
    });
  }

  return currentTranscript;
};

// -----------------------------------------------------------------------------
// 🔄  Misc utilities ────────────────────────────────────────────────────────────
// -----------------------------------------------------------------------------

const applySetVariable = (
  setVar: SetVarSnapshot | undefined,
  typebot: TypebotInSession,
): Variable[] => {
  if (!setVar) return typebot.variables;
  const variable = typebot.variables.find((v) => v.id === setVar.variableId);
  if (!variable) return typebot.variables;
  return typebot.variables.map((v) =>
    v.id === variable.id ? { ...v, value: setVar.value } : v,
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
