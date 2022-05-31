import { Heading, Text, VStack } from '@chakra-ui/react'
import { TypebotLogo } from 'assets/logos'
import React from 'react'

export const MaintenancePage = () => (
  <VStack h="100vh" justify="center">
    <TypebotLogo />
    <Heading>
      The tool is under maintenance for an exciting new feature! 🤩
    </Heading>
    <Text>Please come back again in 10 minutes.</Text>
  </VStack>
)
