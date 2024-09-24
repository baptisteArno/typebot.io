import type { SmtpCredentials } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { sendRequest } from "@typebot.io/lib/utils";

export const testSmtpConfig = (smtpData: SmtpCredentials["data"], to: string) =>
  sendRequest({
    method: "POST",
    url: "/api/integrations/email/test-config",
    body: {
      ...smtpData,
      to,
    },
  });
