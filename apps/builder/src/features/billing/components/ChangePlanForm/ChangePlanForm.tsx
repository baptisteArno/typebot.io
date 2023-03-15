import { Stack, HStack, Text } from '@chakra-ui/react'
import { useUser } from '@/features/account'
import { Plan } from '@typebot.io/prisma'
import { ProPlanContent } from './ProPlanContent'
import { StarterPlanContent } from './StarterPlanContent'
import { TextLink } from '@/components/TextLink'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { guessIfUserIsEuropean } from '@typebot.io/lib/pricing'
import { Workspace } from '@typebot.io/schemas'
import { PreCheckoutModal, PreCheckoutModalProps } from '../PreCheckoutModal'
import { useState } from 'react'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'

type Props = {
  workspace: Pick<Workspace, 'id' | 'stripeId' | 'plan'>
  onUpgradeSuccess: () => void
}

export const ChangePlanForm = ({ workspace, onUpgradeSuccess }: Props) => {
  const { user } = useUser()
  const { showToast } = useToast()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()

  const { data } = trpc.billing.getSubscription.useQuery({
    workspaceId: workspace.id,
  })

  const { mutate: updateSubscription, isLoading: isUpdatingSubscription } =
    trpc.billing.updateSubscription.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
      onSuccess: ({ workspace: { plan } }) => {
        onUpgradeSuccess()
        showToast({
          status: 'success',
          description: `Workspace ${plan} plan successfully updated 🎉`,
        })
      },
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
      selectedChatsLimitIndex === undefined ||
      selectedStorageLimitIndex === undefined
    )
      return

    const newSubscription = {
      plan,
      workspaceId: workspace.id,
      additionalChats: selectedChatsLimitIndex,
      additionalStorage: selectedStorageLimitIndex,
      currency:
        data?.subscription.currency ??
        (guessIfUserIsEuropean() ? 'eur' : 'usd'),
    } as const
    if (workspace.stripeId) {
      updateSubscription(newSubscription)
    } else {
      setPreCheckoutPlan(newSubscription)
    }
  }

  return (
    <Stack spacing={6}>
      {!workspace.stripeId && (
        <ParentModalProvider>
          <PreCheckoutModal
            selectedSubscription={preCheckoutPlan}
            existingEmail={user?.email ?? undefined}
            existingCompany={user?.company ?? undefined}
            onClose={() => setPreCheckoutPlan(undefined)}
          />
        </ParentModalProvider>
      )}
      <HStack alignItems="stretch" spacing="4" w="full">
        <StarterPlanContent
          initialChatsLimitIndex={
            workspace?.plan === Plan.STARTER
              ? data?.subscription.additionalChatsIndex
              : 0
          }
          initialStorageLimitIndex={
            workspace?.plan === Plan.STARTER
              ? data?.subscription.additionalStorageIndex
              : 0
          }
          onPayClick={(props) =>
            handlePayClick({ ...props, plan: Plan.STARTER })
          }
          isLoading={isUpdatingSubscription}
          currency={data?.subscription.currency}
        />

        <ProPlanContent
          initialChatsLimitIndex={
            workspace?.plan === Plan.PRO
              ? data?.subscription.additionalChatsIndex
              : 0
          }
          initialStorageLimitIndex={
            workspace?.plan === Plan.PRO
              ? data?.subscription.additionalStorageIndex
              : 0
          }
          onPayClick={(props) => handlePayClick({ ...props, plan: Plan.PRO })}
          isLoading={isUpdatingSubscription}
          currency={data?.subscription.currency}
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
