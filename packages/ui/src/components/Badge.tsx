import { mergeProps } from "@base-ui-components/react/merge-props";
import { useRender } from "@base-ui-components/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 border border-transparent font-medium whitespace-nowrap transition-shadow outline-hidden focus-visible:ring-2 focus-visible:ring-orange-8 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [button,a&]:cursor-pointer pointer-coarse:[button,a&]:after:absolute pointer-coarse:[button,a&]:after:size-full pointer-coarse:[button,a&]:after:min-h-11 pointer-coarse:[button,a&]:after:min-w-11",
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
        yellow: "bg-yellow-200 text-yellow-900 dark:bg-yellow-500",
        red: "bg-red-4 text-red-10",
        green: "bg-green-4 text-green-10",
        blue: "bg-blue-4 text-blue-10",
      },
      size: {
        default: "px-1 rounded-md text-xs py-0.5",
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
