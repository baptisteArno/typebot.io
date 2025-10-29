import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type { ReactNode } from "react";

export const PricingCardFooter = ({ children }: { children: ReactNode }) => (
  <div className="border-t w-full py-6 flex justify-center">{children}</div>
);

export const PricingCardRoot = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl border bg-card text-card-foreground flex flex-col relative isolate items-center justify-between w-full pt-20 gap-10",
      className,
    )}
  >
    {children}
  </div>
);

export const PlanNamePill = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-b-lg text-white p-1.5 uppercase font-bold text-xs px-4",
      className,
    )}
  >
    {children}
  </div>
);

export const PerkListItem = ({ children }: { children: ReactNode }) => (
  <li className="flex gap-3">
    <CheckTag className="mt-1 shrink-0" />
    {children}
  </li>
);

const CheckTag = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-full size-4 bg-stone-950 flex items-center justify-center",
      className,
    )}
  >
    <TickIcon className="text-white p-0.5" />
  </div>
);
