import type { BotContext } from "@/types";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";
import type { RuntimeOptions } from "@typebot.io/bot-engine/schemas/api";
import { StripePaymentForm } from "./StripePaymentForm";

type Props = {
  context: BotContext;
  options: PaymentInputBlock["options"] & RuntimeOptions;
  onSuccess: () => void;
  onTransitionEnd: () => void;
};

export const PaymentForm = (props: Props) => (
  <StripePaymentForm
    onSuccess={props.onSuccess}
    options={props.options}
    context={props.context}
    onTransitionEnd={props.onTransitionEnd}
  />
);
