import { Switch as SwitchPrimitive } from "@base-ui-components/react/switch";
import type * as React from "react";
import { cn } from "../lib/cn";
import { cva, type VariantProps } from "../lib/cva";

const switchVariants = cva(
  cn(
    "peer data-[checked]:bg-orange-9 data-[unchecked]:bg-gray-6 focus-visible:ring-orange-9/50 inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  ),
  {
    variants: {
      size: {
        sm: "h-5 w-8 [&_span]:size-4 data-[checked]:[&_span]:translate-x-3 data-[checked]:[&_span]:rtl:-translate-x-3",
        md: "h-6 w-10 [&_span]:size-5 data-[checked]:[&_span]:translate-x-4 data-[checked]:[&_span]:rtl:-translate-x-4",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

export const Switch = ({ className, size, ...props }: SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-white pointer-events-none block rounded-full shadow-xs ring-0 transition-transform data-[unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
};
