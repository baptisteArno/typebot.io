import { Progress as ProgressPrimitive } from "@ark-ui/react/progress";
import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} value={value} {...props}>
    <ProgressPrimitive.Track
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-gray-11/10",
        className,
      )}
    >
      <ProgressPrimitive.Range className="h-full w-full flex-1 bg-primary transition-all bg-orange-9" />
    </ProgressPrimitive.Track>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
