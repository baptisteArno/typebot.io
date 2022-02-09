import { OrderedList, ListItem, Tag } from '@chakra-ui/react'

type ShopifyInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const ShopifyInstructions = ({ type }: ShopifyInstructionsProps) => {
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
  // const backgroundColor = chatbot?.themeColors.siteBackground.value
  // const [windowSizes, setWindowSizes] = useState({
  //   height: '100%',
  //   width: '100%',
  // })

  // const jsCode = parseInitContainerCode({
  //   publishId: chatbot?.publishId ?? '',
  //   customDomain: chatbot?.customDomains[0],
  //   backgroundColor: chatbot?.themeColors.chatbotBackground.value,
  // })
  // const headCode = `${typebotJsHtml}
  // <script>
  //   ${jsCode}
  // </script>`

  // const elementCode = `<div id="typebot-container" style="background-color: ${backgroundColor}; height: ${windowSizes.height}; width: ${windowSizes.width}"></div>`

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        {/* <CodeBlock
          code={headCode}
          mt={2}
          onCopied={() => sendShopifyCopyEvent('standard')}
        /> */}
      </ListItem>
      <ListItem>
        Then, you can place an element on which the typebot will go in any file
        in the <Tag>body</Tag> tags. It needs to have the id{' '}
        <Tag>typebot-container</Tag>:
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
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        {/* <PopupEmbedSettings
            mb={4}
            onUpdateSettings={(settings) => setInputValue(settings.delay ?? 0)}
          />
          <PopupEmbedCode
            delay={inputValue}
            onCopied={() => sendShopifyCopyEvent('popup')}
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
        On your shop dashboard in the <Tag>Themes</Tag> page, click on{' '}
        <Tag>Actions {'>'} Edit code</Tag>
      </ListItem>
      <ListItem>
        In <Tag>Layout {'>'} theme.liquid</Tag> file, paste this code just
        before the closing <Tag>head</Tag> tag:
        {/* <ChatEmbedSettings
        onUpdateSettings={(settings) => setInputValues({ ...settings })}
      />
      <ChatEmbedCode
        mt={4}
        {...inputValues}
        onCopied={() => sendShopifyCopyEvent('bubble')}
      /> */}
      </ListItem>
    </OrderedList>
  )
}
