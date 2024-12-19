import { TextLink } from "@/components/TextLink";
import { LeafIcon } from "@typebot.io/ui/icons/LeafIcon";

export const PricingHeading = () => (
  <div className="flex flex-col gap-6 pt-12">
    <h1>Flexible plans that scale with you</h1>
    <p>
      Whether you're a{" "}
      <span className="text-orange-9 font-bold">solo business owner</span>, a{" "}
      <span className="text-purple-9 font-bold">growing startup</span> or a{" "}
      <span className="font-bold">large company</span>, Typebot is here to help
      you build high-performing chat forms for the right price. Pay for as
      little or as much usage as you need.
    </p>
    <div className="flex items-center gap-6 p-4 bg-gray-1 rounded-2xl border border-gray-6">
      <LeafIcon className="size-16" />
      <p className="text-gray-11 text-sm">
        Typebot is contributing 1% of your subscription to remove CO₂ from the
        atmosphere.{" "}
        <TextLink href="" target="_blank" size="sm">
          More info
        </TextLink>
      </p>
    </div>
  </div>
);
