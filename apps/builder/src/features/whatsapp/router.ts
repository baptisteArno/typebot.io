import { router } from "@/helpers/server/trpc";
import { generateVerificationToken } from "./generateVerificationToken";
import { getPhoneNumber } from "./getPhoneNumber";
import { getSystemTokenInfo } from "./getSystemTokenInfo";
import { receiveMessagePreview } from "./receiveMessagePreview";
import { startWhatsAppPreview } from "./startWhatsAppPreview";
import { subscribePreviewWebhook } from "./subscribePreviewWebhook";
import { verifyIfPhoneNumberAvailable } from "./verifyIfPhoneNumberAvailable";

export const internalWhatsAppRouter = router({
  getPhoneNumber,
  getSystemTokenInfo,
  verifyIfPhoneNumberAvailable,
  generateVerificationToken,
});

export const publicWhatsAppRouter = router({
  startWhatsAppPreview,
  subscribePreviewWebhook,
  receiveMessagePreview,
});
