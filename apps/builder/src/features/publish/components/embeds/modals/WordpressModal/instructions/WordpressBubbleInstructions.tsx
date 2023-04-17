import { CodeEditor } from '@/components/inputs/CodeEditor'
import { ExternalLinkIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  OrderedList,
  ListItem,
  useColorModeValue,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/js'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { parseApiHostValue, parseInitBubbleCode } from '../../../snippetParsers'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'

type Props = {
  publicId: string
}
export const WordpressBubbleInstructions = ({ publicId }: Props) => {
  const { typebot } = useTypebot()

  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(typebot)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  const initCode = parseInitBubbleCode({
    typebot: publicId,
    apiHost: parseApiHostValue(typebot?.customDomain),
    theme: {
      ...theme,
      chatWindow: {
        backgroundColor: typebot?.theme.general.background.content ?? '#fff',
      },
    },
    previewMessage,
  })

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{' '}
        <Link
          href="https://wordpress.org/plugins/typebot/"
          isExternal
          color={useColorModeValue('blue.500', 'blue.300')}
        >
          the official Typebot WordPress plugin
          <ExternalLinkIcon mx="2px" />
        </Link>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat.hostAvatar?.url ?? ''
            }
            theme={theme}
            onPreviewMessageChange={setPreviewMessage}
            onThemeChange={setTheme}
          />
          <Text>
            You can now place the following code snippet in the Typebot panel in
            your WordPress admin:
          </Text>
          <CodeEditor value={initCode} lang="javascript" isReadOnly />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
