import {
  VStack,
  Heading,
  Stack,
  Button,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { ToolIcon, TemplateIcon, DownloadIcon } from '@/components/icons'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { ImportSniperFromFileButton } from './ImportSniperFromFileButton'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useUser } from '@/features/account/hooks/useUser'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import { Sniper } from '@sniper.io/schemas'
import { TemplatesModal } from './TemplatesModal'

export const CreateNewSniperButtons = () => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()
  const { user } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)

  const { showToast } = useToast()

  const { mutate: createSniper } = trpc.sniper.createSniper.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      showToast({
        title: 'Failed to create bot',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/snipers/${data.sniper.id}/edit`,
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const { mutate: importSniper } = trpc.sniper.importSniper.useMutation({
    onMutate: () => {
      setIsLoading(true)
    },
    onError: (error) => {
      showToast({
        title: 'Failed to import bot',
        description: error.message,
      })
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/snipers/${data.sniper.id}/edit`,
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleCreateSubmit = async (sniper?: Sniper) => {
    if (!user || !workspace) return
    const folderId = router.query.folderId?.toString() ?? null
    if (sniper)
      importSniper({
        workspaceId: workspace.id,
        sniper: {
          ...sniper,
          folderId,
        },
      })
    else
      createSniper({
        workspaceId: workspace.id,
        sniper: {
          name: t('snipers.defaultName'),
          folderId,
        },
      })
  }

  return (
    <VStack maxW="600px" w="full" flex="1" pt="20" spacing={10}>
      <Heading>{t('templates.buttons.heading')}</Heading>
      <Stack w="full" spacing={6}>
        <Button
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={
            <ToolIcon
              color={useColorModeValue('blue.500', 'blue.300')}
              boxSize="25px"
              mr="2"
            />
          }
          onClick={() => handleCreateSubmit()}
          isLoading={isLoading}
        >
          {t('templates.buttons.fromScratchButton.label')}
        </Button>
        <Button
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={
            <TemplateIcon
              color={useColorModeValue('orange.500', 'orange.300')}
              boxSize="25px"
              mr="2"
            />
          }
          onClick={onOpen}
          isLoading={isLoading}
        >
          {t('templates.buttons.fromTemplateButton.label')}
        </Button>
        <ImportSniperFromFileButton
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={
            <DownloadIcon
              color={useColorModeValue('purple.500', 'purple.300')}
              boxSize="25px"
              mr="2"
            />
          }
          isLoading={isLoading}
          onNewSniper={handleCreateSubmit}
        >
          {t('templates.buttons.importFileButton.label')}
        </ImportSniperFromFileButton>
      </Stack>
      <TemplatesModal
        isOpen={isOpen}
        onClose={onClose}
        onSniperChoose={handleCreateSubmit}
        isLoading={isLoading}
      />
    </VStack>
  )
}
