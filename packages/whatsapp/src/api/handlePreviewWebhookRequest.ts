import * as Sentry from "@sentry/nextjs";
import { deleteSession } from "@typebot.io/chat-session/queries/deleteSession";
import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { after } from "next/server";
import {
  incomingWebhookErrorCodes,
  WEBHOOK_SUCCESS_MESSAGE,
  WHATSAPP_PREVIEW_SESSION_ID_PREFIX,
} from "../constants";
import { extractErrorsFromEntry } from "../extractErrorsFromEntry";
import { groupIncomingWebhookEntriesPerUser } from "../groupIncomingWebhookEntriesPerUser";
import { resumeWhatsAppFlow } from "../resumeWhatsAppFlow";
import type { WhatsAppWebhookRequestBody } from "../schemas";
import { WhatsAppError } from "../WhatsAppError";

export const handlePreviewWebhookRequest = async ({
  input: { entry },
}: {
  input: WhatsAppWebhookRequestBody;
}) => {
  if (!env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID) {
    console.error("WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID is not defined");
    return WEBHOOK_SUCCESS_MESSAGE;
  }
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
        `${WHATSAPP_PREVIEW_SESSION_ID_PREFIX}${unengagedUserError.details}`,
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
  if (incomingMessagesDetails.size === 0) return WEBHOOK_SUCCESS_MESSAGE;

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
            sessionId: `${WHATSAPP_PREVIEW_SESSION_ID_PREFIX}${from}`,
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
  return WEBHOOK_SUCCESS_MESSAGE;
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
