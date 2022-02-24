import React from 'react'
import { Flex, Heading, Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { BackButton } from 'components/dashboard/FolderContent/BackButton'
import { useSharedTypebots } from 'services/user/sharedTypebots'
import { useUser } from 'contexts/UserContext'
import { useToast, Wrap } from '@chakra-ui/react'
import { ButtonSkeleton } from 'components/dashboard/FolderContent/FolderButton'
import { TypebotButton } from 'components/dashboard/FolderContent/TypebotButton'

const SharedTypebotsPage = () => {
  const { user } = useUser()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const { sharedTypebots, isLoading } = useSharedTypebots({
    userId: user?.id,
    onError: (e) =>
      toast({ title: "Couldn't fetch shared bots", description: e.message }),
  })
  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />
      <DashboardHeader />
      <Flex w="full" flex="1" justify="center">
        <Stack w="1000px" spacing={6}>
          <Heading as="h1">Shared with me</Heading>
          <Stack>
            <Flex>
              <BackButton id={null} />
            </Flex>
            <Wrap spacing={4}>
              {isLoading && <ButtonSkeleton />}
              {sharedTypebots?.map((typebot) => (
                <TypebotButton key={typebot.id} typebot={typebot} isReadOnly />
              ))}
            </Wrap>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  )
}

export default SharedTypebotsPage
