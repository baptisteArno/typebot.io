import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import type { ContinueChatResponse } from "../../../../schemas/api";
import type { SessionState } from "../../../../schemas/chatSession";
import { updateVariablesInSession } from "../../../../updateVariablesInSession";

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
  async (message: string, totalTokens?: number) => {
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
      if (mapping.valueToExtract === "Total tokens" && isDefined(totalTokens)) {
        newVariables.push({
          ...existingVariable,
          value: totalTokens,
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
