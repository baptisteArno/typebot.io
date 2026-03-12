import * as Sentry from "@sentry/bun";
import { WorkflowSentryConfig } from "@typebot.io/telemetry/reportWorkflowFailureToSentry";
import { Cause, Effect } from "effect";

export const reportFatalCauseToSentry = Effect.fn("reportFatalCauseToSentry")(
  function* (cause: Cause.Cause<unknown>) {
    const { isEnabled } = yield* WorkflowSentryConfig;
    if (!isEnabled || Cause.hasInterruptsOnly(cause)) return;

    const effectCause = Cause.pretty(cause);
    const squashedCause = Cause.squash(cause);
    const error =
      squashedCause instanceof Error
        ? squashedCause
        : new Error(String(squashedCause));

    yield* Effect.sync(() => {
      Sentry.withScope((scope) => {
        scope.setExtra("effect_cause", effectCause);
        Sentry.captureException(error);
      });
    });

    yield* Effect.tryPromise({
      try: () => Sentry.flush(2000),
      catch: (error) => new Error(String(error)),
    }).pipe(Effect.catchCause(() => Effect.void));
  },
);
