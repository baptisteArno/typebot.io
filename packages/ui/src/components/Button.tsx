import * as React from "react";
import { cn } from "../lib/cn";
import { cva, cx, type VariantProps } from "../lib/cva";

const buttonVariants = cva(
  cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer select-none flex-shrink-0",
    "focus-visible:ring-2 focus-visible:ring-orange-8 outline-none",
    // We don't use `disabled:` so that the styling works with custom asChild elements
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-orange-9 hover:bg-orange-10 active:bg-orange-11 text-gray-1 dark:text-gray-12",
        secondary: "bg-gray-3 hover:bg-gray-4 active:bg-gray-5",
        outline: "bg-transparent border border-orange-8 text-orange-11",
        "outline-secondary":
          "bg-transparent border border-gray-7 text-gray-12 hover:bg-gray-2 active:bg-gray-4",
        ghost:
          "text-gray-12 bg-transparent hover:bg-gray-4 active:bg-gray-5 border border-transparent",
        destructive:
          "bg-red-9 hover:bg-red-10 active:bg-red-11 text-gray-1 dark:text-gray-12",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3",
        lg: "h-11 px-6 rounded-lg text-base",
        icon: "size-9 leading-none",
      },
      iconStyle: {
        auto: "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconStyle: "auto",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconStyle, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={cn(buttonVariants({ variant, size, iconStyle }), className)}
        data-disabled={props.disabled}
      />
    );
  },
);

export { Button, buttonVariants };
