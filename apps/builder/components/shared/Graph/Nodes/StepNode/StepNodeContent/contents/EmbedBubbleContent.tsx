import { Box, Text } from '@chakra-ui/react'
import { EmbedBubbleStep } from 'models'

export const EmbedBubbleContent = ({ step }: { step: EmbedBubbleStep }) => {
  if (!step.content?.url)
    return <Text color="gray.500">Clique para editar...</Text>
  return (
    <Box w="full" h="120px" pos="relative">
      <iframe
        id="embed-bubble-content"
        src={step.content.url}
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
