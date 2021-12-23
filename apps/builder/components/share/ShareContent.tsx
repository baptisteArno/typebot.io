import { Flex, Heading, Stack } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import React from 'react'
import { parseDefaultPublicId } from 'services/typebots'
import { EditableUrl } from './EditableUrl'

export const ShareContent = () => {
  const { typebot, updatePublicId } = useTypebot()

  const handlePublicIdChange = (publicId: string) => {
    if (publicId === typebot?.publicId) return
    updatePublicId(publicId)
  }
  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start">
      <Stack maxW="1000px" w="full" pt="10" spacing={6}>
        <Heading fontSize="2xl" as="h1">
          Your typebot link
        </Heading>
        {typebot && (
          <EditableUrl
            publicId={
              typebot?.publicId ??
              parseDefaultPublicId(typebot.name, typebot.id)
            }
            onPublicIdChange={handlePublicIdChange}
          />
        )}
        <Heading fontSize="2xl" as="h1">
          Embed your typebot
        </Heading>
      </Stack>
    </Flex>
  )
}
