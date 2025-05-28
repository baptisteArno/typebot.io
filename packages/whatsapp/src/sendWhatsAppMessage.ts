import * as Sentry from "@sentry/nextjs";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import ky from "ky";
import type { WhatsAppSendingMessage } from "./schemas";

type Props = {
  to: string;
  message: WhatsAppSendingMessage;
  credentials: WhatsAppCredentials["data"];
};

export const sendWhatsAppMessage = async ({
  to,
  message,
  credentials,
}: Props) => {
  try {
    await ky.post(
      `${env.WHATSAPP_CLOUD_API_URL}/v21.0/${credentials.phoneNumberId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${credentials.systemUserAccessToken}`,
        },
        json: {
          messaging_product: "whatsapp",
          to,
          ...message,
        },
      },
    );
  } catch (err) {
    Sentry.addBreadcrumb({
      message: JSON.stringify(message),
    });
    throw err;
  }
};
