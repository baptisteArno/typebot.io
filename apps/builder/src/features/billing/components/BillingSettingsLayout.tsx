import { HStack, Stack, Text } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Plan } from '@typebot.io/prisma'
import React from 'react'
import { InvoicesList } from './InvoicesList'
import { StripeClimateLogo } from './StripeClimateLogo'
import { TextLink } from '@/components/TextLink'
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
        <CurrentSubscriptionSummary
          workspace={workspace}
          onCancelSuccess={refreshWorkspace}
        />
        <HStack maxW="500px">
          <StripeClimateLogo />
          <Text fontSize="xs" color="gray.500">
            Typebot is contributing 1% of your subscription to remove CO₂ from
            the atmosphere.{' '}
            <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
              More info.
            </TextLink>
          </Text>
        </HStack>
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
