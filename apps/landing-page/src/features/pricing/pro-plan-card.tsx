import {
  chatsLimits,
  prices,
  seatsLimits,
} from "@typebot.io/billing/constants";
import { formatPrice } from "@typebot.io/billing/helpers/formatPrice";
import { Plan } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { CtaButtonLink } from "@/components/link";
import { registerUrl } from "@/constants";
import {
  PerkListItem,
  PlanNamePill,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";
import { chatsTooltip } from "./constants";

export const ProPlanCard = ({ children }: { children?: React.ReactNode }) => (
  <PricingCardRoot className="border-violet-400 border-4">
    <PlanNamePill className="bg-violet-400 text-white absolute top-0 flex flex-col">
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
      <CtaButtonLink
        variant="secondary"
        size="lg"
        href={`${registerUrl}?subscribePlan=${Plan.PRO}`}
      >
        Subscribe now
      </CtaButtonLink>
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
        <span className="inline-flex">
          <span className="font-bold">
            {new Intl.NumberFormat().format(chatsLimits.PRO)} chats
          </span>
          /months
          <MoreInfoTooltip>{chatsTooltip}</MoreInfoTooltip>
        </span>
        <span className="text-xs text-muted-foreground">
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
