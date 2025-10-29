import { CtaButtonLink } from "@/components/link";
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
      <ul className="flex flex-col gap-3 shrink-0">
        <PerkListItem>Custom chats limit & seats</PerkListItem>
        <PerkListItem>Contract with SLAs</PerkListItem>
        <PerkListItem>
          24/7 support with a designated representative
        </PerkListItem>
        <PerkListItem>SSO & Granular access rights</PerkListItem>
        <PerkListItem>Dedicated IP address</PerkListItem>
        <PerkListItem>ISO 27001 Certified Security</PerkListItem>
        <PerkListItem>Custom Security Questionnaires</PerkListItem>
        <PerkListItem>Custom Features Development (add-on)</PerkListItem>
      </ul>
    </div>
    <PricingCardFooter>
      <CtaButtonLink
        variant="secondary"
        size="lg"
        href={enterpriseLeadTypebotUrl}
      >
        Get a quote
      </CtaButtonLink>
    </PricingCardFooter>
  </PricingCardRoot>
);
