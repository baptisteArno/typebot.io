import * as React from "react";
import { cn } from "../lib/cn";
import { type VariantProps, cva } from "../lib/cva";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors data-[focus-visible]:ring-1 data-[focus-visible]:ring-orange-8 data-[aria-disabled=true]:pointer-events-none data-[aria-disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-orange-9 hover:bg-orange-10 active:bg-orange-11 text-gray-1",
        secondary: "bg-gray-3 hover:bg-gray-4 active:bg-gray-5",
        outline: "bg-transparent border border-gray-8 text-gray-12",
        ghost: "text-gray-12 bg-transparent hover:bg-gray-4 active:bg-gray-5",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "text-white bg-gradient-to-b border border-[#C4461D] from-[#FF8963] to-[#FF5A25] to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.25)] active:from-[#E44A19] active:to-[#EF744C] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-2px_2px_0_rgba(255,255,255,0.17)] before:bg-transparent hover:before:bg-white/50 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2]",
        ctaSecondary:
          "text-white bg-gradient-to-b border border-gray-12 from-[#282828] to-gray-12 to-[57%] shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.10)] active:from-gray-12 active:to-[#282828] active:from-[43%] active:to-[100%] active:shadow-[inset_0_-3px_2px_0_rgba(255,255,255,0.10)] before:bg-transparent hover:before:bg-white/30 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-[1/2] ",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 px-2 rounded-md text-xs",
        sm: "h-8 rounded-md px-3 text-sm",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  const buttonElement = (
    <button
      className={cn(
        buttonVariants({ variant, size, className }),
        variant?.includes("cta") && "w-full",
      )}
      ref={ref}
      {...props}
    />
  );

  if (variant === "cta" || variant === "ctaSecondary")
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg relative isolate",
          (size === "sm" || size === "xs") && "rounded-md",
        )}
      >
        {buttonElement}
      </div>
    );

  return buttonElement;
});

export { Button, buttonVariants };
