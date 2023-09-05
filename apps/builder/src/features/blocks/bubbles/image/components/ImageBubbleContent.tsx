import { useScopedI18n } from '@/locales'
import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleBlock } from '@typebot.io/schemas'

type Props = {
  block: ImageBubbleBlock
}

export const ImageBubbleContent = ({ block }: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.image.node')
  const containsVariables =
    block.content?.url?.includes('{{') && block.content.url.includes('}}')
  return !block.content?.url ? (
    <Text color={'gray.500'}>{scopedT('clickToEdit.text')}</Text>
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
