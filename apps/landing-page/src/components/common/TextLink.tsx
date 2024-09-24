import { ExternalLinkIcon } from "@/assets/icons/ExternalLinkIcon";
import { HStack, type TextProps, chakra } from "@chakra-ui/react";
import Link, { type LinkProps } from "next/link";
import React from "react";

type TextLinkProps = LinkProps & TextProps & { isExternal?: boolean };

export const TextLink = ({
  children,
  href,
  shallow,
  replace,
  scroll,
  prefetch,
  isExternal,
  ...textProps
}: TextLinkProps) => (
  <Link
    href={href}
    shallow={shallow}
    replace={replace}
    scroll={scroll}
    prefetch={prefetch}
    target={isExternal ? "_blank" : undefined}
  >
    <chakra.span textDecor="underline" display="inline-block" {...textProps}>
      {isExternal ? (
        <HStack as="span" spacing={1}>
          <chakra.span>{children}</chakra.span>
          <ExternalLinkIcon />
        </HStack>
      ) : (
        children
      )}
    </chakra.span>
  </Link>
);
