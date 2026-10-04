import { createActionHandler } from "@typebot.io/forge";
import { getHostExecutionContext } from "@typebot.io/runtime-session-store/hostExecutionContext";
import { hostAction } from "./hostAction";

export const hostActionHandler = createActionHandler(hostAction, {
  server: async ({ options, variables, logs, isPreview }) => {
    if (isPreview) return;
    try {
      const trusted = getHostExecutionContext();
      const baseUrl = process.env.HOST_API_BASE_URL;
      const serviceKey = process.env.HOST_SERVICE_AUTH_KEY;
      const actionKey = options.actionKey?.trim();
      if (!baseUrl || !serviceKey || !actionKey)
        throw new Error("Host action unavailable");
      const response = await fetch(
        new URL(
          `/internal/host/actions/${encodeURIComponent(actionKey)}`,
          baseUrl,
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-host-service-key": serviceKey,
            "x-host-execution-context": trusted.signedContext,
          },
          body: JSON.stringify({
            inputs: Object.fromEntries(
              (options.inputs ?? []).map(({ key, value }) => [
                key,
                variables.parse(value ?? "") ?? "",
              ]),
            ),
          }),
          redirect: "error",
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok) throw new Error("Host action denied request");
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("kind" in result) ||
        result.kind !== "TEXT" ||
        !("text" in result) ||
        typeof result.text !== "string"
      )
        throw new Error("Unexpected host action result");
      const outputVariableId = options.outputVariableId;
      if (outputVariableId)
        variables.set([{ id: outputVariableId, value: result.text }]);
    } catch {
      logs.add("Host action unavailable");
      throw new Error("Host action unavailable");
    }
  },
});

export default [hostActionHandler];
