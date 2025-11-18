import { defaultScriptOptions } from "@typebot.io/blocks-logic/script/constants";
import type { ScriptBlock } from "@typebot.io/blocks-logic/script/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { executeFunction } from "@typebot.io/variables/executeFunction";
import { extractVariablesFromText } from "@typebot.io/variables/extractVariablesFromText";
import { parseGuessedValueType } from "@typebot.io/variables/parseGuessedValueType";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { Variable } from "@typebot.io/variables/schemas";
import type { ExecuteLogicResponse } from "../../../types";
import { updateVariablesInSession } from "../../../updateVariablesInSession";

export const executeScript = async (
  block: ScriptBlock,
  {
    state,
    sessionStore,
  }: {
    state: SessionState;
    sessionStore: SessionStore;
  },
): Promise<ExecuteLogicResponse> => {
  const { variables } = state.typebotsQueue[0].typebot;
  if (!block.options?.content) return { outgoingEdgeId: block.outgoingEdgeId };

  const isExecutedOnClient =
    block.options.isExecutedOnClient ?? defaultScriptOptions.isExecutedOnClient;

  if (!isExecutedOnClient) {
    const { newVariables, error } = await executeFunction({
      variables,
      body: block.options.content,
      sessionStore,
    });

    const updateVarResults = newVariables
      ? updateVariablesInSession({
          newVariables,
          state,
          currentBlockId: block.id,
        })
      : undefined;

    let newSessionState = state;

    if (updateVarResults) {
      newSessionState = updateVarResults.updatedState;
    }

    return {
      outgoingEdgeId: block.outgoingEdgeId,
      logs: error ? [error] : [],
      newSessionState,
      newSetVariableHistory: updateVarResults?.newSetVariableHistory,
    };
  }

  const scriptToExecute = parseScriptToExecuteClientSideAction(
    variables,
    block.options.content,
    sessionStore,
  );

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    clientSideActions: [
      {
        type: "scriptToExecute",
        scriptToExecute: {
          ...scriptToExecute,
          isUnsafe: block.options.isUnsafe,
        },
      },
    ],
  };
};

export const parseScriptToExecuteClientSideAction = (
  variables: Variable[],
  contentToEvaluate: string,
  sessionStore: SessionStore,
) => {
  const content = parseVariables(contentToEvaluate, {
    variables,
    sessionStore,
    fieldToParse: "id",
  });
  const args = extractVariablesFromText(variables)(contentToEvaluate).map(
    (variable) => ({
      id: variable.id,
      value: parseGuessedValueType(variable.value),
    }),
  );
  return {
    content,
    args,
  };
};
