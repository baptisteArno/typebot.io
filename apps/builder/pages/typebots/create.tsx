import React from 'react'
import { Stack } from '@chakra-ui/react'
import { Seo } from 'components/Seo'
import { DashboardHeader } from 'components/dashboard/DashboardHeader'
import { TemplatesContent } from 'layouts/dashboard/TemplatesContent'

const TemplatesPage = () => (
  <Stack>
    <Seo title="Templates" />
    <DashboardHeader />
    <TemplatesContent />
  </Stack>
)

export default TemplatesPage
