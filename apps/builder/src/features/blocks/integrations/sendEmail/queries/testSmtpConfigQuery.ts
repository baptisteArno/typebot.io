import type { SmtpCredentials } from "@typebot.io/credentials/schemas";
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
