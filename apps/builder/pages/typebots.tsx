import React from 'react'
import { Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { UserContext } from 'contexts/UserContext'

const DashboardPage = () => {
  return (
    <UserContext>
      <Seo title="My typebots" />
      <Stack>
        <DashboardHeader />
        <FolderContent folder={null} />
      </Stack>
    </UserContext>
  )
}

export default DashboardPage
