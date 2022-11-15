import { HStack, Stack, Text } from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import React from 'react'
import { CurrentSubscriptionContent } from './CurrentSubscriptionContent'
import { InvoicesList } from './InvoicesList'
import { UsageContent } from './UsageContent/UsageContent'
import { StripeClimateLogo } from '../StripeClimateLogo'
import { TextLink } from '@/components/TextLink'
import { ChangePlanForm } from '../ChangePlanForm'

export const BillingContent = () => {
  const { workspace, refreshWorkspace } = useWorkspace()

  if (!workspace) return null
  return (
    <Stack spacing="10" w="full">
      <UsageContent workspace={workspace} />
      <Stack spacing="2">
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
          workspace.plan !== Plan.OFFERED && <ChangePlanForm />}
      </Stack>

      {workspace.stripeId && <InvoicesList workspace={workspace} />}
    </Stack>
  )
}
