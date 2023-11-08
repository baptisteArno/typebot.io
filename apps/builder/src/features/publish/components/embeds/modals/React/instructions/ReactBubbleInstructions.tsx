import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ListItem, OrderedList, Stack, Text } from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { InstallReactPackageSnippet } from '../InstallReactPackageSnippet'
import { ReactBubbleSnippet } from '../ReactBubbleSnippet'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'

export const ReactBubbleInstructions = () => {
  const { typebot } = useTypebot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(typebot)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <Text>Install the packages</Text>
          <InstallReactPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            theme={theme}
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ''
            }
            onThemeChange={setTheme}
            onPreviewMessageChange={setPreviewMessage}
          />
          <ReactBubbleSnippet theme={theme} previewMessage={previewMessage} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
