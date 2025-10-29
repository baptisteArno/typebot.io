import { T, useTranslate } from "@tolgee/react";
import { prices } from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ChatsProTiersDialog } from "./ChatsProTiersDialog";
import { FeaturesList } from "./FeaturesList";

type Props = {
  currentPlan: Plan;
  currency?: "usd" | "eur";
  isLoading: boolean;
  onPayClick: () => void;
};

export const ProPlanPricingCard = ({
  currentPlan,
  currency,
  isLoading,
  onPayClick,
}: Props) => {
  const { isOpen, onOpen, onClose } = useOpenControls();
  const { t } = useTranslate();

  const getButtonLabel = () => {
    if (currentPlan === Plan.PRO)
      return t("billing.pricingCard.upgradeButton.current");
    return t("upgrade");
  };

  return (
    <>
      <ChatsProTiersDialog isOpen={isOpen} onClose={onClose} />{" "}
      <div className="flex p-6 relative h-full flex-col flex-1 border rounded-lg shrink-0 border-purple-6">
        <div className="flex justify-center">
          <div className="absolute top-[-10px] bg-purple-9 font-medium text-white text-xs px-2 py-1 rounded-md">
            {t("billing.pricingCard.pro.mostPopularLabel")}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-between h-full">
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-2xl">
              <T
                keyName="billing.pricingCard.heading"
                params={{
                  strong: <span className="text-purple-900">Pro</span>,
                }}
              />
            </h2>
            <p>{t("billing.pricingCard.pro.description")}</p>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2>
                {formatPrice(prices.PRO, { currency })}
                <span className="text-base">
                  {t("billing.pricingCard.perMonth")}
                </span>
              </h2>
              <p className="font-bold">
                <Tooltip.Root>
                  <Tooltip.Trigger className="underline cursor-pointer">
                    {t("billing.pricingCard.pro.everythingFromStarter")}
                  </Tooltip.Trigger>
                  <Tooltip.Popup>
                    <FeaturesList
                      features={[
                        t("billing.pricingCard.starter.brandingRemoved"),
                        t("billing.pricingCard.starter.fileUploadBlock"),
                        t("billing.pricingCard.starter.createFolders"),
                      ]}
                      className="gap-0"
                    />
                  </Tooltip.Popup>
                </Tooltip.Root>

                {t("billing.pricingCard.plus")}
              </p>
              <FeaturesList
                features={[
                  t("billing.pricingCard.pro.includedSeats"),
                  <div className="flex flex-col gap-1" key="starter-chats">
                    <div className="flex items-center gap-0" key="test">
                      <p>10,000 {t("billing.pricingCard.chatsPerMonth")}</p>
                      <MoreInfoTooltip>
                        {t("billing.pricingCard.chatsTooltip")}
                      </MoreInfoTooltip>
                    </div>
                    <p className="text-sm text-gray-8">
                      Extra chats:{" "}
                      <Button size="xs" variant="outline" onClick={onOpen}>
                        See tiers
                      </Button>
                    </p>
                  </div>,
                  t("billing.pricingCard.pro.whatsAppIntegration"),
                  t("billing.pricingCard.pro.customDomains"),
                  t("billing.pricingCard.pro.analytics"),
                ]}
              />
            </div>

            <Button
              variant="secondary"
              onClick={onPayClick}
              disabled={isLoading || currentPlan === Plan.PRO}
            >
              {getButtonLabel()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
