import { mergeProps, useRender } from "@base-ui-components/react";
import * as React from "react";
import { cn } from "../lib/cn";
import { cva, cx, type VariantProps } from "../lib/cva";

const buttonVariants = cva(
  cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer select-none shrink-0",
    "focus-visible:ring-2 focus-visible:ring-orange-8 outline-hidden",
    // We don't use `disabled:` so that the styling works with custom asChild elements
    "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-orange-9 hover:bg-orange-10 active:bg-orange-11 text-gray-1 dark:text-gray-12",
        secondary: "bg-gray-3 hover:bg-gray-4 active:bg-gray-5",
        outline: "bg-transparent border hover:bg-gray-2 active:bg-gray-3",
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
    compoundVariants: [
      {
        size: "xs",
        iconStyle: "auto",
        class: "[&_svg]:size-3",
      },
    ],
  },
);

export interface ButtonProps
  extends useRender.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconStyle, render, ...props }, ref) => {
    const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
      render ? undefined : "button";

    const defaultProps = {
      "data-slot": "button",
      "data-disabled": props.disabled,
      className: cn(buttonVariants({ variant, size, iconStyle, className })),
      type: typeValue,
    };

    return useRender({
      ref,
      defaultTagName: "button",
      render,
      props: mergeProps<"button">(defaultProps, props),
    });
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
