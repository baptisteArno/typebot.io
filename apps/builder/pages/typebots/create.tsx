import React from 'react'
import { Stack } from '@chakra-ui/react'
import { Seo } from 'components/Seo'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { UserContext } from 'contexts/UserContext'
import { TemplatesContent } from 'layouts/dashboard/TemplatesContent'

const TemplatesPage = () => {
  return (
    <UserContext>
      <Seo title="Templates" />
      <Stack>
        <DashboardHeader />
        <TemplatesContent />
      </Stack>
    </UserContext>
  )
}

export default TemplatesPage
