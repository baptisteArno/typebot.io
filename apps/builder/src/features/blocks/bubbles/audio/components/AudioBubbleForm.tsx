import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useState } from 'react'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { useScopedI18n } from '@/locales'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'

type Props = {
  uploadFileProps: FilePathUploadProps
  content: AudioBubbleContent
  onContentChange: (content: AudioBubbleContent) => void
}

export const AudioBubbleForm = ({
  uploadFileProps,
  content,
  onContentChange,
}: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.audio.settings')
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
          {scopedT('upload.label')}
        </Button>
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          {scopedT('embedLink.label')}
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
                colorScheme="blue"
              >
                {scopedT('chooseFile.label')}
              </UploadButton>
            </Flex>
          )}
          {currentTab === 'link' && (
            <>
              <TextInput
                placeholder={scopedT('worksWith.placeholder')}
                defaultValue={content.url ?? ''}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {scopedT('worksWith.text')}
              </Text>
            </>
          )}
        </Stack>
        <SwitchWithLabel
          label={scopedT('autoplay.label')}
          initialValue={content.isAutoplayEnabled ?? true}
          onCheckChange={updateAutoPlay}
        />
      </Stack>
    </Stack>
  )
}
