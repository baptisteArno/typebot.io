import { listSuppressedEmails } from "@typebot.io/emails/helpers/suppressedEmails";
import { renderUserOnboardingEmail } from "@typebot.io/emails/transactional/UserOnboardingEmail";
import { env } from "@typebot.io/env";
import {
  NodemailerClient,
  NodemailerError,
} from "@typebot.io/lib/nodemailer/NodemailerClient";
import { reportWorkflowFailureToSentry } from "@typebot.io/telemetry/reportWorkflowFailureToSentry";
import { Effect, Option, Schema } from "effect";
import { Activity, DurableClock, Workflow } from "effect/unstable/workflow";
import { createUnsubscribeToken } from "../createUnsubscribeToken";
import { normalizeEmail } from "../normalizeEmail";

export const StartUserOnboardingWorkflow = Workflow.make({
  name: "StartUserOnboardingWorkflow",
  payload: {
    userId: Schema.String,
    email: Schema.String,
  },
  error: NodemailerError,
  idempotencyKey: ({ userId }) => userId,
});

export const StartUserOnboardingWorkflowLayer =
  StartUserOnboardingWorkflow.toLayer(
    Effect.fnUntraced(
      function* (payload, executionId) {
        yield* Effect.annotateLogsScoped({
          userId: payload.userId,
          email: payload.email,
          executionId,
        });

        const normalizedEmail = normalizeEmail(payload.email);
        if (!normalizedEmail) {
          yield* Effect.logWarning("Invalid email, skipping onboarding email");
          return;
        }

        yield* DurableClock.sleep({
          name: `UserOnboardingDelay-${payload.userId}`,
          duration: "2 hours",
        });

        const suppressedEmailsResult = yield* listSuppressedEmails([
          normalizedEmail,
        ]).pipe(
          Effect.map(Option.some),
          Effect.catch((error) =>
            Effect.logError("Suppressed email check failed").pipe(
              Effect.annotateLogs({
                error: String(error),
                email: normalizedEmail,
              }),
              Effect.as(Option.none()),
            ),
          ),
        );

        if (Option.isNone(suppressedEmailsResult)) {
          yield* Effect.logWarning(
            "Suppressed email check failed, skipping onboarding email",
          ).pipe(
            Effect.annotateLogs({
              email: normalizedEmail,
            }),
          );
          return;
        }

        if (suppressedEmailsResult.value.length > 0) {
          yield* Effect.logWarning(
            "Email suppressed, skipping onboarding email",
          ).pipe(
            Effect.annotateLogs({
              email: normalizedEmail,
              suppressedEmails: suppressedEmailsResult.value,
            }),
          );
          return;
        }

        const unsubscribeUrls = buildUnsubscribeUrls(normalizedEmail);

        yield* Activity.make({
          name: "SendUserOnboardingEmail",
          error: NodemailerError,
          execute: Effect.gen(function* () {
            const emailClient = yield* NodemailerClient;
            const html = yield* Effect.tryPromise({
              try: () =>
                renderUserOnboardingEmail({
                  unsubscribeUrl: unsubscribeUrls?.pageUrl ?? undefined,
                }),
              catch: (error) => new NodemailerError({ cause: error }),
            });
            const headers = unsubscribeUrls
              ? {
                  "List-Unsubscribe": `<${unsubscribeUrls.apiUrl}>`,
                  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                }
              : undefined;
            yield* emailClient.sendMail({
              to: normalizedEmail,
              subject: "Welcome to Typebot!",
              html,
              headers,
            });
          }),
        })
          .asEffect()
          .pipe(
            Effect.tapError((error) =>
              Effect.logError("SendUserOnboardingEmail failed").pipe(
                Effect.annotateLogs({
                  error: String(error),
                  email: normalizedEmail,
                }),
              ),
            ),
          );
      },
      (effect, payload) =>
        effect.pipe(
          Effect.tapError((error) =>
            reportWorkflowFailureToSentry(error, {
              rpc: "SendUserOnboardingEmail",
              workflow: "StartUserOnboardingWorkflow",
              userId: payload.userId,
            }),
          ),
        ),
    ),
  );

const buildUnsubscribeUrls = (email: string) => {
  if (!env.EMAIL_UNSUBSCRIBE_SECRET) return null;
  const token = createUnsubscribeToken(email);
  if (!token) return null;
  const apiUrl = new URL("/api/emails/unsubscribe", env.NEXTAUTH_URL);
  apiUrl.searchParams.set("email", email);
  apiUrl.searchParams.set("token", token);
  const pageUrl = new URL("/emails/unsubscribe", env.NEXTAUTH_URL);
  pageUrl.searchParams.set("email", email);
  pageUrl.searchParams.set("token", token);
  return { apiUrl: apiUrl.toString(), pageUrl: pageUrl.toString() };
};
