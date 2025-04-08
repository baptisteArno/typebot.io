import { cn } from "@typebot.io/ui/lib/cn";
import { type VariantProps, cva } from "@typebot.io/ui/lib/cva";
import * as React from "react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors data-[focus-visible]:ring-1 data-[focus-visible]:ring-orange-8 data-[aria-disabled=true]:pointer-events-none data-[aria-disabled=true]:opacity-50 [&_svg]:pointer-events-none  [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-orange-9 hover:bg-orange-10 active:bg-orange-11 text-gray-1",
        secondary: "bg-gray-3 hover:bg-gray-4 active:bg-gray-5",
        outline: "bg-transparent border border-gray-9 text-gray-11",
        ghost: "hover:bg-gray-4 active:bg-gray-5",
      },
      size: {
        default: "h-9 w-9 [&_svg]:size-4",
        lg: "h-11 w-11 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface IconButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  ["aria-label"]: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function Button({ className, variant, size, ...props }, ref) {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

export { IconButton, iconButtonVariants };
