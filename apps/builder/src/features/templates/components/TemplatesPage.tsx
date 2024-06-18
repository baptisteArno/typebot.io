import { Seo } from '@/components/Seo'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { VStack } from '@chakra-ui/react'
import { CreateNewSniperButtons } from './CreateNewSniperButtons'

export const TemplatesPage = () => (
  <VStack h="100vh">
    <Seo title="Templates" />
    <DashboardHeader />
    <CreateNewSniperButtons />
  </VStack>
)
