import {
  webhookErrorDescription,
  webhookSuccessDescription,
} from "../blocks/integrations/httpRequest/executeHttpRequestBlock";
import {
  sendEmailErrorDescription,
  sendEmailSuccessDescription,
} from "../blocks/integrations/sendEmail/executeSendEmailBlock";

export const filterPotentiallySensitiveLogs = (log: {
  status: string;
  description: string;
  details?: unknown;
}) =>
  ![
    webhookErrorDescription,
    webhookSuccessDescription,
    sendEmailErrorDescription,
    sendEmailSuccessDescription,
  ].includes(log.description);
