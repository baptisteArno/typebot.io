import React from 'react'
import { Flex, Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { useRouter } from 'next/router'
import { useFolderContent } from 'services/folders'
import { Spinner, useToast } from '@chakra-ui/react'
import { UserContext } from 'contexts/UserContext'

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
    <UserContext>
      <Seo title="My typebots" />
      <Stack>
        <DashboardHeader />
        {!folder ? (
          <Flex flex="1">
            <Spinner mx="auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </Stack>
    </UserContext>
  )
}

export default FolderPage
