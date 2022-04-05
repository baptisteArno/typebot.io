import { Collapse, Stack, Button, Text } from '@chakra-ui/react'
import { NextChakraLink } from '../nextChakraAdapters/NextChakraLink'
import { links } from './_data'

type Props = { isOpen: boolean }

export const MobileMenu = ({ isOpen }: Props) => (
  <Collapse in={isOpen}>
    <Stack
      pos="absolute"
      insetX={0}
      bgGradient="linear(to-b, gray.900, gray.800)"
      px="6"
      py="10"
      spacing={4}
    >
      <Button
        as={NextChakraLink}
        href="https://app.typebot.io/signin"
        colorScheme="blue"
        variant="outline"
        fontWeight={700}
      >
        Sign in
      </Button>
      <Button
        as={NextChakraLink}
        href="https://app.typebot.io/register"
        colorScheme="orange"
        fontWeight={700}
      >
        Create a typebot
      </Button>
      <Button
        as={NextChakraLink}
        href="/pricing"
        variant="outline"
        colorScheme="gray"
        fontWeight={700}
      >
        Pricing
      </Button>
      <Text fontWeight="700">Resources:</Text>
      {links[0].children?.map((link, idx) => (
        <Button
          as={NextChakraLink}
          href={link.href}
          key={idx}
          variant="outline"
          colorScheme="gray"
          fontWeight={700}
          py="6"
        >
          {link.label}
        </Button>
      ))}
    </Stack>
  </Collapse>
)
