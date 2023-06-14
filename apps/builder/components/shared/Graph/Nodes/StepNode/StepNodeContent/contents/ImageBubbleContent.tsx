import { Box, Text, Image } from '@chakra-ui/react'
import { UploadFileIcon } from 'assets/icons';
import { MediaBubbleStep } from 'models'

type RenderProps = {
  url: string;
  containsVariables: boolean | undefined;
}
const RenderContent = ({ url, containsVariables }: RenderProps) => {
  let typed;
  const urlType = /^[h].+(.{3}?)$/g.exec(url);

  if (urlType && urlType.length > 0) {
    typed = urlType[1];
  }

  if (typed === 'jpg' || typed === 'png' || typed === 'bmp' || typed === 'jpeg') {
    return (
      <Box w="full">
        <Image
          src={
            containsVariables ? '/images/dynamic-image.png' : url
          }
          alt="Block image"
          rounded="md"
          objectFit="cover"
        />
      </Box>
    )
  }
  return (
    <Box w="full" h="120px" pos="relative">
      <UploadFileIcon fontSize={120} color='rgba(90, 99, 119, .7)' />
    </Box>
  )
}

export const ImageBubbleContent = ({ step }: { step: MediaBubbleStep }) => {
  const containsVariables =
    step.content?.url?.includes('{{') && step.content.url.includes('}}')
  return !step.content?.url ? (
    <Text color={'gray.500'} pl={'8px'}>Clique para editar...</Text>
  ) : (
    <RenderContent url={step.content?.url} containsVariables={containsVariables} />
  )
}
