import { env } from "@typebot.io/env";
import ky, { HTTPError } from "ky";
import { WhatsAppError } from "./WhatsAppError";
import type { WhatsAppCredentials, WhatsAppSendingMessage } from "./schemas";

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
    if (err instanceof HTTPError) {
      throw new WhatsAppError("Error while sending whatsapp message", {
        statusCode: err.response.status,
        data: await err.response.text(),
      });
    }
    throw err;
  }
};
