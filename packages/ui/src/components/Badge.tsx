import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        solid: "",
      },
      colorScheme: {
        gray: "bg-gray-4 [a]:hover:bg-gray-5",
        orange:
          "bg-orange-4 text-orange-10 [a]:hover:bg-orange-5 dark:text-orange-11",
        purple:
          "bg-purple-4 text-purple-9 [a]:hover:bg-purple-5 dark:text-purple-10",
        yellow:
          "bg-yellow-200 text-yellow-900 [a]:hover:bg-yellow-300 dark:bg-yellow-500 dark:text-yellow-950",
        red: "bg-red-4 text-red-10 [a]:hover:bg-red-5 dark:text-red-11",
        green:
          "bg-green-4 text-green-10 [a]:hover:bg-green-5 dark:text-green-11",
        blue: "bg-blue-4 text-blue-10 [a]:hover:bg-blue-5 dark:text-blue-11",
      },
    },
    defaultVariants: {
      variant: "default",
    },
    compoundVariants: [
      {
        variant: "solid",
        colorScheme: undefined,
        class:
          "bg-gray-9 text-gray-1 [a]:hover:bg-gray-10 dark:bg-gray-10 dark:[a]:hover:bg-gray-11",
      },
      {
        variant: "solid",
        colorScheme: "gray",
        class:
          "bg-gray-9 text-gray-1 [a]:hover:bg-gray-10 dark:bg-gray-10 dark:[a]:hover:bg-gray-11",
      },
      {
        variant: "solid",
        colorScheme: "orange",
        class:
          "bg-orange-9 text-gray-1 [a]:hover:bg-orange-10 dark:text-gray-1 dark:[a]:hover:bg-orange-11",
      },
      {
        variant: "solid",
        colorScheme: "purple",
        class:
          "bg-purple-9 text-purple-1 [a]:hover:bg-purple-10 dark:text-purple-1 dark:[a]:hover:bg-purple-11",
      },
      {
        variant: "solid",
        colorScheme: "yellow",
        class:
          "bg-yellow-500 text-yellow-950 [a]:hover:bg-yellow-600 dark:bg-yellow-600 dark:text-yellow-50 dark:[a]:hover:bg-yellow-700",
      },
      {
        variant: "solid",
        colorScheme: "red",
        class:
          "bg-red-9 text-gray-1 [a]:hover:bg-red-10 dark:text-gray-1 dark:[a]:hover:bg-red-11",
      },
      {
        variant: "solid",
        colorScheme: "green",
        class:
          "bg-green-9 text-gray-1 [a]:hover:bg-green-10 dark:text-gray-1 dark:[a]:hover:bg-green-11",
      },
      {
        variant: "solid",
        colorScheme: "blue",
        class:
          "bg-blue-9 text-gray-1 [a]:hover:bg-blue-10 dark:text-gray-1 dark:[a]:hover:bg-blue-11",
      },
    ],
  },
);

function Badge({
  className,
  variant = "default",
  colorScheme,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, colorScheme }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      colorScheme,
    },
  });
}

export { Badge, badgeVariants };
