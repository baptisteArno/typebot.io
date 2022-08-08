import React from 'react'
import { Flex, Stack } from '@chakra-ui/react'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { useRouter } from 'next/router'
import { useFolderContent } from 'services/folders'
import { Spinner } from '@chakra-ui/react'
import { TypebotDndContext } from 'contexts/TypebotDndContext'
import { useToast } from 'components/shared/hooks/useToast'

const FolderPage = () => {
  const router = useRouter()

  const { showToast } = useToast()

  const { folder } = useFolderContent({
    folderId: router.query.id?.toString(),
    onError: (error) => {
      showToast({
        title: "Couldn't fetch folder content",
        description: error.message,
      })
    },
  })

  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />
      <DashboardHeader />
      <TypebotDndContext>
        {!folder ? (
          <Flex flex="1">
            <Spinner mx="auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </TypebotDndContext>
    </Stack>
  )
}

export default FolderPage
