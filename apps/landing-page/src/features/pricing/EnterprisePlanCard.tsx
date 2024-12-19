import { ButtonLink } from "@/components/link";
import { enterpriseLeadTypebotUrl } from "@/constants";
import {
  PerkListItem,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";

export const EnterprisePlanCard = () => (
  <PricingCardRoot className="pt-10 max-w-4xl">
    <div className="flex flex-col md:flex-row gap-10 items-center px-12">
      <div className="flex flex-col gap-3">
        <h2>Enterprise</h2>
        <p>
          Ideal for large companies looking to generate leads and automate
          customer support at scale
        </p>
      </div>
      <ul className="flex flex-col gap-3 flex-shrink-0">
        <PerkListItem>
          Yearly contract with dedicated support representative
        </PerkListItem>
        <PerkListItem>
          Custom chats limit & seats for all your team
        </PerkListItem>
        <PerkListItem>SSO & Granular access rights</PerkListItem>
        <PerkListItem>Custom features development (add-on)</PerkListItem>
      </ul>
    </div>
    <PricingCardFooter>
      <ButtonLink
        variant="ctaSecondary"
        size="lg"
        href={enterpriseLeadTypebotUrl}
      >
        Get a quote
      </ButtonLink>
    </PricingCardFooter>
  </PricingCardRoot>
);
