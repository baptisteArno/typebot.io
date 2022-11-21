import { Stack, HStack, Text } from '@chakra-ui/react'
import { useUser } from '@/features/account'
import { useWorkspace } from '@/features/workspace'
import { Plan } from 'db'
import { ProPlanContent } from './ProPlanContent'
import { upgradePlanQuery } from '../../queries/upgradePlanQuery'
import { useCurrentSubscriptionInfo } from '../../hooks/useCurrentSubscriptionInfo'
import { StarterPlanContent } from './StarterPlanContent'
import { TextLink } from '@/components/TextLink'
import { useToast } from '@/hooks/useToast'

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
    const response = await upgradePlanQuery({
      stripeId: workspace.stripeId ?? undefined,
      user,
      plan,
      workspaceId: workspace.id,
      additionalChats: selectedChatsLimitIndex,
      additionalStorage: selectedStorageLimitIndex,
    })
    if (typeof response === 'object' && response?.error) {
      showToast({ description: response.error.message })
      return
    }
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
    <Stack spacing={6}>
      <HStack alignItems="stretch" spacing="4" w="full">
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
        <TextLink href={'https://typebot.io/enterprise-lead-form'} isExternal>
          Let&apos;s chat!
        </TextLink>
      </Text>
    </Stack>
  )
}
