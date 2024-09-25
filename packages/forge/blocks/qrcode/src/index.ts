import { createBlock } from "@typebot.io/forge";
import { generateQrCode } from "./actions/generateQrCodeImage";
import { QrCodeLogo } from "./logo";

export const qrCodeBlock = createBlock({
  id: "qr-code",
  name: "QR code",
  tags: [],
  LightLogo: QrCodeLogo,
  actions: [generateQrCode],
});
