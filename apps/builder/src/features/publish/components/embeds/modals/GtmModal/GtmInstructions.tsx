import { CodeEditor } from '@/components/CodeEditor'
import { OrderedList, ListItem, Tag } from '@chakra-ui/react'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { env, getViewerUrl } from 'utils'
import { ChatEmbedCode } from '../../codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from '../../codeSnippets/Chat/EmbedSettings'
import { StandardEmbedWindowSettings } from '../../codeSnippets/Container/EmbedSettings'
import {
  parseInitContainerCode,
  typebotJsHtml,
} from '../../codeSnippets/params'
import { PopupEmbedCode } from '../../codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from '../../codeSnippets/Popup/EmbedSettings'
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
      env('VIEWER_INTERNAL_URL') ?? getViewerUrl({ isBuilder: true })
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
