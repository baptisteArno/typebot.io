import { cn } from "@typebot.io/ui/lib/cn";
import * as React from "react";

const Progress = React.forwardRef<
  React.ElementRef<"div">,
  { value: number; className?: string }
>(({ value, className }, ref) => (
  <div
    role="progressbar"
    className={cn(
      "h-1 w-full overflow-hidden rounded-full bg-gray-11/10",
      className,
    )}
    ref={ref}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    aria-valuetext={`${value}%`}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all bg-orange-9"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
