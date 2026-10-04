import { AsyncLocalStorage } from "node:async_hooks";

export type HostExecutionContextEnvelope = {
  version: 1;
  iss: string;
  aud: "botflow-host-action";
  flowId: string;
  executionId: string;
  iat: number;
  exp: number;
  claims: Record<string, unknown>;
};

export type TrustedHostExecutionContext = {
  signedContext: string;
  envelope: HostExecutionContextEnvelope;
};

const executionContext = new AsyncLocalStorage<TrustedHostExecutionContext>();

export const runWithHostExecutionContext = <T>(
  value: TrustedHostExecutionContext,
  run: () => T,
): T => executionContext.run(value, run);

export const getHostExecutionContext = (): TrustedHostExecutionContext => {
  const value = executionContext.getStore();
  if (!value) throw new Error("Host execution context required");
  return value;
};
