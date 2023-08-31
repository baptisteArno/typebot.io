import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleBlock } from '@typebot.io/schemas'
import { I18nFunction } from '@/locales'

type Props = {
  scopedT: I18nFunction
  block: ImageBubbleBlock
}

export const ImageBubbleContent = ({ scopedT, block }: Props) => {
  const containsVariables =
    block.content?.url?.includes('{{') && block.content.url.includes('}}')
  return !block.content?.url ? (
    <Text color={'gray.500'}>{scopedT('bubbles.image.node.clickToEdit.text')}</Text>
  ) : (
    <Box w="full">
      <Image
        pointerEvents="none"
        src={
          containsVariables ? '/images/dynamic-image.png' : block.content?.url
        }
        alt="Group image"
        rounded="md"
        objectFit="cover"
      />
    </Box>
  )
}
