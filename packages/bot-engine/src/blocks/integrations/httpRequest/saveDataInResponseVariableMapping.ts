import type { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
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
  blockType:
    | LogicBlockType.WEBHOOK
    | IntegrationBlockType.HTTP_REQUEST
    | IntegrationBlockType.ZAPIER
    | IntegrationBlockType.MAKE_COM
    | IntegrationBlockType.PABBLY_CONNECT;
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
  blockType,
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

  if (responseFromClient) {
    const blockLabel =
      blockType === LogicBlockType.WEBHOOK ? "Webhook" : "HTTP request";
    logs.push(
      isError
        ? {
            status: "error",
            description: `${blockLabel} returned error`,
            details: response.data,
          }
        : {
            status: "success",
            description: `${blockLabel} executed successfully!`,
            details: response.data,
          },
    );
  }

  let run: ((varMapping: string) => unknown) | undefined;
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
