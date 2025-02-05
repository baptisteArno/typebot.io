import { env } from "@typebot.io/env";

export const sendMessage = async (message: string) => {
  if (!env.MESSAGE_WEBHOOK_URL) return;
  try {
    await fetch(env.MESSAGE_WEBHOOK_URL, {
      method: "POST",
      body: message,
    });
  } catch (error) {
    console.error("Failed to send message", error);
  }
};
