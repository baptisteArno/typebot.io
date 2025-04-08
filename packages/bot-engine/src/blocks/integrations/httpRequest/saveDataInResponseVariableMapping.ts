import type { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { byId } from "@typebot.io/lib/utils";
import type { LogInSession } from "@typebot.io/logs/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { createHttpReqResponseMappingRunner } from "@typebot.io/variables/codeRunners";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
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
  logs?: LogInSession[];
  response: {
    statusCode?: number;
    data?: unknown;
  };
  sessionStore: SessionStore;
};

export const saveDataInResponseVariableMapping = ({
  state,
  blockType,
  blockId,
  responseVariableMapping,
  outgoingEdgeId,
  logs = [],
  response,
  sessionStore,
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
            details: JSON.stringify(response.data),
          }
        : {
            status: "success",
            description: `${blockLabel} executed successfully!`,
            details: JSON.stringify(response.data),
          },
    );
  }

  let run: ((varMapping: string) => unknown) | undefined;
  if (responseVariableMapping) {
    run = createHttpReqResponseMappingRunner({ response, sessionStore });
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
        parseVariables(varMapping?.bodyPath, {
          variables: typebot.variables,
          sessionStore,
        }),
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
