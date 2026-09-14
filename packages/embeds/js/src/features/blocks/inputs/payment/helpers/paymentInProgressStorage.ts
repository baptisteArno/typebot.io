import {
  parsePaymentInProgress,
  paymentInProgressStorageKey,
} from "@typebot.io/chat-api/parsePaymentInProgress";
import type { StartChatResponse } from "@typebot.io/chat-api/schemas";

export const setPaymentInProgressInStorage = (
  state: Pick<
    StartChatResponse,
    "typebot" | "sessionId" | "resultId" | "previewWebhookRoom"
  > & { isPreview?: boolean },
) => {
  sessionStorage.setItem(paymentInProgressStorageKey, JSON.stringify(state));
};

export const getPaymentInProgressInStorage = () => {
  try {
    return parsePaymentInProgress(
      sessionStorage.getItem(paymentInProgressStorageKey),
    );
  } catch {
    return;
  }
};

export const removePaymentInProgressFromStorage = () => {
  sessionStorage.removeItem(paymentInProgressStorageKey);
};
