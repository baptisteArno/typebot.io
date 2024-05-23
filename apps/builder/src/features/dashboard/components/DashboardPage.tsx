import { Seo } from '@/components/Seo'
import { useUser } from '@/features/account/hooks/useUser'
import {
  PreCheckoutModal,
  PreCheckoutModalProps,
} from '@/features/billing/components/PreCheckoutModal'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { Stack, VStack, Spinner, Text } from '@chakra-ui/react'
import { Plan } from '@typebot.io/prisma'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { DashboardHeader } from './DashboardHeader'
import { FolderContent } from '@/features/folders/components/FolderContent'
import { TypebotDndProvider } from '@/features/folders/TypebotDndProvider'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { trpc } from '@/lib/trpc'
import { guessIfUserIsEuropean } from '@typebot.io/billing/helpers/guessIfUserIsEuropean'
import { useTranslate } from '@tolgee/react'

export const DashboardPage = () => {
  const { t } = useTranslate()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()
  const { mutate: createCustomCheckoutSession } =
    trpc.billing.createCustomCheckoutSession.useMutation({
      onSuccess: (data) => {
        router.push(data.checkoutUrl)
      },
    })

  useEffect(() => {
    const { subscribePlan, claimCustomPlan } = router.query as {
      subscribePlan: Plan | undefined
      chats: string | undefined
      claimCustomPlan: string | undefined
    }
    if (claimCustomPlan && user?.email && workspace) {
      setIsLoading(true)
      createCustomCheckoutSession({
        email: user.email,
        workspaceId: workspace.id,
        returnUrl: `${window.location.origin}/typebots`,
      })
    }
    if (workspace && subscribePlan && user && workspace.plan === 'FREE') {
      setIsLoading(true)
      setPreCheckoutPlan({
        plan: subscribePlan as 'PRO' | 'STARTER',
        workspaceId: workspace.id,
        currency: guessIfUserIsEuropean() ? 'eur' : 'usd',
      })
    }
  }, [createCustomCheckoutSession, router.query, user, workspace])

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? t('dashboard.title')} />
      <DashboardHeader />
      {!workspace?.stripeId && (
        <ParentModalProvider>
          <PreCheckoutModal
            selectedSubscription={preCheckoutPlan}
            existingEmail={user?.email ?? undefined}
            existingCompany={workspace?.name ?? undefined}
            onClose={() => setPreCheckoutPlan(undefined)}
          />
        </ParentModalProvider>
      )}
      <TypebotDndProvider>
        {isLoading ? (
          <VStack w="full" justifyContent="center" pt="10" spacing={6}>
            <Text>{t('dashboard.redirectionMessage')}</Text>
            <Spinner />
          </VStack>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndProvider>
    </Stack>
  )
}
