import { describe, expect, it } from "bun:test";
import {
  getHostExecutionContext,
  runWithHostExecutionContext,
} from "./hostExecutionContext";

const context = (flowId: string) => ({
  signedContext: `signed-${flowId}`,
  envelope: {
    version: 1 as const,
    iss: "host-a",
    aud: "botflow-host-action" as const,
    flowId,
    executionId: `execution-${flowId}`,
    iat: 1,
    exp: 2,
    claims: { opaque: flowId },
  },
});

describe("host execution context", () => {
  it("fails closed without a private request", () => {
    expect(() => getHostExecutionContext()).toThrow(
      "Host execution context required",
    );
  });

  it("isolates concurrent async executions and clears them afterward", async () => {
    const [first, second] = await Promise.all([
      runWithHostExecutionContext(context("flow-a"), async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return getHostExecutionContext();
      }),
      runWithHostExecutionContext(context("flow-b"), async () => {
        await Promise.resolve();
        return getHostExecutionContext();
      }),
    ]);
    expect([first, second]).toEqual([context("flow-a"), context("flow-b")]);
    expect(() => getHostExecutionContext()).toThrow();
  });
});
