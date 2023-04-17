import { ChangeEvent, useState } from 'react'
import {
  Button,
  Flex,
  HStack,
  Stack,
  Text,
  Input as ClassicInput,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react'
import { SearchContextManager } from '@giphy/react-components'
import { UploadButton } from '../buttons/UploadButton'
import { GiphySearch } from './GiphySearch'
import { useTypebot } from 'contexts/TypebotContext'
import { BaseEmoji, emojiIndex } from 'emoji-mart'
import { emojis } from './emojis'
import { Input } from '../Textbox/Input'
import { isEmpty } from 'utils'

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
      <UploadFileContent onNewUrl={onSubmit} />
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
      return <EmojiContent onEmojiSelected={onSubmit} />
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
        Selecione um arquivo
      </UploadButton>
    </Flex>
  )
}

const EmbedLinkContent = ({ initialUrl, onNewUrl }: ContentProps) => (
  <Stack py="2">
    <Input
      placeholder={'Cole o link da imagem...'}
      onChange={onNewUrl}
      defaultValue={initialUrl ?? ''}
    />
  </Stack>
)

const EmojiContent = ({
  onEmojiSelected,
}: {
  onEmojiSelected: (emoji: string) => void
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [filteredEmojis, setFilteredEmojis] = useState<string[]>(emojis)

  const handleEmojiClick = (emoji: string) => () => onEmojiSelected(emoji)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    setFilteredEmojis(
      emojiIndex.search(e.target.value)?.map((o) => (o as BaseEmoji).native) ??
        emojis
    )
  }

  return (
    <Stack>
      <ClassicInput
        placeholder="Pesquisar..."
        value={searchValue}
        onChange={handleSearchChange}
      />
      <SimpleGrid
        maxH="350px"
        overflowY="scroll"
        overflowX="hidden"
        spacing={0}
        columns={7}
      >
        {filteredEmojis.map((emoji) => (
          <GridItem key={emoji}>
            <Button
              onClick={handleEmojiClick(emoji)}
              variant="ghost"
              size="sm"
              fontSize="xl"
            >
              {emoji}
            </Button>
          </GridItem>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

const GiphyContent = ({ onNewUrl }: ContentProps) => {
  if (isEmpty(process.env.NEXT_PUBLIC_GIPHY_API_KEY))
    return <Text>NEXT_PUBLIC_GIPHY_API_KEY is missing in environment</Text>
  return (
    <SearchContextManager
      apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY as string}
    >
      <GiphySearch onSubmit={onNewUrl} />
    </SearchContextManager>
  )
}
