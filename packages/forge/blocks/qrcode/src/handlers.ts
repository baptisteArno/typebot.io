import { createActionHandler } from "@typebot.io/forge";
import { createId } from "@typebot.io/lib/createId";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import QRCode from "qrcode";
import { generateQrCode } from "./actions/generateQrCodeImage";

export default [
  createActionHandler(generateQrCode, {
    server: async ({ options, variables, logs }) => {
      if (!options.data)
        return logs.add(
          "QR code data is empty. Please provide the data to be encoded into the QR code.",
        );
      if (!options.saveUrlInVariableId)
        return logs.add(
          "QR code image URL is not specified. Please select a variable to save the generated QR code image.",
        );

      const url = await uploadFileToBucket({
        file: await QRCode.toBuffer(options.data),
        key: `tmp/qrcodes/${createId() + createId()}.png`,
        mimeType: "image/png",
      });

      variables.set([{ id: options.saveUrlInVariableId, value: url }]);
    },
  }),
];
