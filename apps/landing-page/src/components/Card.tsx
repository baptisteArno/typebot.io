import { isDefined } from "@typebot.io/lib/utils";
import { cn } from "@typebot.io/ui/lib/cn";
import * as React from "react";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-gray-1 dark:bg-gray-2 text-gray-12 flex flex-col gap-3 p-5",
      className,
      isDefined(props.onClick ? "border-gray-7" : "border-gray-6"),
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
