import { Leaf01Icon } from "@typebot.io/ui/icons/Leaf01Icon";
import { TextLink } from "@/components/link";
import { stripeClimateUrl } from "@/constants";

export const PricingHeading = () => (
  <div className="flex flex-col gap-8 items-start">
    <ClimatePledgeCard />
    <h1>Flexible plans that scale with you</h1>
    <p className="max-w-2xl">
      Whether you're a{" "}
      <span className="text-primary font-bold">solo business owner</span>, a{" "}
      <span className="text-violet-500 font-bold">growing startup</span> or a{" "}
      <span className="font-bold">large company</span>, Typebot is here to help
      you build high-performing chat forms for the right price. Pay for as
      little or as much usage as you need.
    </p>
  </div>
);

const ClimatePledgeCard = () => (
  <div className="flex items-center gap-4 p-4 bg-card rounded-xl border max-w-4xl">
    <Leaf01Icon className="size-6 shrink-0" />
    <p className="text-sm">
      Typebot is contributing 1% of your subscription to remove CO₂ from the
      atmosphere.{" "}
      <TextLink href={stripeClimateUrl} target="_blank" size="sm">
        More info
      </TextLink>
    </p>
  </div>
);
