import { PropsWithChildren } from 'react'
import NextLink from 'next/link'
import { LinkProps as NextLinkProps } from 'next/dist/client/link'
import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react'
import React from 'react'

export type NextChakraLinkProps = PropsWithChildren<
  NextLinkProps & Omit<ChakraLinkProps, 'as'>
>

//  Has to be a new component because both chakra and next share the `as` keyword
// eslint-disable-next-line react/display-name
export const NextChakraLink = React.forwardRef(
  (
    {
      href,
      as,
      replace,
      scroll,
      shallow,
      prefetch,
      children,
      locale,
      ...chakraProps
    }: NextChakraLinkProps,
    ref
  ) => {
    return (
      <NextLink
        passHref={true}
        href={href}
        as={as}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        prefetch={prefetch}
        locale={locale}
      >
        {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
        {/*@ts-ignore*/}
        <ChakraLink ref={ref} {...chakraProps}>
          {children}
        </ChakraLink>
      </NextLink>
    )
  }
)
