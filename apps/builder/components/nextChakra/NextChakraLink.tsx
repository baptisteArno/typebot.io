import { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import { LinkProps as NextLinkProps } from 'next/dist/client/link'
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react'
import React from 'react'

export type NextChakraLinkProps = PropsWithChildren<
  NextLinkProps & Omit<ChakraLinkProps, 'href'>
>

export const NextChakraLink = React.forwardRef<
  HTMLAnchorElement,
  NextChakraLinkProps
>(
  (
    {
      href,
      replace,
      scroll,
      shallow,
      prefetch,
      children,
      locale,
      ...chakraProps
    },
    ref
  ) => {
    return (
      <NextLink
        passHref={true}
        href={href}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        prefetch={prefetch}
        locale={locale}
      >
        <ChakraLink ref={ref} {...chakraProps}>
          {children}
        </ChakraLink>
      </NextLink>
    )
  }
)
