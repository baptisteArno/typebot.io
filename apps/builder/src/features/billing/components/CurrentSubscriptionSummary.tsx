import { Text, HStack, Stack, Heading } from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { PlanTag } from './PlanTag'
import { BillingPortalButton } from './BillingPortalButton'
import { trpc } from '@/lib/trpc'
import { Workspace } from '@typebot.io/schemas'
import { useScopedI18n } from '@/locales'

type Props = {
  workspace: Pick<Workspace, 'id' | 'plan' | 'stripeId'>
}

export const CurrentSubscriptionSummary = ({ workspace }: Props) => {
  const scopedT = useScopedI18n('billing.currentSubscription')

  const { data } = trpc.billing.getSubscription.useQuery({
    workspaceId: workspace.id,
  })

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId

  return (
    <Stack spacing="4">
      <Heading fontSize="3xl">{scopedT('heading')}</Heading>
      <HStack data-testid="current-subscription">
        <Text>{scopedT('subheading')} </Text>
        <PlanTag plan={workspace.plan} />
        {data?.subscription?.cancelDate && (
          <Text fontSize="sm">
            (Will be cancelled on {data.subscription.cancelDate.toDateString()})
          </Text>
        )}
      </HStack>

      {isSubscribed && <BillingPortalButton workspaceId={workspace.id} />}
    </Stack>
  )
}
