import {
  Text,
  HStack,
  Link,
  Spinner,
  Stack,
  Button,
  Heading,
} from '@chakra-ui/react'
import { useToast } from 'components/shared/hooks/useToast'
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
  const { showToast } = useToast()

  const cancelSubscription = async () => {
    if (!stripeId) return
    setIsCancelling(true)
    const { error } = await cancelSubscriptionQuery(stripeId)
    if (error) {
      showToast({ description: error.message })
      return
    }
    onCancelSuccess()
    setIsCancelling(false)
  }

  const isSubscribed = (plan === Plan.STARTER || plan === Plan.PRO) && stripeId

  return (
    <Stack spacing="2">
      <Heading fontSize="3xl">Subscription</Heading>
      <HStack data-testid="current-subscription">
        <Text>Current workspace subscription: </Text>
        {isCancelling ? (
          <Spinner color="gray.500" size="xs" />
        ) : (
          <>
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
          </>
        )}
      </HStack>

      {isSubscribed && !isCancelling && (
        <>
          <Stack spacing="1">
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
