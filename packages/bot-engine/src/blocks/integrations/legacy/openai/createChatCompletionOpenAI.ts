import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  type chatCompletionMessageRoles,
  defaultOpenAIOptions,
} from "@typebot.io/blocks-integrations/openai/constants";
import type {
  ChatCompletionOpenAIOptions,
  OpenAICredentials,
} from "@typebot.io/blocks-integrations/openai/schema";
import type {
  SessionState,
  TypebotInSession,
} from "@typebot.io/chat-session/schemas";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import { isEmpty } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { parseVariableNumber } from "@typebot.io/variables/parseVariableNumber";
import { getNextBlock } from "../../../../getNextBlock";
import type { ExecuteIntegrationResponse } from "../../../../types";
import { updateVariablesInSession } from "../../../../updateVariablesInSession";
import { executeChatCompletionOpenAIRequest } from "./executeChatCompletionOpenAIRequest";
import { parseChatCompletionMessages } from "./parseChatCompletionMessages";
import { resumeChatCompletion } from "./resumeChatCompletion";

export const createChatCompletionOpenAI = async (
  state: SessionState,
  {
    outgoingEdgeId,
    options,
    blockId,
    sessionStore,
  }: {
    outgoingEdgeId?: string;
    options: ChatCompletionOpenAIOptions;
    blockId: string;
    sessionStore: SessionStore;
  },
): Promise<ExecuteIntegrationResponse> => {
  let newSessionState = state;
  const noCredentialsError = {
    status: "error",
    description: "Make sure to select an OpenAI account",
  };

  if (!options.credentialsId) {
    return {
      outgoingEdgeId,
      logs: [noCredentialsError],
    };
  }
  const credentials = await getCredentials(
    options.credentialsId,
    state.workspaceId,
  );
  if (!credentials) {
    console.error("Could not find credentials in database");
    return { outgoingEdgeId, logs: [noCredentialsError] };
  }
  const { apiKey } = (await decrypt(
    credentials.data,
    credentials.iv,
  )) as OpenAICredentials["data"];

  const { typebot } = newSessionState.typebotsQueue[0];

  const { variablesTransformedToList, messages } = parseChatCompletionMessages(
    typebot.variables,
  )(options.messages, { sessionStore });
  if (variablesTransformedToList.length > 0)
    newSessionState = updateVariablesInSession({
      state,
      newVariables: variablesTransformedToList,
      currentBlockId: undefined,
    }).updatedState;

  const temperature = parseVariableNumber(
    options.advancedSettings?.temperature,
    { variables: typebot.variables, sessionStore },
  );

  const assistantMessageVariableName = typebot.variables.find(
    (variable) =>
      options.responseMapping?.find(
        (m) => m.valueToExtract === "Message content",
      )?.variableId === variable.id,
  )?.name;

  if (
    newSessionState.isStreamEnabled &&
    !newSessionState.whatsApp &&
    isNextBubbleMessageWithAssistantMessage(typebot)(
      blockId,
      assistantMessageVariableName,
    )
  ) {
    return {
      clientSideActions: [
        {
          type: "streamOpenAiChatCompletion",
          streamOpenAiChatCompletion: {
            messages: messages as {
              content?: string;
              role: (typeof chatCompletionMessageRoles)[number];
            }[],
          },
          expectsDedicatedReply: true,
        },
      ],
      outgoingEdgeId,
      newSessionState,
    };
  }

  const { chatCompletion, logs } = await executeChatCompletionOpenAIRequest({
    apiKey,
    messages,
    model: options.model ?? defaultOpenAIOptions.model,
    temperature,
    baseUrl: options.baseUrl,
    apiVersion: options.apiVersion,
  });
  if (!chatCompletion)
    return {
      startTimeShouldBeUpdated: true,
      outgoingEdgeId,
      logs,
    };
  const messageContent = chatCompletion.choices.at(0)?.message?.content;
  const tokens = {
    totalTokens: chatCompletion.usage?.total_tokens,
    promptTokens: chatCompletion.usage?.prompt_tokens,
    completionTokens: chatCompletion.usage?.completion_tokens,
  };
  if (isEmpty(messageContent)) {
    console.error(
      "OpenAI block returned empty message",
      chatCompletion.choices,
    );
    return { outgoingEdgeId, newSessionState, startTimeShouldBeUpdated: true };
  }
  return {
    ...(await resumeChatCompletion(newSessionState, {
      options,
      outgoingEdgeId,
      logs,
    })(messageContent, tokens)),
    startTimeShouldBeUpdated: true,
  };
};

const isNextBubbleMessageWithAssistantMessage =
  (typebot: TypebotInSession) =>
  (blockId: string, assistantVariableName?: string): boolean => {
    if (!assistantVariableName) return false;
    const nextBlock = getNextBlock(blockId, {
      groups: typebot.groups,
      edges: typebot.edges,
    });
    if (!nextBlock) return false;
    return (
      nextBlock.type === BubbleBlockType.TEXT &&
      (nextBlock.content?.richText?.length ?? 0) > 0 &&
      nextBlock.content?.richText?.at(0)?.children.at(0).text ===
        `{{${assistantVariableName}}}`
    );
  };
