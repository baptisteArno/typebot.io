import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@typebot.io/ui/icons/ArrowUpRightIcon";
import NextLink, { type LinkProps } from "next/link";
import type { HTMLProps } from "react";

export const TextLink = ({
  children,
  className,
  ...props
}: LinkProps & HTMLProps<HTMLAnchorElement>) => (
  <NextLink
    {...props}
    className={cn("inline-flex gap-1 font-medium underline", className)}
  >
    {children}
    {props.target === "_blank" && (
      <ArrowUpRightIcon className="mt-0.5 text-lg w-6" />
    )}
  </NextLink>
);
