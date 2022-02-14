import {
  Button,
  Divider,
  Flex,
  SimpleGrid,
  Text,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { CreateTypebotMoreButton } from 'components/templates/ImportFileMenuItem'
import { TemplateButton } from 'components/templates/TemplateButton'
import { useUser } from 'contexts/UserContext'
import { Typebot } from 'models'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { createTypebot, importTypebot } from 'services/typebots'
import { generate } from 'short-uuid'

export type TemplateProps = { name: string; emoji: string; fileName: string }
const templates: TemplateProps[] = [
  { name: 'Lead Generation', emoji: '🤝', fileName: 'lead-gen.json' },
]
export const TemplatesContent = () => {
  const { user } = useUser()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast({
    position: 'top-right',
    status: 'error',
    title: 'An error occured',
  })

  const handleCreateSubmit = async (typebot?: Typebot) => {
    if (!user) return
    setIsLoading(true)
    const folderId = router.query.folderId?.toString() ?? null
    const { error, data } = typebot
      ? await importTypebot({
          ...typebot,
          id: generate(),
          ownerId: user.id,
          folderId,
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
          <Button
            onClick={() => handleCreateSubmit()}
            isLoading={isLoading}
            colorScheme="blue"
          >
            Start from scratch
          </Button>
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
