import {
  Button,
  Divider,
  Flex,
  SimpleGrid,
  Text,
  Stack,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { CreateTypebotMoreButton } from 'components/templates/ImportFileMenuItem'
import { TemplateButton } from 'components/templates/TemplateButton'
import { useUser } from 'contexts/UserContext'
import { defaultTheme, Typebot } from 'models'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { createTypebot, importTypebot } from 'services/typebots/typebots'

export type TemplateProps = { name: string; emoji: string; fileName: string }
const templates: TemplateProps[] = [
  { name: 'Lead Generation', emoji: '🤝', fileName: 'lead-gen.json' },
]
export const TemplatesContent = () => {
  const { user } = useUser()
  const router = useRouter()
  const [isFromScratchTooltipOpened, setIsFromScratchTooltipOpened] =
    useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast({
    position: 'top-right',
    status: 'error',
    title: 'An error occured',
  })

  useEffect(() => {
    if (!router.isReady) return
    const isFirstBot = router.query.isFirstBot as string | undefined
    if (isFirstBot) setIsFromScratchTooltipOpened(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  const handleCreateSubmit = async (typebot?: Typebot) => {
    if (!user) return
    setIsLoading(true)
    const folderId = router.query.folderId?.toString() ?? null
    const { error, data } = typebot
      ? await importTypebot({
          ...typebot,
          ownerId: user.id,
          folderId,
          theme: {
            ...defaultTheme,
            chat: {
              ...defaultTheme.chat,
              hostAvatar: { isEnabled: true, url: user.image ?? undefined },
            },
          },
        })
      : await createTypebot({
          folderId,
        })
    if (error) toast({ description: error.message })
    if (data) router.push(`/typebots/${data.id}/edit`)
    setIsLoading(false)
  }

  return (
    <Flex w="full" justifyContent="center">
      <Stack maxW="1000px" flex="1" pt="6" spacing={4}>
        <Flex justifyContent="space-between">
          <Tooltip
            isOpen={isFromScratchTooltipOpened}
            label="Strongly suggested if you're new to Typebot."
            maxW="200px"
            hasArrow
            placement="right"
            rounded="md"
          >
            <Button
              onClick={() => handleCreateSubmit()}
              isLoading={isLoading}
              colorScheme="blue"
            >
              Start from scratch
            </Button>
          </Tooltip>

          <CreateTypebotMoreButton onNewTypebot={handleCreateSubmit} />
        </Flex>
        <Divider />
        <Text>Or start from a template</Text>
        <SimpleGrid columns={2} spacing={4}>
          {templates.map((template) => (
            <TemplateButton
              key={template.name}
              onClick={handleCreateSubmit}
              template={template}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Flex>
  )
}
