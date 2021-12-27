import { Flex } from '@chakra-ui/react'
import { TypebotLogo } from 'assets/logos'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import React from 'react'

export const AccountHeader = () => (
  <Flex w="full" borderBottomWidth="1px" justify="center">
    <Flex
      justify="space-between"
      alignItems="center"
      h="16"
      maxW="1000px"
      flex="1"
    >
      <NextChakraLink
        className="w-24"
        href="/typebots"
        data-testid="authenticated"
      >
        <TypebotLogo w="30px" />
      </NextChakraLink>
    </Flex>
  </Flex>
)
