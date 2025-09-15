import * as Sentry from "@sentry/nextjs";
import { deleteSession } from "@typebot.io/chat-session/queries/deleteSession";
import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { after, type NextRequest } from "next/server";
import { incomingWebhookErrorCodes } from "../constants";
import { extractErrorsFromEntry } from "../extractErrorsFromEntry";
import { groupIncomingWebhookEntriesPerUser } from "../groupIncomingWebhookEntriesPerUser";
import { parseWhatsAppWebhookBody } from "../parseWhatsAppWebhookBody";
import { resumeWhatsAppFlow } from "../resumeWhatsAppFlow";
import { WhatsAppError } from "../WhatsAppError";

const whatsAppPreviewSessionIdPrefix = "wa-preview-";

export const handlePreviewWebhookRequest = async (
  request: NextRequest,
): Promise<Response> => {
  // In any case, we return a 200 response to avoid WhatsApp retrying the request
  const response = new Response("Message received", { status: 200 });

  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID) {
    console.error("WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined");
    return response;
  }

  const entry = await parseWhatsAppWebhookBody(request);

  if (!entry) return response;

  const errors = extractErrorsFromEntry(entry);

  if (errors.length > 0) {
    const unengagedUserError = errors.find(
      (error) =>
        error.code ===
        incomingWebhookErrorCodes["Could not send message to unengaged user"],
    );
    if (unengagedUserError) {
      console.warn(
        "Received unengaged user error, deleting session",
        unengagedUserError.details,
      );
      await deleteSession(
        `${whatsAppPreviewSessionIdPrefix}${unengagedUserError.details}`,
      );
    } else {
      console.warn("Incoming WhatsApp errors", errors);
      Sentry.captureMessage("Incoming WhatsApp errors", {
        extra: {
          errors,
        },
      });
    }
  }

  const incomingMessagesDetails = groupIncomingWebhookEntriesPerUser(entry);
  if (incomingMessagesDetails.size === 0) return response;

  after(async () => {
    for (const [phoneNumberId, fromMap] of incomingMessagesDetails.entries()) {
      if (phoneNumberId !== env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID) {
        console.log("Phone number ID is not the preview phone number ID");
        continue;
      }
      for (const [from, parsedEntries] of fromMap.entries()) {
        try {
          await resumeWhatsAppFlow({
            receivedMessages: parsedEntries.map(
              (parsedEntry) => parsedEntry.receivedMessages,
            ),
            sessionId: `${whatsAppPreviewSessionIdPrefix}${from}`,
            contact: {
              name: parsedEntries[0].contactName,
              phoneNumber: parsedEntries[0].contactPhoneNumber,
            },
          });
        } catch (err) {
          await handleUnknownError(err);
        }
      }
    }
  });

  return response;
};

const handleUnknownError = async (err: unknown) => {
  if (err instanceof WhatsAppError) {
    Sentry.captureMessage(err.message, err.details);
  } else {
    console.log("Sending unkown error to Sentry");
    const details = safeJsonParse((await parseUnknownError({ err })).details);
    console.log("details", details);
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
};

const safeJsonParse = (value: string | undefined): unknown => {
  if (!value) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
