import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import { sendRequest } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";

export const createPaymentIntentQuery = ({
  apiHost,
  isPreview,
  inputOptions,
  variables,
}: {
  inputOptions: PaymentInputBlock["options"];
  apiHost: string;
  variables: Variable[];
  isPreview: boolean;
}) =>
  sendRequest<{ clientSecret: string; publicKey: string; amountLabel: string }>(
    {
      url: `${apiHost}/api/integrations/stripe/createPaymentIntent`,
      method: "POST",
      body: { inputOptions, isPreview, variables },
    },
  );
