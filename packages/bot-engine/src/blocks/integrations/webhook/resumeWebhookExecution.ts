import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";
import type { ZapierBlock } from "@typebot.io/blocks-integrations/zapier/schema";
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
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock;
  logs?: ChatLog[];
  response: {
    statusCode: number;
    data?: unknown;
  };
};

export const resumeWebhookExecution = ({
  state,
  block,
  logs = [],
  response,
}: Props): ExecuteIntegrationResponse => {
  const { typebot } = state.typebotsQueue[0];
  const status = response.statusCode.toString();
  const isError = status.startsWith("4") || status.startsWith("5");

  const responseFromClient = logs.length === 0;

  if (responseFromClient)
    logs.push(
      isError
        ? {
            status: "error",
            description: `Webhook returned error`,
            details: response.data,
          }
        : {
            status: "success",
            description: `Webhook executed successfully!`,
            details: response.data,
          },
    );

  let run: (varMapping: string) => unknown;
  if (block.options?.responseVariableMapping) {
    run = createHttpReqResponseMappingRunner(response);
  }
  const newVariables = block.options?.responseVariableMapping?.reduce<
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
      currentBlockId: block.id,
    });
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      newSessionState: updatedState,
      newSetVariableHistory,
      logs,
    };
  }

  return {
    outgoingEdgeId: block.outgoingEdgeId,
    logs,
  };
};
