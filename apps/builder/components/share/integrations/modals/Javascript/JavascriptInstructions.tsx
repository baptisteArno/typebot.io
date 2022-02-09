import { Stack, Tag, Text } from '@chakra-ui/react'

type JavascriptInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const JavascriptInstructions = ({
  type,
}: JavascriptInstructionsProps) => {
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
  // const [inputValues, setInputValues] = useState({
  //   heightLabel: '100%',
  //   widthLabel: '100%',
  // })

  return (
    <Stack>
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      {/* <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <ContainerEmbedCode
        withStarterVariables={true}
        {...inputValues}
        mt={4}
        onCopied={() => sendJsCopyEvent('standard')}
      /> */}
    </Stack>
  )
}

const PopupInstructions = () => {
  // const [inputValue, setInputValue] = useState(0)

  return (
    <Stack>
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      {/* <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <ContainerEmbedCode
        withStarterVariables={true}
        {...inputValues}
        mt={4}
        onCopied={() => sendJsCopyEvent('standard')}
      /> */}
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
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      {/* <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <ContainerEmbedCode
        withStarterVariables={true}
        {...inputValues}
        mt={4}
        onCopied={() => sendJsCopyEvent('standard')}
      /> */}
    </Stack>
  )
}
