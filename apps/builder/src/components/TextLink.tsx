import { chakra, HStack, type TextProps } from "@chakra-ui/react";
import { ArrowUpRight01Icon } from "@typebot.io/ui/icons/ArrowUpRight01Icon";
import Link, { type LinkProps } from "next/link";

type TextLinkProps = LinkProps & TextProps & { isExternal?: boolean };

export const TextLink = ({
  children,
  href,
  shallow,
  replace,
  scroll,
  prefetch,
  isExternal,
  noOfLines,
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
          <chakra.span noOfLines={noOfLines} maxW="100%">
            {children}
          </chakra.span>
          <ArrowUpRight01Icon />
        </HStack>
      ) : (
        children
      )}
    </chakra.span>
  </Link>
);
