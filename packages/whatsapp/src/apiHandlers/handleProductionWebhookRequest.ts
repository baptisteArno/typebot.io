import * as Sentry from "@sentry/nextjs";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { after, type NextRequest } from "next/server";
import { extractErrorsFromEntry } from "../extractErrorsFromEntry";
import { groupIncomingWebhookEntriesPerUser } from "../groupIncomingWebhookEntriesPerUser";
import { parseWhatsAppWebhookBody } from "../parseWhatsAppWebhookBody";
import { resumeWhatsAppFlow } from "../resumeWhatsAppFlow";
import { WhatsAppError } from "../WhatsAppError";

const WHATSAPP_SESSION_ID_PREFIX = "wa-";

export const handleProductionWebhookRequest = async (
  request: NextRequest,
  params: { workspaceId: string; credentialsId: string },
): Promise<Response> => {
  // In any case, we return a 200 response to avoid WhatsApp retrying the request
  const response = new Response("Message received", { status: 200 });

  const entry = await parseWhatsAppWebhookBody(request);

  if (!entry) return response;

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
  if (incomingMessagesDetails.size === 0) return response;

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
            credentialsId: params.credentialsId,
            workspaceId: params.workspaceId,
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

  return response;
};

const safeJsonParse = (value: string | undefined): unknown => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
