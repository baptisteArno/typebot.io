import { Stack, HStack, Button, Text, Tag } from '@chakra-ui/react'
import { ExternalLinkIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { UpgradeButton } from 'components/shared/buttons/UpgradeButton'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import React from 'react'

export const BillingForm = () => {
  const { workspace } = useWorkspace()

  return (
    <Stack spacing="6" w="full">
      <HStack>
        <Text>Current workspace subscription: </Text>
        <PlanTag plan={workspace?.plan} />
      </HStack>
      {workspace &&
        !([Plan.TEAM, Plan.LIFETIME, Plan.OFFERED] as Plan[]).includes(
          workspace.plan
        ) && (
          <HStack>
            {workspace?.plan === Plan.FREE && (
              <UpgradeButton colorScheme="orange" variant="outline" w="full">
                Upgrade to Pro plan
              </UpgradeButton>
            )}
            {workspace?.plan !== Plan.TEAM && (
              <UpgradeButton
                colorScheme="purple"
                variant="outline"
                w="full"
                plan={Plan.TEAM}
              >
                Upgrade to Team plan
              </UpgradeButton>
            )}
          </HStack>
        )}
      {workspace?.stripeId && (
        <>
          <Text>
            To manage your subscription and download invoices, head over to your
            Stripe portal:
          </Text>

          <Button
            as={NextChakraLink}
            href={`/api/stripe/customer-portal?workspaceId=${workspace.id}`}
            isExternal
            colorScheme="blue"
            rightIcon={<ExternalLinkIcon />}
          >
            Stripe Portal
          </Button>
        </>
      )}
    </Stack>
  )
}

const PlanTag = ({ plan }: { plan?: Plan }) => {
  switch (plan) {
    case Plan.TEAM: {
      return <Tag colorScheme="purple">Team</Tag>
    }
    case Plan.LIFETIME:
    case Plan.OFFERED:
    case Plan.PRO: {
      return <Tag colorScheme="orange">Personal Pro</Tag>
    }
    default: {
      return <Tag colorScheme="gray">Free</Tag>
    }
  }
}
