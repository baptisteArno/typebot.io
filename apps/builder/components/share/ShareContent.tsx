import { Flex, Heading, Stack, Wrap } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'
import { parseDefaultPublicId } from 'services/typebots'
import { isDefined } from 'utils'
import { EditableUrl } from './EditableUrl'
import { integrationsList } from './integrations/EmbedButton'

export const ShareContent = () => {
  const { typebot, updateOnBothTypebots } = useTypebot()

  const handlePublicIdChange = (publicId: string) => {
    if (publicId === typebot?.publicId) return
    updateOnBothTypebots({ publicId })
  }

  const publicId = typebot
    ? typebot?.publicId ?? parseDefaultPublicId(typebot.name, typebot.id)
    : ''
  const isPublished = isDefined(typebot?.publishedTypebotId)

  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start">
      <Stack maxW="1000px" w="full" pt="10" spacing={10}>
        <Stack spacing={4}>
          <Heading fontSize="2xl" as="h1">
            Your typebot link
          </Heading>
          {typebot && (
            <EditableUrl
              publicId={publicId}
              onPublicIdChange={handlePublicIdChange}
            />
          )}
        </Stack>

        <Stack spacing={4}>
          <Heading fontSize="2xl" as="h1">
            Embed your typebot
          </Heading>
          <Wrap spacing={7}>
            {integrationsList.map((IntegrationButton, idx) => (
              <IntegrationButton
                key={idx}
                publicId={publicId}
                isPublished={isPublished}
              />
            ))}
          </Wrap>
        </Stack>
      </Stack>
    </Flex>
  )
}
