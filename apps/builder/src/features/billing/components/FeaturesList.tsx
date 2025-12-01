import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type { JSX } from "react";

type FeaturesListProps = {
  features: (string | JSX.Element)[];
  className?: string;
};

export const FeaturesList = ({ features, className }: FeaturesListProps) => (
  <ul className={cn("list-none gap-2 flex flex-col", className)}>
    {features.map((feat, idx) => (
      <li className="flex" key={idx}>
        <TickIcon className="size-6" />
        {feat}
      </li>
    ))}
  </ul>
);
