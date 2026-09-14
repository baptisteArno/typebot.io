import type { StartChatResponse } from "./schemas";

export const parsePaymentInProgress = (value: string | null) => {
  if (!value) return;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isPaymentInProgress(parsed)) return;
    return {
      sessionId: parsed.sessionId,
      resultId: parsed.resultId,
      typebot: parsed.typebot,
      previewWebhookRoom: parsed.previewWebhookRoom,
      isPreview: parsed.isPreview,
    };
  } catch {
    return;
  }
};

export const paymentInProgressStorageKey = "typebotPaymentInProgress";

// This state is written by the embed. Check its storage envelope without
// shipping the server's theme/settings/block schema graph to customer pages.
const isPaymentInProgress = (
  value: unknown,
): value is Pick<
  StartChatResponse,
  "sessionId" | "resultId" | "typebot" | "previewWebhookRoom"
> & { isPreview?: boolean } =>
  isRecord(value) &&
  typeof value.sessionId === "string" &&
  (value.resultId === undefined || typeof value.resultId === "string") &&
  (value.previewWebhookRoom === undefined ||
    typeof value.previewWebhookRoom === "string") &&
  (value.isPreview === undefined || typeof value.isPreview === "boolean") &&
  isRecord(value.typebot) &&
  typeof value.typebot.id === "string" &&
  typeof value.typebot.version === "string" &&
  isRecord(value.typebot.theme) &&
  isRecord(value.typebot.settings);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
