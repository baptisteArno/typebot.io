import { chatsLimits } from "@typebot.io/billing/constants";
import { CtaButtonLink } from "@/components/link";
import { registerUrl } from "@/constants";
import {
  PerkListItem,
  PlanNamePill,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";

export const FreePlanCard = ({ children }: { children?: React.ReactNode }) => (
  <PricingCardRoot>
    <PlanNamePill className="bg-gray-12 absolute top-0">Personal</PlanNamePill>
    <div className="flex flex-col gap-10 items-center">
      <h2>Free</h2>
      {children}
    </div>

    <PricingCardFooter>
      <CtaButtonLink href={registerUrl} variant="secondary" size="lg">
        Get started
      </CtaButtonLink>
    </PricingCardFooter>
  </PricingCardRoot>
);

export const FreePlanPerksList = () => (
  <ul className="flex flex-col gap-3">
    <PerkListItem>Unlimited typebots</PerkListItem>
    <PerkListItem>
      <span>
        <span className="font-bold">
          {new Intl.NumberFormat().format(chatsLimits.FREE)} chats
        </span>
        /months
      </span>
    </PerkListItem>
    <PerkListItem>Native integrations</PerkListItem>
    <PerkListItem>Webhooks</PerkListItem>
    <PerkListItem>Custom Javascript & CSS</PerkListItem>
    <PerkListItem>Community support & Docs</PerkListItem>
  </ul>
);
