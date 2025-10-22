import { mergeProps } from "@base-ui-components/react/merge-props";
import { useRender } from "@base-ui-components/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 border border-transparent font-medium whitespace-nowrap transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-orange-8 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3 [button,a&]:cursor-pointer [button,a&]:pointer-coarse:after:absolute [button,a&]:pointer-coarse:after:size-full [button,a&]:pointer-coarse:after:min-h-11 [button,a&]:pointer-coarse:after:min-w-11",
  {
    variants: {
      variant: {
        default: "",
        solid: "",
      },
      colorScheme: {
        gray: "bg-gray-4",
        orange: "bg-orange-4 text-orange-10",
        purple: "bg-purple-4 text-purple-9",
        yellow: "bg-yellow-4 text-yellow-9",
        red: "bg-red-4 text-red-10",
        green: "bg-green-4 text-green-10",
        blue: "bg-blue-4 text-blue-10",
      },
      size: {
        default: "px-1 rounded-md text-sm",
      },
    },
    defaultVariants: {
      colorScheme: "gray",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "solid",
        colorScheme: "purple",
        class: "bg-purple-9 text-purple-1",
      },
    ],
  },
);

interface BadgeProps extends useRender.ComponentProps<"span"> {
  colorScheme?: VariantProps<typeof badgeVariants>["colorScheme"];
  size?: VariantProps<typeof badgeVariants>["size"];
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

function Badge({
  className,
  colorScheme,
  size,
  variant,
  render,
  ...props
}: BadgeProps) {
  const defaultProps = {
    "data-slot": "badge",
    className: cn(badgeVariants({ colorScheme, size, variant, className })),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export { Badge, badgeVariants };
