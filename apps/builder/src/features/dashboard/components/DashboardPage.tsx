import { Seo } from '@/components/Seo'
import { useUser } from '@/features/account'
import { TypebotDndProvider, FolderContent } from '@/features/folders'
import { useWorkspace } from '@/features/workspace'
import { trpc } from '@/lib/trpc'
import { Stack, VStack, Spinner, Text } from '@chakra-ui/react'
import { Plan } from 'db'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { guessIfUserIsEuropean } from 'utils/pricing'
import { DashboardHeader } from './DashboardHeader'

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { query, push } = useRouter()
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const { mutate: createCheckoutSession } =
    trpc.billing.createCheckoutSession.useMutation({
      onSuccess: (data) => {
        push(data.checkoutUrl)
      },
    })

  useEffect(() => {
    const { subscribePlan, chats, storage } = query as {
      subscribePlan: Plan | undefined
      chats: string | undefined
      storage: string | undefined
    }
    if (workspace && subscribePlan && user && workspace.plan === 'FREE') {
      setIsLoading(true)
      createCheckoutSession({
        plan: subscribePlan as 'PRO' | 'STARTER',
        workspaceId: workspace.id,
        additionalChats: chats ? parseInt(chats) : 0,
        additionalStorage: storage ? parseInt(storage) : 0,
        returnUrl: window.location.href,
        currency: guessIfUserIsEuropean() ? 'eur' : 'usd',
        prefilledEmail: user.email ?? undefined,
      })
    }
  }, [createCheckoutSession, query, user, workspace])

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? 'My typebots'} />
      <DashboardHeader />
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
