import { OrderedList, ListItem, Tag } from '@chakra-ui/react'
import { ChatEmbedCode } from 'components/share/codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from 'components/share/codeSnippets/Chat/EmbedSettings'
import { StandardEmbedWindowSettings } from 'components/share/codeSnippets/Container/EmbedSettings'
import {
  parseInitContainerCode,
  typebotJsHtml,
} from 'components/share/codeSnippets/params'
import { PopupEmbedCode } from 'components/share/codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from 'components/share/codeSnippets/Popup/EmbedSettings'
import { CodeEditor } from 'components/shared/CodeEditor'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { isEmpty } from 'utils'
import { ModalProps } from '../../EmbedButton'

type GtmInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
  publicId: string
}

export const GtmInstructions = ({ type, publicId }: GtmInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <StandardInstructions publicId={publicId} />
    }
    case 'popup': {
      return <PopupInstructions />
    }
    case 'bubble': {
      return <BubbleInstructions />
    }
  }
}

const StandardInstructions = ({ publicId }: Pick<ModalProps, 'publicId'>) => {
  const [windowSizes, setWindowSizes] = useState({
    height: '100%',
    width: '100%',
  })

  const jsCode = parseInitContainerCode({
    url: `${
      isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
        ? process.env.NEXT_PUBLIC_VIEWER_URL
        : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
    }/${publicId}`,
  })
  const headCode = `${typebotJsHtml}
  <script>
    ${jsCode}
  </script>`

  const elementCode = `<div id="typebot-container" style="height: ${windowSizes.height}; width: ${windowSizes.width}"></div>`
  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your GTM account dashboard, click on <Tag>Add a new tag</Tag>
      </ListItem>
      <ListItem>
        Choose Custom <Tag>HTML tag</Tag> type
      </ListItem>
      <ListItem>
        Paste the code below:
        <CodeEditor value={headCode} mt={2} isReadOnly lang="html" />
      </ListItem>
      <ListItem>
        On your webpage, you need to have an element on which the typebot will
        go. It needs to have the id <Tag>typebot-container</Tag>:
        <StandardEmbedWindowSettings
          my={4}
          onUpdateWindowSettings={(sizes) =>
            setWindowSizes({
              height: sizes.heightLabel,
              width: sizes.widthLabel,
            })
          }
        />
        <CodeEditor value={elementCode} mt={2} isReadOnly lang="html" />
      </ListItem>
    </OrderedList>
  )
}

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your GTM account dashboard, click on <Tag>Add a new tag</Tag>
      </ListItem>
      <ListItem>
        Choose Custom <Tag>HTML tag</Tag> type
      </ListItem>
      <ListItem>
        Paste the code below:
        <PopupEmbedSettings
          my={4}
          onUpdateSettings={(settings) => setInputValue(settings.delay)}
        />
        <PopupEmbedCode delay={inputValue} />
      </ListItem>
    </OrderedList>
  )
}

const BubbleInstructions = () => {
  const [inputValues, setInputValues] = useState<
    Pick<BubbleParams, 'proactiveMessage' | 'button'>
  >({
    proactiveMessage: undefined,
    button: {
      color: '',
      iconUrl: '',
    },
  })

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your GTM account dashboard, click on <Tag>Add a new tag</Tag>
      </ListItem>
      <ListItem>
        Choose Custom <Tag>HTML tag</Tag> type
      </ListItem>
      <ListItem>
        Paste the code below:
        <ChatEmbedSettings
          onUpdateSettings={(settings) => setInputValues({ ...settings })}
        />
        <ChatEmbedCode my={4} {...inputValues} />
      </ListItem>
    </OrderedList>
  )
}
