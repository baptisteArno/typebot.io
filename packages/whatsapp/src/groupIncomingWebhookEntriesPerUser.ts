import type {
  WhatsAppIncomingMessage,
  WhatsAppMessageReferral,
  WhatsAppWebhookRequestBody,
} from "./schemas";

type PhoneNumberId = string;
type From = string;

type ParsedEntry = {
  receivedMessages: WhatsAppIncomingMessage;
  contactName: string;
  contactPhoneNumber: string;
  phoneNumberId: string;
  referral?: WhatsAppMessageReferral;
};

export const groupIncomingWebhookEntriesPerUser = (
  entry: WhatsAppWebhookRequestBody["entry"],
): Map<PhoneNumberId, Map<From, ParsedEntry[]>> => {
  const result = new Map<PhoneNumberId, Map<From, ParsedEntry[]>>();

  for (const { changes } of entry) {
    for (const change of changes) {
      // Only interested in incoming messages
      if (!change.value.messages) continue;

      for (const message of change.value.messages) {
        const phoneNumberId = change.value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const from = message.from ?? "";
        if (!from) continue;

        if (message.type === "reaction") continue;

        const details = {
          receivedMessages: message,
          contactName: change.value.contacts?.at(0)?.profile?.name ?? "",
          contactPhoneNumber: from,
          phoneNumberId,
          referral: message.referral,
        };

        if (!result.has(phoneNumberId)) {
          result.set(phoneNumberId, new Map());
        }

        const fromMap = result.get(phoneNumberId)!;
        if (!fromMap.has(from)) {
          fromMap.set(from, []);
        }

        fromMap.get(from)!.push(details);
      }
    }
  }

  return result;
};
