import { OrderedList, ListItem, Code, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { JavascriptPopupSnippet } from '../../Javascript/JavascriptPopupSnippet'

export const WebflowPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Press <Code>A</Code> to open the <Code>Add elements</Code> panel
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <Text>
            Add an <Code>embed</Code> element from the <Code>components</Code>{' '}
            section and paste this code:
          </Text>
          <JavascriptPopupSnippet autoShowDelay={inputValue} />
        </Stack>
      </ListItem>
    </OrderedList>
  )
}
