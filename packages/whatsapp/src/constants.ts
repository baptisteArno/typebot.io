export const WEBHOOK_SUCCESS_MESSAGE = "Message received" as const;
export const WHATSAPP_SESSION_ID_PREFIX = "wa-" as const;
export const WHATSAPP_PREVIEW_SESSION_ID_PREFIX = "wa-preview-" as const;

export const incomingWebhookErrorCodes = {
  "Could not send message to unengaged user": 131047,
  "Message undeliverable": 131026,
  "Media upload error": 131053,
};

export const dialog360BaseUrl = "https://waba-v2.360dialog.io";
export const dialog360AuthHeaderName = "D360-API-KEY";
