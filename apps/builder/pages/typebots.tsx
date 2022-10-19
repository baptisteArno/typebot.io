import React, { useEffect, useState } from 'react'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { TypebotDndContext } from 'contexts/TypebotDndContext'
import { useRouter } from 'next/router'
import { Spinner, Stack, Text, VStack } from '@chakra-ui/react'
import { useUser } from 'contexts/UserContext'
import { NextPageContext } from 'next/types'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { Plan } from 'db'
import { pay } from 'components/shared/ChangePlanForm/queries/updatePlan'

const DashboardPage = () => {
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
      pay({
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
      <TypebotDndContext>
        {isLoading ? (
          <VStack w="full" justifyContent="center" pt="10" spacing={6}>
            <Text>You are being redirected...</Text>
            <Spinner />
          </VStack>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndContext>
    </Stack>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const redirectPath = context.query.redirectPath?.toString()
  return redirectPath
    ? {
        redirect: {
          permanent: false,
          destination: redirectPath,
        },
      }
    : { props: {} }
}

export default DashboardPage
