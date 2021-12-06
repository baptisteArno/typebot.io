import withAuth from 'components/HOC/withUser'
import React from 'react'
import { Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'

const DashboardPage = () => {
  return (
    <Stack>
      <Seo title="My typebots" />
      <DashboardHeader />
      <FolderContent folder={null} />
    </Stack>
  )
}

export default withAuth(DashboardPage)
