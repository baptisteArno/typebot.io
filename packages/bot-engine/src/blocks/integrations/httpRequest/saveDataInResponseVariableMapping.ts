import { byId } from "@typebot.io/lib/utils";
import { createHttpReqResponseMappingRunner } from "@typebot.io/variables/codeRunners";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import type { ChatLog } from "../../../schemas/api";
import type { SessionState } from "../../../schemas/chatSession";
import type { ExecuteIntegrationResponse } from "../../../types";
import { updateVariablesInSession } from "../../../updateVariablesInSession";

type Props = {
  state: SessionState;
  blockId: string;
  responseVariableMapping?: {
    bodyPath?: string;
    variableId?: string;
  }[];
  outgoingEdgeId?: string;
  logs?: ChatLog[];
  response: {
    statusCode?: number;
    data?: unknown;
  };
};

export const saveDataInResponseVariableMapping = ({
  state,
  blockId,
  responseVariableMapping,
  outgoingEdgeId,
  logs = [],
  response,
}: Props): ExecuteIntegrationResponse => {
  const { typebot } = state.typebotsQueue[0];
  const status = response.statusCode?.toString();
  const isError = status
    ? status.startsWith("4") || status.startsWith("5")
    : false;

  const responseFromClient = logs.length === 0;

  if (responseFromClient)
    logs.push(
      isError
        ? {
            status: "error",
            description: `HTTP request returned error`,
            details: response.data,
          }
        : {
            status: "success",
            description: `HTTP request executed successfully!`,
            details: response.data,
          },
    );

  let run: (varMapping: string) => unknown;
  if (responseVariableMapping) {
    run = createHttpReqResponseMappingRunner(response);
  }
  const newVariables = responseVariableMapping?.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId || !run)
      return newVariables;
    const existingVariable = typebot.variables.find(
      byId(varMapping.variableId),
    );
    if (!existingVariable) return newVariables;

    try {
      const value: unknown = run(
        parseVariables(typebot.variables)(varMapping?.bodyPath),
      );
      return [...newVariables, { ...existingVariable, value }];
    } catch (err) {
      return newVariables;
    }
  }, []);
  if (newVariables && newVariables.length > 0) {
    const { updatedState, newSetVariableHistory } = updateVariablesInSession({
      newVariables,
      state,
      currentBlockId: blockId,
    });
    return {
      outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
      logs,
    };
  }

  return {
    outgoingEdgeId,
    logs,
  };
};
