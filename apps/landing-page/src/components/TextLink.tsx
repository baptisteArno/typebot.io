import { cn } from "@/lib/utils";
import { Link as TanstackLink } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

const textLinkVariants = cva("inline-flex gap-1 font-medium underline", {
  variants: {
    size: {
      default: "",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const textLinkIconVariants = cva("mt-0.5", {
  variants: {
    size: {
      default: "text-lg w-6",
      sm: "w-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface TextLinkProps
  extends Pick<
      ComponentProps<typeof TanstackLink>,
      "to" | "href" | "target" | "className" | "children"
    >,
    VariantProps<typeof textLinkVariants> {}

export const TextLink = ({
  children,
  className,
  size,
  to,
  href,
  target,
}: TextLinkProps) => (
  <TanstackLink
    className={cn(textLinkVariants({ size }), className)}
    to={to}
    href={href}
  >
    {({ isActive, isTransitioning }) => (
      <>
        {typeof children === "function"
          ? children({ isActive, isTransitioning })
          : children}
        {target === "_blank" && (
          <ArrowUpRightIcon className={textLinkIconVariants({ size })} />
        )}
      </>
    )}
  </TanstackLink>
);
