import React from 'react'
import { Flex, Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { useRouter } from 'next/router'
import { useFolderContent } from 'services/folders'
import { Spinner, useToast } from '@chakra-ui/react'
import { TypebotDndContext } from 'contexts/TypebotDndContext'

const FolderPage = () => {
  const router = useRouter()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const { folder } = useFolderContent({
    folderId: router.query.id?.toString(),
    onError: (error) => {
      toast({
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
