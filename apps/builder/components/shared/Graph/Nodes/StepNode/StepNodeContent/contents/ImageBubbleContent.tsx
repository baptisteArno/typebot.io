import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleStep } from 'models'

export const ImageBubbleContent = ({ step }: { step: ImageBubbleStep }) =>
  !step.content?.url ? (
    <Text color={'gray.500'}>Click to edit...</Text>
  ) : (
    <Box w="full">
      <Image
        src={step.content?.url}
        alt="Step image"
        rounded="md"
        objectFit="cover"
      />
    </Box>
  )
