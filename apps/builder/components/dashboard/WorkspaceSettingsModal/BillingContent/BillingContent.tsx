import { Stack } from '@chakra-ui/react'
import { ChangePlanForm } from 'components/shared/ChangePlanForm'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import React from 'react'
import { CurrentSubscriptionContent } from './CurrentSubscriptionContent'
import { InvoicesList } from './InvoicesList'
import { UsageContent } from './UsageContent/UsageContent'

export const BillingContent = () => {
  const { workspace, refreshWorkspace } = useWorkspace()

  if (!workspace) return null
  return (
    <Stack spacing="10" w="full">
      <UsageContent workspace={workspace} />
      <Stack gap="2">
        <CurrentSubscriptionContent
          plan={workspace.plan}
          stripeId={workspace.stripeId}
          onCancelSuccess={() =>
            refreshWorkspace({
              plan: Plan.FREE,
              additionalChatsIndex: 0,
              additionalStorageIndex: 0,
            })
          }
        />
        {workspace.plan !== Plan.LIFETIME &&
          workspace.plan !== Plan.OFFERED && <ChangePlanForm />}
      </Stack>

      {workspace.stripeId && <InvoicesList workspace={workspace} />}
    </Stack>
  )
}
