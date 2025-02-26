import type { LogInSession } from "@typebot.io/logs/schemas";
import {
  webhookErrorDescription,
  webhookSuccessDescription,
} from "../blocks/integrations/httpRequest/executeHttpRequestBlock";
import {
  sendEmailErrorDescription,
  sendEmailSuccessDescription,
} from "../blocks/integrations/sendEmail/executeSendEmailBlock";

export const filterPotentiallySensitiveLogs = (log: LogInSession) =>
  ![
    webhookErrorDescription,
    webhookSuccessDescription,
    sendEmailErrorDescription,
    sendEmailSuccessDescription,
  ].includes(log.description);
