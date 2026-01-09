import { generateVerificationToken } from "./generateVerificationToken";
import { getPhoneNumber } from "./getPhoneNumber";
import { getSystemTokenInfo } from "./getSystemTokenInfo";
import { getWhatsAppMedia } from "./getWhatsAppMedia";
import { getWhatsAppMediaPreview } from "./getWhatsAppMediaPreview";
import { startWhatsAppPreview } from "./startWhatsAppPreview";
import { subscribePreviewWebhook } from "./subscribePreviewWebhook";
import { verifyIfPhoneNumberAvailable } from "./verifyIfPhoneNumberAvailable";

export const internalWhatsAppRouter = {
  getPhoneNumber,
  getSystemTokenInfo,
  verifyIfPhoneNumberAvailable,
  generateVerificationToken,
  getWhatsAppMedia,
  getWhatsAppMediaPreview,
};

export const publicWhatsAppRouter = {
  startWhatsAppPreview,
  subscribePreviewWebhook,
};
