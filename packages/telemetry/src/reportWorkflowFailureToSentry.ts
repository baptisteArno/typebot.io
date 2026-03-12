import * as Sentry from "@sentry/bun";
import { Config, Effect, Layer, Option, ServiceMap } from "effect";

type ReportWorkflowFailureToSentryOptions = {
  readonly rpc: string;
  readonly workflow: string;
  readonly workflowId?: string;
  readonly typebotId?: string;
  readonly userId?: string;
};

export class WorkflowSentryConfig extends ServiceMap.Service<
  WorkflowSentryConfig,
  {
    readonly isEnabled: boolean;
  }
>()("@typebot/WorkflowSentryConfig") {
  static readonly layer = Layer.effect(
    WorkflowSentryConfig,
    Effect.gen(function* () {
      const sentryDsn = yield* Config.option(Config.string("SENTRY_DSN"));

      return WorkflowSentryConfig.of({
        isEnabled: Option.isSome(sentryDsn),
      });
    }),
  );
}

export const reportWorkflowFailureToSentry = Effect.fn(
  "reportWorkflowFailureToSentry",
)(function* (error: unknown, options: ReportWorkflowFailureToSentryOptions) {
  const { isEnabled } = yield* WorkflowSentryConfig;
  if (!isEnabled) return;

  yield* Effect.sync(() => {
    Sentry.withScope((scope) => {
      scope.setTags({
        service: "workflows",
        rpc: options.rpc,
        workflow: options.workflow,
      });
      scope.setExtras({
        workflowId: options.workflowId,
        typebotId: options.typebotId,
        userId: options.userId,
      });

      Sentry.captureException(toError(error));
    });
  });
});

const toError = (error: unknown) => {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  if (
    error &&
    typeof error === "object" &&
    "_tag" in error &&
    typeof error._tag === "string"
  ) {
    return new Error(error._tag);
  }

  return new Error("Unknown workflow failure");
};
