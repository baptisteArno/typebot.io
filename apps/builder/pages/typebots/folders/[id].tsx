import withAuth from 'components/HOC/withUser'
import React from 'react'
import { Flex, Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { useRouter } from 'next/router'
import { useFolderContent } from 'services/folders'
import { Spinner, useToast } from '@chakra-ui/react'

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
    <Stack>
      <Seo title="My typebots" />
      <DashboardHeader />
      {!folder ? (
        <Flex flex="1">
          <Spinner mx="auto" />
        </Flex>
      ) : (
        <FolderContent folder={folder} />
      )}
    </Stack>
  )
}

export default withAuth(FolderPage)
