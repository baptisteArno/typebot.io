import { Seo } from '@/components/Seo'
import { DashboardHeader } from '@/features/dashboard'
import { VStack } from '@chakra-ui/react'
import { CreateNewTypebotButtons } from './CreateNewTypebotButtons'

export const TemplatesPage = () => (
  <VStack h="100vh">
    <Seo title="Templates" />
    <DashboardHeader />
    <CreateNewTypebotButtons />
  </VStack>
)
