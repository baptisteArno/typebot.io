import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleStep } from 'models'

export const ImageBubbleContent = ({ step }: { step: ImageBubbleStep }) => {
  const containsVariables =
    step.content?.url?.includes('{{') && step.content.url.includes('}}')
  return !step.content?.url ? (
    <Text color={'gray.500'}>Click to edit...</Text>
  ) : (
    <Box w="full">
      <Image
        src={
          containsVariables ? '/images/dynamic-image.png' : step.content?.url
        }
        alt="Block image"
        rounded="md"
        objectFit="cover"
      />
    </Box>
  )
}
