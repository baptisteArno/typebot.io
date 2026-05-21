import { ORPCError } from "@orpc/server";
import * as Sentry from "@sentry/nextjs";
import { decrypt } from "@typebot.io/credentials/decrypt";
import { getCredentials } from "@typebot.io/credentials/getCredentials";
import { whatsAppCredentialsDataSchema } from "@typebot.io/credentials/schemas";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { after } from "next/server";
import { z } from "zod";
import {
  dialog360WebhookSecretHeaderName,
  WEBHOOK_SUCCESS_MESSAGE,
  WHATSAPP_SESSION_ID_PREFIX,
} from "../constants";
import { extractErrorsFromEntry } from "../extractErrorsFromEntry";
import { forwardStatusWebhooks } from "../forwardStatusWebhooks";
import { groupIncomingWebhookEntriesPerUser } from "../groupIncomingWebhookEntriesPerUser";
import { resumeWhatsAppFlow } from "../resumeWhatsAppFlow";
import { whatsAppWebhookRequestBodySchema } from "../schemas";
import { verifyWhatsAppWebhookSecret } from "../verifyWhatsAppWebhookSecret";
import { verifyWhatsAppWebhookSignature } from "../verifyWhatsAppWebhookSignature";
import { WhatsAppError } from "../WhatsAppError";

export const productionWebhookRequestInputSchema = z.object({
  params: z.object({
    workspaceId: z.string(),
    credentialsId: z.string(),
  }),
  headers: z.object({
    [dialog360WebhookSecretHeaderName]: z.string().optional(),
    "x-hub-signature-256": z.string().optional(),
  }),
  body: z.string(),
});

export const handleProductionWebhookRequest = async ({
  input: {
    params: { workspaceId, credentialsId },
    headers,
    body,
  },
}: {
  input: z.infer<typeof productionWebhookRequestInputSchema>;
}) => {
  const credentialsData = await getWhatsAppCredentialsData({
    credentialsId,
    workspaceId,
  });

  if (credentialsData?.provider === "360dialog") {
    if (
      credentialsData.webhookSecret &&
      !verifyWhatsAppWebhookSecret({
        expectedSecret: credentialsData.webhookSecret,
        receivedSecret: headers[dialog360WebhookSecretHeaderName],
      })
    )
      throw new ORPCError("UNAUTHORIZED", {
        message: "Invalid WhatsApp webhook secret",
      });
  } else if (
    credentialsData?.appSecret &&
    !verifyWhatsAppWebhookSignature({
      appSecret: credentialsData.appSecret,
      rawBody: body,
      signature: headers["x-hub-signature-256"],
    })
  )
    throw new ORPCError("UNAUTHORIZED", {
      message: "Invalid WhatsApp webhook signature",
    });

  const { entry } = parseWebhookBody(body);

  if (!entry) return WEBHOOK_SUCCESS_MESSAGE;

  const errors = extractErrorsFromEntry(entry);

  if (errors.length > 0) {
    console.warn("Incoming WhatsApp errors", errors);
  }

  const incomingMessagesDetails = groupIncomingWebhookEntriesPerUser(entry);

  // Allows us to process the event in the background and return the response right away
  // because WhatsApp expects a response in less than 3 seconds
  after(async () => {
    const [forwardingResult, resumingResult] = await Promise.allSettled([
      forwardStatusWebhooks({
        entry,
        workspaceId,
        credentialsId,
      }),
      (async () => {
        for (const [
          phoneNumberId,
          fromMap,
        ] of incomingMessagesDetails.entries()) {
          for (const [from, parsedEntries] of fromMap.entries()) {
            try {
              await resumeWhatsAppFlow({
                receivedMessages: parsedEntries.map(
                  (parsedEntry) => parsedEntry.receivedMessages,
                ),
                sessionId: `${WHATSAPP_SESSION_ID_PREFIX}${phoneNumberId}-${from}`,
                phoneNumberId,
                credentialsId,
                credentialsData,
                workspaceId,
                contact: {
                  name: parsedEntries[0].contactName,
                  phoneNumber: parsedEntries[0].contactPhoneNumber,
                },
                referral: parsedEntries[0].referral,
              });
            } catch (err) {
              if (err instanceof WhatsAppError) {
                console.log("Known WA error", err.message, err.details);
              } else {
                console.log("Sending unknown error to Sentry");
                const parsedError = await parseUnknownError({ err });
                console.log(parsedError);
                const details = safeJsonParse(parsedError.details);
                Sentry.addBreadcrumb({
                  data:
                    typeof details === "object" && details
                      ? details
                      : {
                          details,
                        },
                });
                Sentry.captureException(err);
              }
            }
          }
        }
      })(),
    ]);

    if (forwardingResult.status === "rejected") {
      Sentry.captureException(forwardingResult.reason);
    }
    if (resumingResult.status === "rejected") {
      Sentry.captureException(resumingResult.reason);
    }
  });

  return WEBHOOK_SUCCESS_MESSAGE;
};

const getWhatsAppCredentialsData = async ({
  credentialsId,
  workspaceId,
}: {
  credentialsId: string;
  workspaceId: string;
}) => {
  const credentials = await getCredentials(credentialsId, workspaceId);
  if (!credentials) return;

  const parsedData = whatsAppCredentialsDataSchema.safeParse(
    await decrypt(credentials.data, credentials.iv),
  );
  if (!parsedData.success) return;

  return parsedData.data;
};

const parseWebhookBody = (body: string) => {
  try {
    return whatsAppWebhookRequestBodySchema.parse(JSON.parse(body));
  } catch {
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid WhatsApp webhook payload",
    });
  }
};

const safeJsonParse = (value: string | undefined): unknown => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
