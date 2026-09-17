import { Button, Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { TextInput } from '@/components/inputs'
import { useState } from 'react'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { useTranslate } from '@tolgee/react'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { AudioBubbleBlock } from '@typebot.io/schemas'
import { AudioBubbleIcon } from './AudioBubbleIcon'

const acceptedAudioFileTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
]
const maxAudioUploadSizeInMB = 16

type Props = {
  uploadFileProps: FilePathUploadProps
  content: AudioBubbleBlock['content']
  onContentChange: (content: AudioBubbleBlock['content']) => void
}

export const AudioBubbleForm = ({
  uploadFileProps,
  content,
  onContentChange,
}: Props) => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<'link' | 'upload'>('upload')

  const updateUrl = (url: string) => onContentChange({ ...content, url })

  return (
    <Stack>
      <HStack>
        <Button
          variant={currentTab === 'upload' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('upload')}
          size="sm"
        >
          {t('editor.blocks.bubbles.audio.settings.upload.label')}
        </Button>
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          {t('editor.blocks.bubbles.audio.settings.embedLink.label')}
        </Button>
      </HStack>
      <Stack p="2" spacing={4}>
        <Stack>
          {currentTab === 'upload' && (
            <Flex justify="center" py="2">
              <UploadButton
                fileType="audio"
                filePathProps={uploadFileProps}
                onFileUploaded={updateUrl}
                acceptedFileTypes={acceptedAudioFileTypes}
                maxSizeInMB={maxAudioUploadSizeInMB}
                variant="outline"
                borderStyle="dashed"
                borderWidth="2px"
                height="auto"
                w="full"
                py="6"
                whiteSpace="normal"
              >
                <VStack spacing={1}>
                  <AudioBubbleIcon boxSize={6} />
                  <Text fontWeight="medium">
                    {t('editor.blocks.bubbles.audio.settings.chooseFile.label')}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {t(
                      'editor.blocks.bubbles.audio.settings.acceptedFormats.text'
                    )}
                  </Text>
                </VStack>
              </UploadButton>
            </Flex>
          )}
          {currentTab === 'link' && (
            <>
              <TextInput
                placeholder={t(
                  'editor.blocks.bubbles.audio.settings.worksWith.placeholder'
                )}
                defaultValue={content?.url ?? ''}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {t('editor.blocks.bubbles.audio.settings.worksWith.text')}
              </Text>
            </>
          )}
        </Stack>
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {t('editor.blocks.bubbles.audio.settings.helperText.text')}
        </Text>
      </Stack>
    </Stack>
  )
}
