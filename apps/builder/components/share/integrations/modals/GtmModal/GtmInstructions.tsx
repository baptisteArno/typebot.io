import { OrderedList, ListItem, Tag } from '@chakra-ui/react'
import { useState } from 'react'

type GtmInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const GtmInstructions = ({ type }: GtmInstructionsProps) => {
  switch (type) {
    case 'standard': {
      return <StandardInstructions />
    }
    case 'popup': {
      return <PopupInstructions />
    }
    case 'bubble': {
      return <BubbleInstructions />
    }
  }
}

const StandardInstructions = () => {
  // const [windowSizes, setWindowSizes] = useState({
  //   height: '100%',
  //   width: '100%',
  // })

  // const jsCode = parseInitContainerCode({
  //   publishId: chatbot?.publishId ?? '',
  //   backgroundColor: chatbot?.themeColors.chatbotBackground.value,
  //   customDomain: chatbot?.customDomains[0],
  // })
  // const headCode = `${typebotJsHtml}
  // <script>
  //   ${jsCode}
  // </script>`

  // const elementCode = `<div id="typebot-container" style="background-color: ${backgroundColor}; height: ${windowSizes.height}; width: ${windowSizes.width}"></div>`
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
        {/* <CodeEditor
          code={headCode}
          mt={2}
          onCopied={() => sendGtmCopyEvent('standard')}
        /> */}
      </ListItem>
      <ListItem>
        On your webpage, you need to have an element on which the typebot will
        go. It needs to have the id <Tag>typebot-container</Tag>:
        {/* <StandardEmbedWindowSettings
          my={4}
          onUpdateWindowSettings={(sizes) =>
            setWindowSizes({
              height: sizes.heightLabel,
              width: sizes.widthLabel,
            })
          }
        />
        <CodeBlock code={elementCode} mt={2} /> */}
      </ListItem>
    </OrderedList>
  )
}

const PopupInstructions = () => {
  // const [inputValue, setInputValue] = useState(0)

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
        {/* <PopupEmbedSettings
          mb={4}
          onUpdateSettings={(settings) => setInputValue(settings.delay ?? 0)}
        />
        <PopupEmbedCode
          delay={inputValue}
          onCopied={() => sendGtmCopyEvent('popup')}
        /> */}
      </ListItem>
    </OrderedList>
  )
}

const BubbleInstructions = () => {
  // const [inputValues, setInputValues] = useState<
  //   Pick<BubbleParams, 'proactiveMessage' | 'button'>
  // >({
  //   proactiveMessage: undefined,
  //   button: {
  //     color: '',
  //     iconUrl: '',
  //   },
  // })

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
        {/* <ChatEmbedSettings
          onUpdateSettings={(settings) => setInputValues({ ...settings })}
        />
        <ChatEmbedCode
          mt={4}
          {...inputValues}
          onCopied={() => sendGtmCopyEvent('bubble')}
        /> */}
      </ListItem>
    </OrderedList>
  )
}
