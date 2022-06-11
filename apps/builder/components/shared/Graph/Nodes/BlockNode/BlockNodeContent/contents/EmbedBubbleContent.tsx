import { Box, Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from 'models'

export const EmbedBubbleContent = ({ block }: { block: EmbedBubbleBlock }) => {
  if (!block.content?.url) return <Text color="gray.500">Click to edit...</Text>
  return (
    <Box w="full" h="120px" pos="relative">
      <iframe
        id="embed-bubble-content"
        src={block.content.url}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          borderRadius: '5px',
        }}
      />
    </Box>
  )
}
