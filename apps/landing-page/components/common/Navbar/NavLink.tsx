import { LinkProps as ChakraLinkProps, Button } from '@chakra-ui/react'
import { LinkProps as NextLinkProps } from 'next/link'
import * as React from 'react'
import { NextChakraLink } from '../nextChakraAdapters/NextChakraLink'

type NavLinkProps = NextLinkProps &
  Omit<ChakraLinkProps, 'as'> & {
    active?: boolean
  }

const DesktopNavLink = (props: NavLinkProps) => {
  const { href, children } = props
  return (
    <Button
      as={NextChakraLink}
      href={href}
      isExternal={href.startsWith('https') && !href.includes('app.typebot.io')}
      variant="ghost"
      colorScheme="gray"
    >
      {children}
    </Button>
  )
}
DesktopNavLink.displayName = 'DesktopNavLink'

export const MobileNavLink = (props: NavLinkProps) => {
  const { href, children } = props
  return (
    <Button
      as={NextChakraLink}
      href={href ?? '#'}
      isExternal={href.startsWith('https') && !href.includes('app.typebot.io')}
      variant="ghost"
      colorScheme="gray"
      w="full"
      h="3rem"
      justifyContent="flex-start"
    >
      {children}
    </Button>
  )
}

export const NavLink = {
  Mobile: MobileNavLink,
  Desktop: DesktopNavLink,
}
