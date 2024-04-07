import { Stack, HStack, Text } from '@chakra-ui/react'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import { TextLink } from '@/components/TextLink'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { PreCheckoutModal, PreCheckoutModalProps } from './PreCheckoutModal'
import { useState } from 'react'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { StarterPlanPricingCard } from './StarterPlanPricingCard'
import { ProPlanPricingCard } from './ProPlanPricingCard'
import { useTranslate } from '@tolgee/react'
import { StripeClimateLogo } from './StripeClimateLogo'
import { guessIfUserIsEuropean } from '@typebot.io/billing/guessIfUserIsEuropean'
import { WorkspaceInApp } from '@/features/workspace/WorkspaceProvider'

type Props = {
  workspace: WorkspaceInApp
  currentRole?: WorkspaceRole
  excludedPlans?: ('STARTER' | 'PRO')[]
}

export const ChangePlanForm = ({
  workspace,
  currentRole,
  excludedPlans,
}: Props) => {
  const { t } = useTranslate()

  const { user } = useUser()
  const { showToast } = useToast()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()

  const trpcContext = trpc.useContext()

  const { data, refetch } = trpc.billing.getSubscription.useQuery({
    workspaceId: workspace.id,
  })

  const { mutate: updateSubscription, isLoading: isUpdatingSubscription } =
    trpc.billing.updateSubscription.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
      onSuccess: ({ workspace, checkoutUrl }) => {
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
        refetch()
        trpcContext.workspace.getWorkspace.invalidate()
        showToast({
          status: 'success',
          description: t('billing.updateSuccessToast.description', {
            plan: workspace?.plan,
          }),
        })
      },
    })

  const handlePayClick = async (plan: 'STARTER' | 'PRO') => {
    if (!user) return

    const newSubscription = {
      plan,
      workspaceId: workspace.id,
      currency:
        data?.subscription?.currency ??
        (guessIfUserIsEuropean() ? 'eur' : 'usd'),
    } as const
    if (workspace.stripeId) {
      updateSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      })
    } else {
      setPreCheckoutPlan(newSubscription)
    }
  }

  if (
    data?.subscription?.cancelDate ||
    data?.subscription?.status === 'past_due'
  )
    return null

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId

  if (workspace.plan !== Plan.FREE && !isSubscribed) return null

  if (currentRole !== WorkspaceRole.ADMIN)
    return (
      <Text>
        Only workspace admins can change the subscription plan. Contact your
        workspace admin to change the plan.
      </Text>
    )

  return (
    <Stack spacing={6}>
      <HStack maxW="500px">
        <StripeClimateLogo />
        <Text fontSize="xs" color="gray.500">
          {t('billing.contribution.preLink')}{' '}
          <TextLink href="https://climate.stripe.com/5VCRAq" isExternal>
            {t('billing.contribution.link')}
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
          <HStack alignItems="stretch" spacing="4" w="full">
            {excludedPlans?.includes('STARTER') ? null : (
              <StarterPlanPricingCard
                currentPlan={workspace.plan}
                onPayClick={() => handlePayClick(Plan.STARTER)}
                isLoading={isUpdatingSubscription}
                currency={data.subscription?.currency}
              />
            )}

            {excludedPlans?.includes('PRO') ? null : (
              <ProPlanPricingCard
                currentPlan={workspace.plan}
                onPayClick={() => handlePayClick(Plan.PRO)}
                isLoading={isUpdatingSubscription}
                currency={data.subscription?.currency}
              />
            )}
          </HStack>
        </Stack>
      )}

      <Text color="gray.500">
        {t('billing.customLimit.preLink')}{' '}
        <TextLink href={'https://typebot.io/enterprise-lead-form'} isExternal>
          {t('billing.customLimit.link')}
        </TextLink>
      </Text>
    </Stack>
  )
}
