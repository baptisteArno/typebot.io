import { Progress as ProgressPrimitive } from "@base-ui-components/react/progress";
import { cn } from "../lib/cn";

function Root({ className, children, ...props }: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    >
      {children ? (
        children
      ) : (
        <Track>
          <Indicator />
        </Track>
      )}
    </ProgressPrimitive.Root>
  );
}

function Label({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      data-slot="progress-label"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function Track({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      data-slot="progress-track"
      className={cn(
        "block h-1.5 w-full overflow-hidden rounded-full bg-gray-3",
        className,
      )}
      {...props}
    />
  );
}

function Indicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("bg-orange-9 transition-all duration-500", className)}
      {...props}
    />
  );
}

function Value({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      data-slot="progress-value"
      className={cn("text-sm tabular-nums", className)}
      {...props}
    />
  );
}

export const Progress = {
  Root,
  Label,
  Track,
  Indicator,
  Value,
};
