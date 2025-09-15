import type { WhatsAppWebhookRequestBody } from "./schemas";

type ExtractedError = { code: number; message: string; details: string };

export const extractErrorsFromEntry = (
  entry: WhatsAppWebhookRequestBody["entry"],
): ExtractedError[] => {
  const errors: ExtractedError[] = [];
  for (const { changes } of entry) {
    for (const { value } of changes) {
      if (!value.errors) continue;
      for (const error of value.errors) {
        errors.push({
          code: error.code,
          message: error.message ?? error.title,
          details: error.error_data.details,
        });
      }
    }
  }
  return errors;
};
