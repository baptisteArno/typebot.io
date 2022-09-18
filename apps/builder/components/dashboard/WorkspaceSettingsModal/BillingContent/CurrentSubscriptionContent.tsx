import {
  Text,
  HStack,
  Link,
  Spinner,
  Stack,
  Button,
  Heading,
} from '@chakra-ui/react'
import { PlanTag } from 'components/shared/PlanTag'
import { Plan } from 'db'
import React, { useState } from 'react'
import { cancelSubscriptionQuery } from './queries/cancelSubscriptionQuery'

type CurrentSubscriptionContentProps = {
  plan: Plan
  stripeId?: string | null
  onCancelSuccess: () => void
}

export const CurrentSubscriptionContent = ({
  plan,
  stripeId,
  onCancelSuccess,
}: CurrentSubscriptionContentProps) => {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isRedirectingToBillingPortal, setIsRedirectingToBillingPortal] =
    useState(false)

  const cancelSubscription = async () => {
    if (!stripeId) return
    setIsCancelling(true)
    await cancelSubscriptionQuery(stripeId)
    onCancelSuccess()
    setIsCancelling(false)
  }

  const isSubscribed = (plan === Plan.STARTER || plan === Plan.PRO) && stripeId

  if (isCancelling) return <Spinner colorScheme="gray" />
  return (
    <Stack gap="2">
      <Heading fontSize="3xl">Subscription</Heading>
      <HStack>
        <Text>Current workspace subscription: </Text>
        <PlanTag plan={plan} />
        {isSubscribed && (
          <Link
            as="button"
            color="gray.500"
            textDecor="underline"
            fontSize="sm"
            onClick={cancelSubscription}
          >
            Cancel my subscription
          </Link>
        )}
      </HStack>

      {isSubscribed && (
        <>
          <Stack gap="1">
            <Text fontSize="sm">
              Need to change payment method or billing information? Head over to
              your billing portal:
            </Text>
            <Button
              as={Link}
              href={`/api/stripe/billing-portal?stripeId=${stripeId}`}
              onClick={() => setIsRedirectingToBillingPortal(true)}
              isLoading={isRedirectingToBillingPortal}
            >
              Billing Portal
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}
