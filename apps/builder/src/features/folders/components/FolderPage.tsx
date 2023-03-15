import { Seo } from '@/components/Seo'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { useToast } from '@/hooks/useToast'
import { useI18n } from '@/locales'
import { Stack, Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useFolder } from '../hooks/useFolder'
import { TypebotDndProvider } from '../TypebotDndProvider'
import { FolderContent } from './FolderContent'

export const FolderPage = () => {
  const t = useI18n()
  const router = useRouter()

  const { showToast } = useToast()

  const { folder } = useFolder({
    folderId: router.query.id?.toString(),
    onError: (error) => {
      showToast({
        description: error.message,
      })
    },
  })

  return (
    <Stack minH="100vh">
      <Seo title={t('dashboard.title')} />
      <DashboardHeader />
      <TypebotDndProvider>
        {!folder ? (
          <Flex flex="1">
            <Spinner mx="auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </TypebotDndProvider>
    </Stack>
  )
}
