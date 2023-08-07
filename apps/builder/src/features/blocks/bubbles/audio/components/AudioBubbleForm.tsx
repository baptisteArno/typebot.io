import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useState } from 'react'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

type Props = {
  fileUploadPath: string
  content: AudioBubbleContent
  onContentChange: (content: AudioBubbleContent) => void
}

export const AudioBubbleForm = ({
  fileUploadPath,
  content,
  onContentChange,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<'link' | 'upload'>('link')

  const updateUrl = (url: string) => onContentChange({ ...content, url })

  const updateAutoPlay = (isAutoplayEnabled: boolean) =>
    onContentChange({ ...content, isAutoplayEnabled })

  return (
    <Stack>
      <HStack>
        <Button
          variant={currentTab === 'upload' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('upload')}
          size="sm"
        >
          Upload
        </Button>
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          Embed link
        </Button>
      </HStack>
      <Stack p="2" spacing={4}>
        <Stack>
          {currentTab === 'upload' && (
            <Flex justify="center" py="2">
              <UploadButton
                fileType="audio"
                filePath={fileUploadPath}
                onFileUploaded={updateUrl}
                colorScheme="blue"
              >
                Choose a file
              </UploadButton>
            </Flex>
          )}
          {currentTab === 'link' && (
            <>
              <TextInput
                placeholder="Paste the audio file link..."
                defaultValue={content.url ?? ''}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Works with .MP3s and .WAVs
              </Text>
            </>
          )}
        </Stack>
        <SwitchWithLabel
          label={'Enable autoplay'}
          initialValue={content.isAutoplayEnabled ?? true}
          onCheckChange={updateAutoPlay}
        />
      </Stack>
    </Stack>
  )
}
