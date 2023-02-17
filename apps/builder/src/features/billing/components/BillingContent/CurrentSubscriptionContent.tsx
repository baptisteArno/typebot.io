import { Text, HStack, Link, Spinner, Stack, Heading } from '@chakra-ui/react'
import { useToast } from '@/hooks/useToast'
import { Plan } from 'db'
import React from 'react'
import { PlanTag } from '../PlanTag'
import { BillingPortalButton } from './BillingPortalButton'
import { trpc } from '@/lib/trpc'
import { Workspace } from 'models'

type CurrentSubscriptionContentProps = {
  workspace: Pick<Workspace, 'id' | 'plan' | 'stripeId'>
  onCancelSuccess: () => void
}

export const CurrentSubscriptionContent = ({
  workspace,
  onCancelSuccess,
}: CurrentSubscriptionContentProps) => {
  const { showToast } = useToast()

  const { mutate: cancelSubscription, isLoading: isCancelling } =
    trpc.billing.cancelSubscription.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
      onSuccess: onCancelSuccess,
    })

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId

  return (
    <Stack spacing="4">
      <Heading fontSize="3xl">Subscription</Heading>
      <HStack data-testid="current-subscription">
        <Text>Current workspace subscription: </Text>
        {isCancelling ? (
          <Spinner color="gray.500" size="xs" />
        ) : (
          <>
            <PlanTag plan={workspace.plan} />
            {isSubscribed && (
              <Link
                as="button"
                color="gray.500"
                textDecor="underline"
                fontSize="sm"
                onClick={() =>
                  cancelSubscription({ workspaceId: workspace.id })
                }
              >
                Cancel my subscription
              </Link>
            )}
          </>
        )}
      </HStack>

      {isSubscribed && !isCancelling && (
        <>
          <Stack spacing="4">
            <Text fontSize="sm">
              Need to change payment method or billing information? Head over to
              your billing portal:
            </Text>
            <BillingPortalButton workspaceId={workspace.id} />
          </Stack>
        </>
      )}
    </Stack>
  )
}
