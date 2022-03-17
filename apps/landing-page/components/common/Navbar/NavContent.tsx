import {
  Box,
  Button,
  Flex,
  FlexProps,
  HStack,
  useDisclosure,
  useColorModeValue as mode,
  Heading,
} from '@chakra-ui/react'
import * as React from 'react'
import { Logo } from 'assets/icons/Logo'
import { NextChakraLink } from '../nextChakraAdapters/NextChakraLink'
import { NavLink } from './NavLink'
import { NavMenu } from './NavMenu'
import { Submenu } from './Submenu'
import { ToggleButton } from './ToggleButton'
import { Link } from './_data'

const MobileNavContext = ({
  links,
  ...props
}: { links: Link[] } & FlexProps) => {
  const { isOpen, onToggle } = useDisclosure()
  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        className="nav-content__mobile"
        color={mode('white', 'white')}
        {...props}
      >
        <HStack as={NextChakraLink} href="/" rel="home" ml="2">
          <Logo boxSize="35px" />
          <Heading as="p" fontSize="lg">
            Typebot
          </Heading>
        </HStack>
        <Box>
          <ToggleButton isOpen={isOpen} onClick={onToggle} />
        </Box>
      </Flex>
      <NavMenu animate={isOpen ? 'open' : 'closed'}>
        {links.map((link, idx) =>
          link.children ? (
            <Submenu.Mobile key={idx} link={link} />
          ) : (
            <NavLink.Mobile key={idx} href={link.href ?? '#'}>
              {link.label}
            </NavLink.Mobile>
          )
        )}
        <Button
          as={NextChakraLink}
          href="https://app.typebot.io/signin"
          colorScheme="blue"
          variant="outline"
          w="full"
          size="lg"
          mt="5"
        >
          Sign in
        </Button>
        <Button
          as={NextChakraLink}
          href="https://app.typebot.io/register"
          colorScheme="orange"
          w="full"
          size="lg"
          mt="5"
        >
          Create a typebot for free
        </Button>
      </NavMenu>
    </>
  )
}

const DesktopNavContent = ({
  links,
  ...props
}: { links: Link[] } & FlexProps) => {
  return (
    <Flex
      className="nav-content__desktop"
      align="center"
      justify="space-between"
      {...props}
      color={mode('bg.gray800', 'white')}
    >
      <HStack as={NextChakraLink} href="/" rel="home">
        <Logo boxSize="35px" />
        <Heading as="p" fontSize="lg">
          Typebot
        </Heading>
      </HStack>

      <HStack spacing="4" minW="240px" justify="space-between">
        <HStack
          as="ul"
          id="nav__primary-menu"
          aria-label="Main Menu"
          listStyleType="none"
        >
          {links.map((link, idx) => (
            <Box as="li" key={idx} id={`nav__menuitem-${idx}`}>
              {link.children ? (
                <Submenu.Desktop link={link} />
              ) : (
                <NavLink.Desktop href={link.href ?? '#'}>
                  {link.label}
                </NavLink.Desktop>
              )}
            </Box>
          ))}
        </HStack>
        <Button
          as={NextChakraLink}
          href="https://app.typebot.io/signin"
          colorScheme="blue"
          variant="outline"
          fontWeight="bold"
        >
          Sign in
        </Button>
        <Button
          as={NextChakraLink}
          href="https://app.typebot.io/register"
          colorScheme="orange"
          fontWeight="bold"
        >
          Create a typebot
        </Button>
      </HStack>
    </Flex>
  )
}

export const NavContent = {
  Mobile: MobileNavContext,
  Desktop: DesktopNavContent,
}
