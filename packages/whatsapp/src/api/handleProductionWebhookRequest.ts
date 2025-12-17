import * as Sentry from "@sentry/nextjs";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { after } from "next/server";
import {
  WEBHOOK_SUCCESS_MESSAGE,
  WHATSAPP_SESSION_ID_PREFIX,
} from "../constants";
import { extractErrorsFromEntry } from "../extractErrorsFromEntry";
import { groupIncomingWebhookEntriesPerUser } from "../groupIncomingWebhookEntriesPerUser";
import { resumeWhatsAppFlow } from "../resumeWhatsAppFlow";
import type { WhatsAppWebhookRequestBody } from "../schemas";
import { WhatsAppError } from "../WhatsAppError";

export const handleProductionWebhookRequest = async ({
  input: { entry, workspaceId, credentialsId },
}: {
  input: WhatsAppWebhookRequestBody & {
    workspaceId: string;
    credentialsId: string;
  };
}) => {
  if (!entry) return WEBHOOK_SUCCESS_MESSAGE;

  const errors = extractErrorsFromEntry(entry);

  if (errors.length > 0) {
    console.warn("Incoming WhatsApp errors", errors);
    Sentry.captureMessage("Incoming WhatsApp errors", {
      extra: {
        errors,
      },
    });
  }

  const incomingMessagesDetails = groupIncomingWebhookEntriesPerUser(entry);
  if (incomingMessagesDetails.size === 0) return WEBHOOK_SUCCESS_MESSAGE;

  // Allows us to process the event in the background and return the response right away
  // because WhatsApp expects a response in less than 3 seconds
  after(async () => {
    for (const [phoneNumberId, fromMap] of incomingMessagesDetails.entries()) {
      for (const [from, parsedEntries] of fromMap.entries()) {
        try {
          await resumeWhatsAppFlow({
            receivedMessages: parsedEntries.map(
              (parsedEntry) => parsedEntry.receivedMessages,
            ),
            sessionId: `${WHATSAPP_SESSION_ID_PREFIX}${phoneNumberId}-${from}`,
            phoneNumberId,
            credentialsId,
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
  });

  return WEBHOOK_SUCCESS_MESSAGE;
};

const safeJsonParse = (value: string | undefined): unknown => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
