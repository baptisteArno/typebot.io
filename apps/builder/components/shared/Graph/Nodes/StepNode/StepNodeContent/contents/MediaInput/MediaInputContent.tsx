import { MediaBubbleContent } from 'models'
import React from 'react'
import { Box, Image, Stack, Text } from '@chakra-ui/react'
import { Container } from './MediaInputContent.style'
import { UploadFileIcon } from 'assets/icons'

type Props = {
  step: {
    type: string
    content: MediaBubbleContent
  }
}

const MediaInputContent = ({ step }: Props) => {
  const containsVariables =
    step.content?.url?.includes('{{') && step.content.url.includes('}}')

  return (
    <Container>
      {
        <Stack>
          <Text color={'gray.500'} noOfLines={0}>
            <strong>Texto da mensagem:</strong>
          </Text>
          <Text color={'gray.500'} noOfLines={0}>
            {step.content.message?.plainText && <label>{step.content.message?.plainText}</label>}
            {!step.content.message?.plainText && <i>Não informado.</i>}
          </Text>
        </Stack>
      }
      {!step.content?.url ? (
        <Text color={'gray.500'} pl={'8px'}>Clique para editar...</Text>
      ) : (
        <RenderContent url={step.content?.url} containsVariables={containsVariables} ignoreGenericIcon={false} />
      )}
    </Container>
  )
}

export type RenderProps = {
  url: string;
  containsVariables: boolean | undefined;
  ignoreGenericIcon: boolean
}
export const RenderContent = ({ url, containsVariables, ignoreGenericIcon }: RenderProps) => {
  let typed;
  const urlType = /^[h].+(.{3}?)$/g.exec(url);

  if (urlType && urlType.length > 0) {
    typed = urlType[1];
  }

  if (typed === 'jpg' || typed === 'png' || typed === 'bmp' || typed === 'jpeg') {
    return (
      <Box w="full" >
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
  if (!ignoreGenericIcon)
    return (
      <Box w="full" h="120px" pos="relative">
        <UploadFileIcon fontSize={120} color='rgba(90, 99, 119, .7)' />
      </Box>
    )
  
  return <span></span>
}

export default MediaInputContent