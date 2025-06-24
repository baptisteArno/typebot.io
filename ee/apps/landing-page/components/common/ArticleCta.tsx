import { VStack, Heading, Button, Text } from '@chakra-ui/react'
import React from 'react'

export const ArticleCallToAction = () => (
  <VStack spacing={6}>
    <Heading fontSize="xx-large">
      Collect up to 4x more responses without 4x the work.
    </Heading>
    <Button
      size="lg"
      colorScheme="orange"
      as="a"
      href="https://app.typebot.io/register"
    >
      Create a bot
    </Button>
    <Text fontSize="sm" fontStyle="italic" color="gray.600">
      It&apos;s free!
    </Text>
  </VStack>
)
