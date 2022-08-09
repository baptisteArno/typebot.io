import { Stack, HStack, Button, Text, Tag } from '@chakra-ui/react'
import { ExternalLinkIcon } from 'assets/icons'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'model'
import React from 'react'

export const BillingForm = () => {
  const { workspace } = useWorkspace()

  return (
    <Stack spacing="6">
      <HStack>
        <Text>Workspace subscription: </Text>
        <PlanTag plan={workspace?.plan} />
      </HStack>
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
