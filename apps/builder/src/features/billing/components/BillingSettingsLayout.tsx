import { Stack } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { InvoicesList } from './InvoicesList'
import { ChangePlanForm } from './ChangePlanForm'
import { UsageProgressBars } from './UsageProgressBars'
import { CurrentSubscriptionSummary } from './CurrentSubscriptionSummary'

export const BillingSettingsLayout = () => {
  const { workspace, refreshWorkspace } = useWorkspace()

  if (!workspace) return null
  return (
    <Stack spacing="10" w="full">
      <UsageProgressBars workspace={workspace} />
      <Stack spacing="4">
        <CurrentSubscriptionSummary workspace={workspace} />
        {workspace.plan !== Plan.CUSTOM &&
          workspace.plan !== Plan.LIFETIME &&
          workspace.plan !== Plan.UNLIMITED &&
          workspace.plan !== Plan.OFFERED && (
            <ChangePlanForm
              workspace={workspace}
              onUpgradeSuccess={refreshWorkspace}
            />
          )}
      </Stack>

      {workspace.stripeId && <InvoicesList workspaceId={workspace.id} />}
    </Stack>
  )
}
