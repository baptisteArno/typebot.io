import { Seo } from '@/components/Seo'
import { useUser } from '@/features/account'
import {
  PreCheckoutModal,
  PreCheckoutModalProps,
} from '@/features/billing/components/PreCheckoutModal'
import { TypebotDndProvider, FolderContent } from '@/features/folders'
import { useWorkspace } from '@/features/workspace'
import { Stack, VStack, Spinner, Text } from '@chakra-ui/react'
import { Plan } from 'db'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { guessIfUserIsEuropean } from 'utils/pricing'
import { DashboardHeader } from './DashboardHeader'

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { query } = useRouter()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps['selectedSubscription']>()

  useEffect(() => {
    const { subscribePlan, chats, storage } = query as {
      subscribePlan: Plan | undefined
      chats: string | undefined
      storage: string | undefined
    }
    if (workspace && subscribePlan && user && workspace.plan === 'FREE') {
      setIsLoading(true)
      setPreCheckoutPlan({
        plan: subscribePlan as 'PRO' | 'STARTER',
        workspaceId: workspace.id,
        additionalChats: chats ? parseInt(chats) : 0,
        additionalStorage: storage ? parseInt(storage) : 0,
        currency: guessIfUserIsEuropean() ? 'eur' : 'usd',
      })
    }
  }, [query, user, workspace])

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? 'My typebots'} />
      <DashboardHeader />
      {!workspace?.stripeId && (
        <PreCheckoutModal
          selectedSubscription={preCheckoutPlan}
          existingEmail={user?.email ?? undefined}
          existingCompany={workspace?.name ?? undefined}
          onClose={() => setPreCheckoutPlan(undefined)}
        />
      )}
      <TypebotDndProvider>
        {isLoading ? (
          <VStack w="full" justifyContent="center" pt="10" spacing={6}>
            <Text>You are being redirected...</Text>
            <Spinner />
          </VStack>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndProvider>
    </Stack>
  )
}
