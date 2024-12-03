import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import { type VariantProps, cva } from "class-variance-authority";
import NextLink, { type LinkProps } from "next/link";
import type { HTMLProps } from "react";

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
  extends LinkProps,
    Pick<HTMLProps<HTMLAnchorElement>, "children" | "className" | "target">,
    VariantProps<typeof textLinkVariants> {}

export const TextLink = ({
  children,
  className,
  size,
  ...props
}: TextLinkProps) => (
  <NextLink {...props} className={cn(textLinkVariants({ size }), className)}>
    {children}
    {props.target === "_blank" && (
      <ArrowUpRightIcon className={textLinkIconVariants({ size })} />
    )}
  </NextLink>
);
