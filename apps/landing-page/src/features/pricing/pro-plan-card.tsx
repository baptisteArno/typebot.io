import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { ButtonLink } from "@/components/link";
import { registerUrl } from "@/constants";
import {
  chatsLimits,
  prices,
  seatsLimits,
} from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import {
  PerkListItem,
  PlanNamePill,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";
import { chatsTooltip } from "./constants";

export const ProPlanCard = ({ children }: { children?: React.ReactNode }) => (
  <PricingCardRoot className="border-purple-8 border-4">
    <PlanNamePill className="bg-purple-8 absolute top-0 flex flex-col">
      Pro
    </PlanNamePill>
    <div className="flex flex-col gap-10 items-center">
      <h2>
        {formatPrice(prices.PRO)}
        <span className="text-lg">/month</span>
      </h2>
      {children}
    </div>
    <PricingCardFooter>
      <ButtonLink
        variant="ctaSecondary"
        size="lg"
        href={`${registerUrl}?subscribePlan=${Plan.PRO}`}
      >
        Subscribe now
      </ButtonLink>
    </PricingCardFooter>
  </PricingCardRoot>
);

type ProPerksListProps = {
  onChatsTiersClick: () => void;
};

export const ProPerksList = ({ onChatsTiersClick }: ProPerksListProps) => (
  <ul className="flex flex-col gap-3">
    <PerkListItem>All Starter plan features and...</PerkListItem>
    <PerkListItem>
      <span>
        <span className="font-bold">{seatsLimits.PRO} seats</span> included
      </span>
    </PerkListItem>
    <PerkListItem>
      <div className="flex flex-col gap-1">
        <span className="inline-flex gap-1">
          <span className="font-bold">
            {new Intl.NumberFormat().format(chatsLimits.PRO)} chats
          </span>
          /months
          <MoreInfoTooltip>{chatsTooltip}</MoreInfoTooltip>
        </span>
        <span className="text-xs text-gray-11">
          Extra chats:{" "}
          <Button size="xs" variant="outline" onClick={onChatsTiersClick}>
            See tiers
          </Button>
        </span>
      </div>
    </PerkListItem>
    <PerkListItem>WhatsApp integration</PerkListItem>
    <PerkListItem>Custom domains</PerkListItem>
    <PerkListItem>In-depth analytics</PerkListItem>
  </ul>
);
