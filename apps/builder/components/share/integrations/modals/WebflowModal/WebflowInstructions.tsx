import { OrderedList, ListItem, Tag, Text, Stack } from '@chakra-ui/react'

type WebflowInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const WebflowInstructions = ({ type }: WebflowInstructionsProps) => {
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
    default:
      return <></>
  }
}

const StandardInstructions = () => (
  <Stack>
    <Text>In the Webflow editor:</Text>
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
      </ListItem>
      <ListItem>
        Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
        section and paste this code:
        {/* <ContainerEmbedCode
          widthLabel="100%"
          heightLabel="100%"
          mt={4}
          onCopied={() => sendWebflowCopyEvent('standard')}
        /> */}
      </ListItem>
    </OrderedList>
  </Stack>
)

const PopupInstructions = () => {
  // const [inputValue, setInputValue] = useState(0)

  return (
    <Stack>
      <Text>In the Webflow editor</Text>
      <OrderedList spacing={2} mb={4}>
        <ListItem>
          Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
        </ListItem>
        <ListItem>
          Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
          section and paste this code:
          {/* <PopupEmbedSettings
            onUpdateSettings={(settings) => setInputValue(settings.delay ?? 0)}
            mt={4}
          />
          <PopupEmbedCode
            delay={inputValue}
            mt={4}
            onCopied={() => sendWebflowCopyEvent('popup')}
          /> */}
        </ListItem>
      </OrderedList>
    </Stack>
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
    <Stack>
      <Text>In the Webflow editor</Text>
      <OrderedList spacing={2} mb={4}>
        <ListItem>
          Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
        </ListItem>
        <ListItem>
          Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
          section and paste this code:
          {/* <ChatEmbedSettings
            onUpdateSettings={(settings) => setInputValues({ ...settings })}
            mt={4}
          />
          <ChatEmbedCode
            withStarterVariables={true}
            {...inputValues}
            mt={4}
            onCopied={() => sendWebflowCopyEvent('bubble')}
          /> */}
        </ListItem>
      </OrderedList>
    </Stack>
  )
}
