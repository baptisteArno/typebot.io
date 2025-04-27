import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import { updateVariablesInSession } from "../../../../updateVariablesInSession";

interface ResumeChatCompletionTokens {
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
}

export const resumeChatCompletion =
  (
    state: SessionState,
    {
      outgoingEdgeId,
      options,
      logs = [],
    }: {
      outgoingEdgeId?: string;
      options: ChatCompletionOpenAIOptions;
      logs?: ContinueChatResponse["logs"];
    },
  ) =>
  async (message: string, tokens?: ResumeChatCompletionTokens) => {
    let newSessionState = state;
    const newVariables = options.responseMapping?.reduce<
      VariableWithUnknowValue[]
    >((newVariables, mapping) => {
      const { typebot } = newSessionState.typebotsQueue[0];
      const existingVariable = typebot.variables.find(byId(mapping.variableId));
      if (!existingVariable) return newVariables;
      if (mapping.valueToExtract === "Message content") {
        newVariables.push({
          ...existingVariable,
          value: Array.isArray(existingVariable.value)
            ? existingVariable.value.concat(message)
            : message,
        });
      }
      if (
        mapping.valueToExtract === "Total tokens" &&
        isDefined(tokens?.totalTokens)
      ) {
        newVariables.push({
          ...existingVariable,
          value: tokens.totalTokens,
        });
      }
      if (
        mapping.valueToExtract === "Prompt tokens" &&
        isDefined(tokens?.promptTokens)
      ) {
        newVariables.push({
          ...existingVariable,
          value: tokens.promptTokens,
        });
      }
      if (
        mapping.valueToExtract === "Completion tokens" &&
        isDefined(tokens?.completionTokens)
      ) {
        newVariables.push({
          ...existingVariable,
          value: tokens.completionTokens,
        });
      }
      return newVariables;
    }, []);
    if (newVariables && newVariables.length > 0)
      newSessionState = updateVariablesInSession({
        newVariables,
        state: newSessionState,
        currentBlockId: undefined,
      }).updatedState;
    return {
      outgoingEdgeId,
      newSessionState,
      logs,
    };
  };
