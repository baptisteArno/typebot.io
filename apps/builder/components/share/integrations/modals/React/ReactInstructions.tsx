import { Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'

type Props = {
  type: 'standard' | 'popup' | 'bubble'
}

export const ReactInstructions = ({ type }: Props) => {
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
    <Stack spacing={4}>
      {/* <InstallPackageInstruction /> */}
      {/* <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      /> */}
      {/* <Text>{t('insert-the-typebot-container')}</Text>
      <StandardReactDiv {...inputValues} /> */}
    </Stack>
  )
}

const PopupInstructions = () => {
  // const [inputValue, setInputValue] = useState(0)

  return (
    <Stack spacing={4}>
      {/* <InstallPackageInstruction />
      <PopupEmbedSettings
        onUpdateSettings={(settings) => setInputValue(settings.delay ?? 0)}
      />
      <Text>{t('initialize-the-typebot')}</Text>
      <PopupReactCode withStarterVariables={true} delay={inputValue} /> */}
    </Stack>
  )
}

const BubbleInstructions = () => {
  // const { t } = useTranslation()
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
    <Stack spacing={4}>
      {/* <InstallPackageInstruction />
      <ChatEmbedSettings
        onUpdateSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>{t('initialize-the-typebot')}</Text>
      <ChatReactCode withStarterVariables={true} {...inputValues} mt={4} /> */}
    </Stack>
  )
}

const InstallPackageInstruction = () => {
  return (
    <Stack>
      <Text>Install the package:</Text>
      <CodeEditor value={`npm install typebot-js`} isReadOnly />
    </Stack>
  )
}
