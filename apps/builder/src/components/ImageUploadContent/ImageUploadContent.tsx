import { useState } from 'react'
import { Button, Flex, HStack, Stack } from '@chakra-ui/react'
import { UploadButton } from './UploadButton'
import { GiphySearchForm } from './GiphySearchForm'
import { TextInput } from '../inputs/TextInput'
import { EmojiSearchableList } from './emoji/EmojiSearchableList'

type Props = {
  filePath: string
  includeFileName?: boolean
  defaultUrl?: string
  isEmojiEnabled?: boolean
  isGiphyEnabled?: boolean
  onSubmit: (url: string) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  filePath,
  includeFileName,
  defaultUrl,
  onSubmit,
  isEmojiEnabled = false,
  isGiphyEnabled = true,
  onClose,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<
    'link' | 'upload' | 'giphy' | 'emoji'
  >(isEmojiEnabled ? 'emoji' : 'link')

  const handleSubmit = (url: string) => {
    onSubmit(url)
    onClose && onClose()
  }

  return (
    <Stack>
      <HStack>
        {isEmojiEnabled && (
          <Button
            variant={currentTab === 'emoji' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('emoji')}
            size="sm"
          >
            Emoji
          </Button>
        )}
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          Embed link
        </Button>
        <Button
          variant={currentTab === 'upload' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('upload')}
          size="sm"
        >
          Upload
        </Button>
        {isGiphyEnabled && (
          <Button
            variant={currentTab === 'giphy' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('giphy')}
            size="sm"
          >
            Giphy
          </Button>
        )}
      </HStack>

      <BodyContent
        filePath={filePath}
        includeFileName={includeFileName}
        tab={currentTab}
        onSubmit={handleSubmit}
        defaultUrl={defaultUrl}
      />
    </Stack>
  )
}

const BodyContent = ({
  includeFileName,
  filePath,
  tab,
  defaultUrl,
  onSubmit,
}: {
  includeFileName?: boolean
  filePath: string
  tab: 'upload' | 'link' | 'giphy' | 'emoji'
  defaultUrl?: string
  onSubmit: (url: string) => void
}) => {
  switch (tab) {
    case 'upload':
      return (
        <UploadFileContent
          filePath={filePath}
          includeFileName={includeFileName}
          onNewUrl={onSubmit}
        />
      )
    case 'link':
      return <EmbedLinkContent defaultUrl={defaultUrl} onNewUrl={onSubmit} />
    case 'giphy':
      return <GiphyContent onNewUrl={onSubmit} />
    case 'emoji':
      return <EmojiSearchableList onEmojiSelected={onSubmit} />
  }
}

type ContentProps = { onNewUrl: (url: string) => void }

const UploadFileContent = ({
  filePath,
  includeFileName,
  onNewUrl,
}: ContentProps & { filePath: string; includeFileName?: boolean }) => (
  <Flex justify="center" py="2">
    <UploadButton
      fileType="image"
      filePath={filePath}
      onFileUploaded={onNewUrl}
      includeFileName={includeFileName}
      colorScheme="blue"
    >
      Choose an image
    </UploadButton>
  </Flex>
)

const EmbedLinkContent = ({
  defaultUrl,
  onNewUrl,
}: ContentProps & { defaultUrl?: string }) => (
  <Stack py="2">
    <TextInput
      placeholder={'Paste the image link...'}
      onChange={onNewUrl}
      defaultValue={defaultUrl ?? ''}
    />
  </Stack>
)

const GiphyContent = ({ onNewUrl }: ContentProps) => (
  <GiphySearchForm onSubmit={onNewUrl} />
)
