import { PaymentProvider } from "@typebot.io/blocks-inputs/payment/constants";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import { StripePaymentForm } from "./StripePaymentForm";

type Props = {
  onSuccess: () => void;
  options: PaymentInputBlock["options"];
};

export const PaymentForm = ({ onSuccess, options }: Props): JSX.Element => {
  switch (options?.provider) {
    case undefined:
    case PaymentProvider.STRIPE:
      return <StripePaymentForm onSuccess={onSuccess} options={options} />;
  }
};
