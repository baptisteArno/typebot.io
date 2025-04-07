import * as React from "react";
import { cn } from "../lib/cn";
import { cva } from "../lib/cva";

export const inputVariants = cva(
  "flex relative w-full overflow-visible rounded-md border transition-[box-shadow,border-color] border-input bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-orange-8 focus:ring-2 focus:border-transparent focus:z-10 hover:border-gray-7",
  {
    variants: {
      variant: {
        default: "h-10 px-3 py-1 text-base",
        noSize: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: "default" }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
