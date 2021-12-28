import { Stack, Heading, HStack, Button, Text } from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useUser } from 'contexts/UserContext'
import { Plan } from 'db'
import React from 'react'
import { SubscriptionTag } from './SubscriptionTag'

export const BillingSection = () => {
  const { user } = useUser()
  return (
    <Stack direction="row" spacing="10" justifyContent={'space-between'}>
      <Heading as="h2" fontSize="xl">
        Billing
      </Heading>
      <Stack spacing="6" w="400px">
        <HStack>
          <Text>Your subscription</Text>
          <SubscriptionTag plan={user?.plan} />
        </HStack>
        {user?.stripeId && (
          <Button as={NextChakraLink} href="/api/stripe/customer-portal">
            Manage my subscription
          </Button>
        )}
        {user?.plan === Plan.FREE && (
          <Button colorScheme="blue">Upgrade</Button>
        )}
      </Stack>
    </Stack>
  )
}
