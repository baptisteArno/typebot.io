import { Stack, HStack, Text, Switch, Tag } from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { TextLink } from '@/components/TextLink'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { guessIfUserIsEuropean } from '@typebot.io/lib/pricing'
import { Workspace } from '@typebot.io/schemas'
import { PreCheckoutModal, PreCheckoutModalProps } from './PreCheckoutModal'
import { useState } from 'react'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { StarterPlanPricingCard } from './StarterPlanPricingCard'
import { ProPlanPricingCard } from './ProPlanPricingCard'
import { useScopedI18n } from '@/locales'
import { StripeClimateLogo } from './StripeClimateLogo'

type Props = {
  workspace: Workspace
  onUpgradeSuccess: () => void
}

export const ChangePlanForm = ({ workspace, onUpgradeSuccess }: Props) => {
  const scopedT = useScopedI18n('billing')

  const { user } = useUser()
  const { showToast } = useToast()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()
  const [isYearly, setIsYearly] = useState(true)

  const { data } = trpc.billing.getSubscription.useQuery(
    {
      workspaceId: workspace.id,
    },
    {
      onSuccess: ({ subscription }) => {
        if (isYearly === false) return
        setIsYearly(subscription?.isYearly ?? true)
      },
    }
  )

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
          description: scopedT('updateSuccessToast.description', { plan }),
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
        data?.subscription?.currency ??
        (guessIfUserIsEuropean() ? 'eur' : 'usd'),
      isYearly,
    } as const
    if (workspace.stripeId) {
      updateSubscription(newSubscription)
    } else {
      setPreCheckoutPlan(newSubscription)
    }
  }

  if (data?.subscription?.cancelDate) return null

  return (
    <Stack spacing={6}>
      <HStack maxW="500px">
        <StripeClimateLogo />
        <Text fontSize="xs" color="gray.500">
          {scopedT('contribution.preLink')}{' '}
          <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
            {scopedT('contribution.link')}
          </TextLink>
        </Text>
      </HStack>
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
      {data && (
        <Stack align="flex-end" spacing={6}>
          <HStack>
            <Text>Monthly</Text>
            <Switch
              isChecked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />
            <HStack>
              <Text>Yearly</Text>
              <Tag colorScheme="blue">16% off</Tag>
            </HStack>
          </HStack>
          <HStack alignItems="stretch" spacing="4" w="full">
            <StarterPlanPricingCard
              workspace={workspace}
              currentSubscription={{ isYearly: data.subscription?.isYearly }}
              onPayClick={(props) =>
                handlePayClick({ ...props, plan: Plan.STARTER })
              }
              isYearly={isYearly}
              isLoading={isUpdatingSubscription}
              currency={data.subscription?.currency}
            />

            <ProPlanPricingCard
              workspace={workspace}
              currentSubscription={{ isYearly: data.subscription?.isYearly }}
              onPayClick={(props) =>
                handlePayClick({ ...props, plan: Plan.PRO })
              }
              isYearly={isYearly}
              isLoading={isUpdatingSubscription}
              currency={data.subscription?.currency}
            />
          </HStack>
        </Stack>
      )}

      <Text color="gray.500">
        {scopedT('customLimit.preLink')}{' '}
        <TextLink href={'https://typebot.io/enterprise-lead-form'} isExternal>
          {scopedT('customLimit.link')}
        </TextLink>
      </Text>
    </Stack>
  )
}
