import { Button } from "@/components/Button";
import {
  PerkListItem,
  PricingCardFooter,
  PricingCardRoot,
} from "./components/pricing-card";

export const EnterprisePlanCard = () => (
  <PricingCardRoot className="pt-10">
    <div className="flex flex-col gap-10 items-center px-12">
      <div className="flex flex-col gap-3">
        <h2>Enterprise</h2>
        <p>
          Ideal for large companies looking to generate leads and automate
          customer support at scale
        </p>
      </div>
      <ul className="flex flex-col gap-3">
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
      <Button variant="ctaSecondary" size="lg">
        Get a quote
      </Button>
    </PricingCardFooter>
  </PricingCardRoot>
);
