import { cn } from "@typebot.io/ui/lib/cn";
import * as React from "react";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card text-card-foreground flex flex-col gap-3 p-5",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
