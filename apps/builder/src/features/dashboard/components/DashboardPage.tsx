import { Seo } from '@/components/Seo'
import { useUser } from '@/features/account'
import { upgradePlanQuery } from '@/features/billing'
import { TypebotDndProvider, FolderContent } from '@/features/folders'
import { useWorkspace } from '@/features/workspace'
import { Stack, VStack, Spinner, Text } from '@chakra-ui/react'
import { Plan } from 'db'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { DashboardHeader } from './DashboardHeader'

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { query } = useRouter()
  const { user } = useUser()
  const { workspace } = useWorkspace()

  useEffect(() => {
    const { subscribePlan, chats, storage } = query as {
      subscribePlan: Plan | undefined
      chats: string | undefined
      storage: string | undefined
    }
    if (workspace && subscribePlan && user && workspace.plan === 'FREE') {
      setIsLoading(true)
      upgradePlanQuery({
        user,
        plan: subscribePlan,
        workspaceId: workspace.id,
        additionalChats: chats ? parseInt(chats) : 0,
        additionalStorage: storage ? parseInt(storage) : 0,
      })
    }
  }, [query, user, workspace])

  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />
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
