import * as Sentry from "@sentry/nextjs";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import ky from "ky";

type Props = {
  messageId: string;
  credentials: WhatsAppCredentials["data"];
};

export const sendWhatsAppTypingIndicator = async ({
  messageId,
  credentials,
}: Props) => {
  try {
    const json = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: {
        type: "text",
      },
    };

    if (credentials.provider === "360dialog") {
      return;
      // await ky.post(`${dialog360BaseUrl}/messages`, {
      //   headers: {
      //     [dialog360AuthHeaderName]: credentials.apiKey,
      //   },
      //   json,
      // });
    } else {
      await ky.post(
        `${env.WHATSAPP_CLOUD_API_URL}/v21.0/${credentials.phoneNumberId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${credentials.systemUserAccessToken}`,
          },
          json,
        },
      );
    }
  } catch (err) {
    // Typing indicators are non-critical, log the error but don't throw
    Sentry.captureException(err, {
      tags: {
        context: "whatsapp-typing-indicator",
      },
      extra: {
        messageId,
      },
    });
  }
};
