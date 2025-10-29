import { T, useTranslate } from "@tolgee/react";
import { prices } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { FeaturesList } from "./FeaturesList";

type Props = {
  currentPlan: Plan;
  currency?: "eur" | "usd";
  isLoading?: boolean;
  onPayClick: () => void;
};

export const StarterPlanPricingCard = ({
  currentPlan,
  isLoading,
  currency,
  onPayClick,
}: Props) => {
  const { t } = useTranslate();

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO) return t("downgrade");
    if (currentPlan === Plan.STARTER)
      return t("billing.pricingCard.upgradeButton.current");
    return t("upgrade");
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-lg border flex-1 h-full justify-between pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl">
              <T
                keyName="billing.pricingCard.heading"
                params={{
                  strong: <span className="text-orange-9">Starter</span>,
                }}
              />
            </h2>
            <p>{t("billing.pricingCard.starter.description")}</p>
          </div>
          <h2>
            {formatPrice(prices.STARTER, { currency })}
            <span className="text-base">
              {t("billing.pricingCard.perMonth")}
            </span>
          </h2>
        </div>

        <FeaturesList
          features={[
            t("billing.pricingCard.starter.includedSeats"),
            <div className="flex flex-col gap-0" key="starter-chats">
              <div className="flex items-center gap-0">
                <p>2,000 {t("billing.pricingCard.chatsPerMonth")}</p>
                <MoreInfoTooltip>
                  {t("billing.pricingCard.chatsTooltip")}
                </MoreInfoTooltip>
              </div>
              <p className="text-sm text-gray-8">Extra chats: $10 per 500</p>
            </div>,
            t("billing.pricingCard.starter.brandingRemoved"),
            t("billing.pricingCard.starter.fileUploadBlock"),
            t("billing.pricingCard.starter.createFolders"),
            "Direct priority support",
          ]}
        />
      </div>
      <Button
        variant="secondary"
        onClick={onPayClick}
        disabled={isLoading || currentPlan === Plan.STARTER}
      >
        {getButtonLabel()}
      </Button>
    </div>
  );
};
