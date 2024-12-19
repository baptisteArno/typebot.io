import { Button } from "@/components/Button";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import {
  chatsLimits,
  prices,
  seatsLimits,
} from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { useState } from "react";
import { TiersDialog } from "./TiersDialog";
import {
  PerkListItem,
  PlanNamePill,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";

export const ProPlanCard = () => {
  const [open, setOpen] = useState(false);

  const openTiersDialog = () => setOpen(true);
  const closeTiersDialog = () => setOpen(false);

  return (
    <PricingCardRoot className="border-purple-8 border-4">
      <PlanNamePill className="bg-purple-8 absolute top-0 flex flex-col">
        Pro
      </PlanNamePill>
      <div className="flex flex-col gap-10 items-center">
        <h2>
          {formatPrice(prices.PRO)}
          <span className="text-lg">/month</span>
        </h2>
        <ul className="flex flex-col gap-3">
          <PerkListItem>All Starter plan features and...</PerkListItem>
          <PerkListItem>
            <span>
              <span className="font-bold">{seatsLimits.PRO} seats</span>{" "}
              included
            </span>
          </PerkListItem>
          <PerkListItem>
            <div className="flex flex-col gap-1">
              <span className="inline-flex gap-1">
                <span className="font-bold">
                  {new Intl.NumberFormat().format(chatsLimits.PRO)} chats
                </span>
                /months
                <MoreInfoTooltip>
                  A chat is counted whenever a user starts a discussion. It is
                  independant of the number of messages he sends and receives.
                </MoreInfoTooltip>
              </span>
              <span className="text-xs text-gray-11">
                Extra chats:{" "}
                <Button size="xs" variant="outline" onClick={openTiersDialog}>
                  See tiers
                </Button>
                <TiersDialog open={open} onClose={closeTiersDialog} />
              </span>
            </div>
          </PerkListItem>
          <PerkListItem>WhatsApp integration</PerkListItem>
          <PerkListItem>Custom domains</PerkListItem>
          <PerkListItem>In-depth analytics</PerkListItem>
        </ul>
      </div>
      <PricingCardFooter>
        <Button variant="ctaSecondary" size="lg">
          Subscribe now
        </Button>
      </PricingCardFooter>
    </PricingCardRoot>
  );
};
