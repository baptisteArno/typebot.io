import { parseVariables } from "@/features/variables";
import type { IntegrationState } from "@/types";
import type { MakeComBlock } from "@typebot.io/blocks-integrations/makeCom/schema";
import type { PabblyConnectBlock } from "@typebot.io/blocks-integrations/pabblyConnect/schema";
import type { HttpRequestBlock } from "@typebot.io/blocks-integrations/webhook/schema";
import type { ZapierBlock } from "@typebot.io/blocks-integrations/zapier/schema";
import { byId, sendRequest } from "@typebot.io/lib/utils";
import type { VariableWithUnknowValue } from "@typebot.io/variables/schemas";
import { stringify } from "qs";

export const executeWebhook = async (
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  {
    blockId,
    variables,
    updateVariableValue,
    updateVariables,
    typebotId,
    apiHost,
    resultValues,
    onNewLog,
    resultId,
    parentTypebotIds,
  }: IntegrationState,
) => {
  const params = stringify({ resultId });
  const { data, error } = await sendRequest({
    url: `${apiHost}/api/typebots/${typebotId}/blocks/${blockId}/executeWebhook?${params}`,
    method: "POST",
    body: {
      variables,
      resultValues,
      parentTypebotIds,
    },
  });
  const statusCode = (
    data as Record<string, string> | undefined
  )?.statusCode.toString();
  const isError = statusCode
    ? statusCode?.startsWith("4") || statusCode?.startsWith("5")
    : true;
  onNewLog({
    status: error ? "error" : isError ? "warning" : "success",
    description: isError
      ? "Webhook returned an error"
      : "Webhook successfuly executed",
    details: JSON.stringify(error ?? data, null, 2).substring(0, 1000),
  });
  const newVariables = block.options?.responseVariableMapping?.reduce<
    VariableWithUnknowValue[]
  >((newVariables, varMapping) => {
    if (!varMapping?.bodyPath || !varMapping.variableId) return newVariables;
    const existingVariable = variables.find(byId(varMapping.variableId));
    if (!existingVariable) return newVariables;
    const func = Function(
      "data",
      `return data.${parseVariables(variables)(varMapping?.bodyPath)}`,
    );
    try {
      const value: unknown = func(data);
      updateVariableValue(existingVariable?.id, value);
      return [...newVariables, { ...existingVariable, value }];
    } catch (err) {
      return newVariables;
    }
  }, []);
  if (newVariables) updateVariables(newVariables);
  return block.outgoingEdgeId;
};
