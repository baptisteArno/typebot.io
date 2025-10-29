import { Radio as RadioPrimitive } from "@base-ui-components/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui-components/react/radio-group";
import { cn } from "../lib/cn";

export const RadioGroup = ({
  className,
  ...props
}: RadioGroupPrimitive.Props) => {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex gap-1", className)}
      {...props}
    />
  );
};

export const Radio = ({ className, ...props }: RadioPrimitive.Root.Props) => {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border bg-gray-1 bg-clip-padding transition-[box-shadow,border-color] outline-hidden before:pointer-events-none before:absolute before:inset-0 before:rounded-full not-disabled:not-aria-invalid:not-data-checked:before:shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-64 aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 dark:bg-clip-border dark:shadow-black/24 dark:not-data-checked:bg-input/32 dark:not-disabled:not-data-checked:shadow-xs dark:not-disabled:not-aria-invalid:not-data-checked:before:shadow-[0_-1px_--theme(--color-white/8%)] dark:aria-invalid:ring-destructive/24",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-indicator"
        className="absolute -inset-px flex size-4 items-center justify-center rounded-full before:size-1.5 before:rounded-full before:bg-white data-checked:bg-orange-9 data-unchecked:hidden"
      />
    </RadioPrimitive.Root>
  );
};
