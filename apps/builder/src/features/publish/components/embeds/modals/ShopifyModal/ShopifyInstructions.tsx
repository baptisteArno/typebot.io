import { OrderedList, ListItem, Tag } from '@chakra-ui/react'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { ModalProps } from '../../EmbedButton'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { env, getViewerUrl } from 'utils'
import { CodeEditor } from '@/components/CodeEditor'
import { ChatEmbedCode } from '../../codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from '../../codeSnippets/Chat/EmbedSettings'
import { StandardEmbedWindowSettings } from '../../codeSnippets/Container/EmbedSettings'
import {
  parseInitContainerCode,
  typebotJsHtml,
} from '../../codeSnippets/params'
import { PopupEmbedCode } from '../../codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from '../../codeSnippets/Popup/EmbedSettings'

type ShopifyInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
  publicId: string
}

export const ShopifyInstructions = ({
  type,
  publicId,
}: ShopifyInstructionsProps) => {
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
    url: `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${publicId}`,
  })
  const headCode = prettier.format(
    `${typebotJsHtml}<script>${jsCode}</script>`,
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  const elementCode = prettier.format(
    `<div id="typebot-container" style="height: ${windowSizes.height}; width: ${windowSizes.width}"></div>`,
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        <CodeEditor value={headCode} mt={2} lang="html" isReadOnly />
      </ListItem>
      <ListItem>
        Then, you can place an element on which the typebot will go in any file
        in the <Tag>body</Tag> tags. It needs to have the id{' '}
        <Tag>typebot-container</Tag>:
        <StandardEmbedWindowSettings
          my={4}
          onUpdateWindowSettings={(sizes) =>
            setWindowSizes({
              height: sizes.heightLabel,
              width: sizes.widthLabel,
            })
          }
        />
        <CodeEditor value={elementCode} mt={2} lang="html" isReadOnly />
      </ListItem>
    </OrderedList>
  )
}

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        <PopupEmbedSettings
          my="4"
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
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        <ChatEmbedSettings
          my="4"
          onUpdateSettings={(settings) => setInputValues({ ...settings })}
        />
        <ChatEmbedCode mt={4} {...inputValues} />
      </ListItem>
    </OrderedList>
  )
}
