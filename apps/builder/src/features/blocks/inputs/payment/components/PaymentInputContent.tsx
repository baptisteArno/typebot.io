import { useTranslate } from "@tolgee/react";
import { defaultPaymentInputOptions } from "@typebot.io/blocks-inputs/payment/constants";
import type { PaymentInputBlock } from "@typebot.io/blocks-inputs/payment/schema";

type Props = {
  block: PaymentInputBlock;
};

export const PaymentInputContent = ({ block }: Props) => {
  const { t } = useTranslate();

  if (!block.options?.amount || !block.options.credentialsId)
    return <p color="gray.500">{t("configure")}</p>;
  return (
    <p className="pr-6 truncate">
      {t("blocks.inputs.payment.collect.label")} {block.options.amount}{" "}
      {block.options.currency ?? defaultPaymentInputOptions.currency}
    </p>
  );
};
