import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleBlock } from 'models'

export const ImageBubbleContent = ({ block }: { block: ImageBubbleBlock }) => {
  const containsVariables =
    block.content?.url?.includes('{{') && block.content.url.includes('}}')
  return !block.content?.url ? (
    <Text color={'gray.500'}>Click to edit...</Text>
  ) : (
    <Box w="full">
      <Image
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
