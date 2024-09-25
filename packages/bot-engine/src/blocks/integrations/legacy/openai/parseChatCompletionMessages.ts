import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import { byId, isNotEmpty } from "@typebot.io/lib/utils";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type {
  Variable,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { transformVariablesToList } from "@typebot.io/variables/transformVariablesToList";
import type { OpenAI } from "openai";

export const parseChatCompletionMessages =
  (variables: Variable[]) =>
  (
    messages: ChatCompletionOpenAIOptions["messages"],
  ): {
    variablesTransformedToList: VariableWithValue[];
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
  } => {
    const variablesTransformedToList: VariableWithValue[] = [];
    const parsedMessages = messages
      ?.flatMap((message) => {
        if (!message.role) return;
        if (message.role === "Messages sequence ✨") {
          if (
            !message.content?.assistantMessagesVariableId ||
            !message.content?.userMessagesVariableId
          )
            return;
          variablesTransformedToList.push(
            ...transformVariablesToList(variables)([
              message.content.assistantMessagesVariableId,
              message.content.userMessagesVariableId,
            ]),
          );
          const updatedVariables = variables.map((variable) => {
            const variableTransformedToList = variablesTransformedToList.find(
              byId(variable.id),
            );
            if (variableTransformedToList) return variableTransformedToList;
            return variable;
          });

          const userMessages = (updatedVariables.find(
            (variable) =>
              variable.id === message.content?.userMessagesVariableId,
          )?.value ?? []) as string[];

          const assistantMessages = (updatedVariables.find(
            (variable) =>
              variable.id === message.content?.assistantMessagesVariableId,
          )?.value ?? []) as string[];

          let allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

          if (userMessages.length > assistantMessages.length)
            allMessages = userMessages.flatMap((userMessage, index) => [
              {
                role: "user",
                content: userMessage,
              },
              { role: "assistant", content: assistantMessages.at(index) ?? "" },
            ]) satisfies OpenAI.Chat.ChatCompletionMessageParam[];
          else {
            allMessages = assistantMessages.flatMap(
              (assistantMessage, index) => [
                { role: "assistant", content: assistantMessage },
                {
                  role: "user",
                  content: userMessages.at(index) ?? "",
                },
              ],
            ) satisfies OpenAI.Chat.ChatCompletionMessageParam[];
          }

          return allMessages;
        }
        if (message.role === "Dialogue") {
          if (!message.dialogueVariableId) return;
          const dialogue = (variables.find(
            (variable) => variable.id === message.dialogueVariableId,
          )?.value ?? []) as string[];

          return dialogue.map<OpenAI.Chat.ChatCompletionMessageParam>(
            (dialogueItem, index) => {
              if (index === 0 && message.startsBy === "assistant")
                return {
                  role: "assistant",
                  content: dialogueItem,
                };
              return {
                role:
                  index % (message.startsBy === "assistant" ? 1 : 2) === 0
                    ? "user"
                    : "assistant",
                content: dialogueItem,
              };
            },
          );
        }
        return {
          role: message.role,
          content: parseVariables(variables)(message.content),
          name: message.name
            ? parseVariables(variables)(message.name)
            : undefined,
        } satisfies OpenAI.Chat.ChatCompletionMessageParam;
      })
      .filter(
        (message) =>
          isNotEmpty(message?.role) && isNotEmpty(message?.content?.toString()),
      ) as OpenAI.Chat.ChatCompletionMessageParam[];

    return {
      variablesTransformedToList,
      messages: parsedMessages,
    };
  };
