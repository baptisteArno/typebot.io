import { VStack, Heading, Stack, Button, useDisclosure } from '@chakra-ui/react'
import { ToolIcon, TemplateIcon, DownloadIcon } from '@/components/icons'
import { Typebot } from 'models'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { ImportTypebotFromFileButton } from './ImportTypebotFromFileButton'
import { TemplatesModal } from './TemplatesModal'
import { useWorkspace } from '@/features/workspace'
import { useUser } from '@/features/account'
import { useToast } from '@/hooks/useToast'
import { createTypebotQuery, importTypebotQuery } from '@/features/dashboard'

export const CreateNewTypebotButtons = () => {
  const { workspace } = useWorkspace()
  const { user } = useUser()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isLoading, setIsLoading] = useState(false)

  const { showToast } = useToast()

  const handleCreateSubmit = async (typebot?: Typebot) => {
    if (!user || !workspace) return
    setIsLoading(true)
    const folderId = router.query.folderId?.toString() ?? null
    const { error, data } = typebot
      ? await importTypebotQuery(
          {
            ...typebot,
            folderId,
            workspaceId: workspace.id,
            theme: {
              ...typebot.theme,
              chat: {
                ...typebot.theme.chat,
                hostAvatar: { isEnabled: true, url: user.image ?? undefined },
              },
            },
          },
          workspace.plan
        )
      : await createTypebotQuery({
          folderId,
          workspaceId: workspace.id,
        })
    if (error) showToast({ description: error.message })
    if (data)
      router.push({
        pathname: `/typebots/${data.id}/edit`,
        query:
          router.query.isFirstBot === 'true'
            ? {
                isFirstBot: 'true',
              }
            : {},
      })
    setIsLoading(false)
  }

  return (
    <VStack maxW="600px" w="full" flex="1" pt="20" spacing={10}>
      <Heading>Create a new typebot</Heading>
      <Stack w="full" spacing={6}>
        <Button
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={<ToolIcon color="blue.500" boxSize="25px" mr="2" />}
          onClick={() => handleCreateSubmit()}
          isLoading={isLoading}
        >
          Start from scratch
        </Button>
        <Button
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={<TemplateIcon color="orange.500" boxSize="25px" mr="2" />}
          onClick={onOpen}
          isLoading={isLoading}
        >
          Start from a template
        </Button>
        <ImportTypebotFromFileButton
          variant="outline"
          w="full"
          py="8"
          fontSize="lg"
          leftIcon={<DownloadIcon color="purple.500" boxSize="25px" mr="2" />}
          isLoading={isLoading}
          onNewTypebot={handleCreateSubmit}
        >
          Import a file
        </ImportTypebotFromFileButton>
      </Stack>
      <TemplatesModal
        isOpen={isOpen}
        onClose={onClose}
        onTypebotChoose={handleCreateSubmit}
      />
    </VStack>
  )
}
