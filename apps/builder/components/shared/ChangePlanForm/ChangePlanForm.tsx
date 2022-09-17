import { Stack, HStack, Text } from '@chakra-ui/react'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { useUser } from 'contexts/UserContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import { useToast } from '../hooks/useToast'
import { ProPlanContent } from './ProPlanContent'
import { pay } from './queries/updatePlan'
import { useCurrentSubscriptionInfo } from './queries/useCurrentSubscriptionInfo'
import { StarterPlanContent } from './StarterPlanContent'

export const ChangePlanForm = () => {
  const { user } = useUser()
  const { workspace, refreshWorkspace } = useWorkspace()
  const { showToast } = useToast()
  const { data, mutate: refreshCurrentSubscriptionInfo } =
    useCurrentSubscriptionInfo({
      stripeId: workspace?.stripeId,
      plan: workspace?.plan,
    })

  const handlePayClick = async ({
    plan,
    selectedChatsLimitIndex,
    selectedStorageLimitIndex,
  }: {
    plan: 'STARTER' | 'PRO'
    selectedChatsLimitIndex: number
    selectedStorageLimitIndex: number
  }) => {
    if (
      !user ||
      !workspace ||
      selectedChatsLimitIndex === undefined ||
      selectedStorageLimitIndex === undefined
    )
      return
    await pay({
      stripeId: workspace.stripeId ?? undefined,
      user,
      plan,
      workspaceId: workspace.id,
      additionalChats: selectedChatsLimitIndex,
      additionalStorage: selectedStorageLimitIndex,
    })
    refreshCurrentSubscriptionInfo({
      additionalChatsIndex: selectedChatsLimitIndex,
      additionalStorageIndex: selectedStorageLimitIndex,
    })
    refreshWorkspace({
      plan,
      additionalChatsIndex: selectedChatsLimitIndex,
      additionalStorageIndex: selectedStorageLimitIndex,
    })
    showToast({
      status: 'success',
      description: `Workspace ${plan} plan successfully updated 🎉`,
    })
  }

  return (
    <Stack spacing={4}>
      <HStack
        alignItems="stretch"
        spacing="4"
        w="full"
        pt={
          workspace?.plan === Plan.STARTER || workspace?.plan === Plan.PRO
            ? '10'
            : '0'
        }
      >
        <StarterPlanContent
          initialChatsLimitIndex={
            workspace?.plan === Plan.STARTER ? data?.additionalChatsIndex : 0
          }
          initialStorageLimitIndex={
            workspace?.plan === Plan.STARTER ? data?.additionalStorageIndex : 0
          }
          onPayClick={(props) =>
            handlePayClick({ ...props, plan: Plan.STARTER })
          }
        />

        <ProPlanContent
          initialChatsLimitIndex={
            workspace?.plan === Plan.PRO ? data?.additionalChatsIndex : 0
          }
          initialStorageLimitIndex={
            workspace?.plan === Plan.PRO ? data?.additionalStorageIndex : 0
          }
          onPayClick={(props) => handlePayClick({ ...props, plan: Plan.PRO })}
        />
      </HStack>
      <Text color="gray.500">
        Need custom limits? Specific features?{' '}
        <NextChakraLink
          href={'https://typebot.io/enterprise-lead-form'}
          isExternal
          textDecor="underline"
        >
          Let me know
        </NextChakraLink>
        .
      </Text>
    </Stack>
  )
}
