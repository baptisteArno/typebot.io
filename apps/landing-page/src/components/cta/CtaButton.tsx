import { buttonVariants } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import { type VariantProps, cva } from "@typebot.io/ui/lib/cva";
import * as React from "react";

export const ctaButtonVariants = cva("", {
  variants: {
    variant: {
      default:
        "text-white bg-gradient-to-b border border-[#C4461D] from-[#FF8963] to-[#FF5A25] to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.25)] active:from-[#E44A19] active:to-[#EF744C] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-2px_2px_0_rgba(255,255,255,0.17)] before:bg-transparent hover:before:bg-white/50 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2]",
      secondary:
        "text-white bg-gradient-to-b border border-gray-12 from-[#282828] to-gray-12 to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.10)] active:from-gray-12 active:to-[#282828] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-3px_2px_0_rgba(255,255,255,0.10)] before:bg-transparent hover:before:bg-white/30 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2] ",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "variant">,
    VariantProps<typeof ctaButtonVariants> {}

export const CtaButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, ...props }, ref) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg relative isolate",
          (size === "sm" || size === "xs") && "rounded-md",
        )}
      >
        <button
          className={cn(
            buttonVariants({ size }),
            ctaButtonVariants({ variant }),
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
