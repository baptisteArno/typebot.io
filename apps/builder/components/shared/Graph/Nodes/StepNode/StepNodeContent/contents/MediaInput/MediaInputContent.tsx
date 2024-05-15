import { MediaBubbleContent } from 'models'
import React from 'react'
import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react'
import { Container } from './MediaInputContent.style'
import { ImageIcon, UploadFileIcon } from 'assets/icons'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import { TextHtmlContent } from '../TextHtmlContent'

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
      <TextHtmlContent html={step.content.message?.html} />

      <OctaDivider />
      {!step.content?.url ? (
        <Text pl={'8px'}>Clique para editar...</Text>
      ) : (
        <>
          <RenderContent
            url={step.content?.url}
            name={step.content?.name}
            size={step.content?.size}
            containsVariables={containsVariables}
          />
        </>
      )}
    </Container>
  )
}

export type RenderProps = {
  url: string
  name?: string
  size?: number
  fullImage?: boolean
  containsVariables?: boolean
}
export const RenderContent = ({
  url,
  containsVariables,
  name,
  size,
  fullImage,
}: RenderProps) => {
  const typed = url.split('.').pop()
  const imageTypes = ['jpg', 'png', 'bmp', 'jpeg']

  const isImage = typed && imageTypes.includes(typed)

  const resolveSize = () => {
    if (!size) return
    const sizeInBytes = size * 1000 * 1000
    let sizeInMb = sizeInBytes / 1024 / 1024
    const sizes = ['mb', 'kb', 'b']

    for (let i = 0; i < sizes.length; i++) {
      if (sizeInMb > 1) return sizeInMb.toFixed(1) + sizes[i]
      sizeInMb *= 1024
    }

    return sizeInMb.toFixed(1) + 'b'
  }

  const resolvedSize = resolveSize()

  return (
    <>
      {fullImage && (
        <Box w="full">
          {isImage && (
            <Image
              src={containsVariables ? '/images/dynamic-image.png' : url}
              alt="Block image"
              rounded="md"
              objectFit="cover"
            />
          )}
        </Box>
      )}

      <HStack>
        {!fullImage && isImage && (
          <ImageIcon fontSize={40} color="rgba(90, 99, 119, .7)" />
        )}
        {!isImage && (
          <UploadFileIcon
            fontSize={fullImage ? 80 : 40}
            color="rgba(90, 99, 119, .7)"
          />
        )}

        <Stack>
          {!fullImage && (
            <OctaTooltip
              element={<NameText name={name} fullImage={false}></NameText>}
              contentText={name || ''}
              tooltipPlacement={'auto'}
              popoverColor="#303243"
              textColor="#F4F4F5"
            />
          )}
          {fullImage && <NameText name={name} fullImage={fullImage}></NameText>}
          {(!fullImage || !isImage) && (
            <Text
              fontSize={'12px'}
              fontWeight={'normal'}
              textTransform={'uppercase'}
            >
              {typed} - {resolvedSize}
            </Text>
          )}
        </Stack>
      </HStack>
    </>
  )
}

type NameTextProps = {
  name?: string
  fullImage: boolean
}

const NameText = ({ name, fullImage }: NameTextProps) => {
  return (
    <Text
      fontSize={'14px'}
      fontWeight={'600'}
      textOverflow={'ellipsis'}
      overflow={'hidden'}
      sx={{
        display: '-webkit-box',
        '-webkit-line-clamp': '1',
        '-webkit-box-orient': 'vertical',
      }}
    >
      {name}
    </Text>
  )
}

export default MediaInputContent
