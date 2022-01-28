import React from 'react'
import { Stack } from '@chakra-ui/layout'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { Seo } from 'components/Seo'
import { FolderContent } from 'components/dashboard/FolderContent'
import { TypebotDndContext } from 'contexts/TypebotDndContext'

const DashboardPage = () => {
  return (
    <Stack minH="100vh">
      <Seo title="My typebots" />
      <DashboardHeader />
      <TypebotDndContext>
        <FolderContent folder={null} />
      </TypebotDndContext>
    </Stack>
  )
}

export default DashboardPage
