import { useState } from 'react'
import { Button, Flex, HStack, Stack } from '@chakra-ui/react'
import { UploadButton } from '../buttons/UploadButton'
import { GiphySearchForm } from './GiphySearchForm'
import { useTypebot } from 'contexts/TypebotContext'
import { Input } from '../Textbox/Input'
import { EmojiSearchableList } from './emoji/EmojiSearchableList'

type Props = {
  url?: string
  isEmojiEnabled?: boolean
  isGiphyEnabled?: boolean
  onSubmit: (url: string) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  url,
  onSubmit,
  isEmojiEnabled = false,
  isGiphyEnabled = true,
  onClose,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<
    'link' | 'upload' | 'giphy' | 'emoji'
  >(isEmojiEnabled ? 'emoji' : 'upload')

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

      <BodyContent tab={currentTab} onSubmit={handleSubmit} url={url} />
    </Stack>
  )
}

const BodyContent = ({
  tab,
  url,
  onSubmit,
}: {
  tab: 'upload' | 'link' | 'giphy' | 'emoji'
  url?: string
  onSubmit: (url: string) => void
}) => {
  switch (tab) {
    case 'upload':
      return <UploadFileContent onNewUrl={onSubmit} />
    case 'link':
      return <EmbedLinkContent initialUrl={url} onNewUrl={onSubmit} />
    case 'giphy':
      return <GiphyContent onNewUrl={onSubmit} />
    case 'emoji':
      return <EmojiSearchableList onEmojiSelected={onSubmit} />
  }
}

type ContentProps = { initialUrl?: string; onNewUrl: (url: string) => void }

const UploadFileContent = ({ onNewUrl }: ContentProps) => {
  const { typebot } = useTypebot()
  return (
    <Flex justify="center" py="2">
      <UploadButton
        filePath={`public/typebots/${typebot?.id}`}
        onFileUploaded={onNewUrl}
        includeFileName
        colorScheme="blue"
      >
        Choose an image
      </UploadButton>
    </Flex>
  )
}

const EmbedLinkContent = ({ initialUrl, onNewUrl }: ContentProps) => (
  <Stack py="2">
    <Input
      placeholder={'Paste the image link...'}
      onChange={onNewUrl}
      defaultValue={initialUrl ?? ''}
    />
  </Stack>
)

const GiphyContent = ({ onNewUrl }: ContentProps) => (
  <GiphySearchForm onSubmit={onNewUrl} />
)
