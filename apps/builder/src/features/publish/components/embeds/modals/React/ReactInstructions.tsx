import { CodeEditor } from '@/components/CodeEditor'
import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { ChatEmbedSettings } from '../../codeSnippets/Chat/EmbedSettings'
import { StandardEmbedWindowSettings } from '../../codeSnippets/Container/EmbedSettings'
import { PopupEmbedSettings } from '../../codeSnippets/Popup/EmbedSettings'
import {
  StandardReactDiv,
  PopupReactCode,
  ChatReactCode,
} from '../../codeSnippets/ReactCode'

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
  const [inputValues, setInputValues] = useState({
    heightLabel: '100%',
    widthLabel: '100%',
  })

  return (
    <Stack spacing={4}>
      <InstallPackageInstruction />
      <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>Insert the typebot container</Text>
      <StandardReactDiv {...inputValues} />
    </Stack>
  )
}

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <Stack spacing={4}>
      <InstallPackageInstruction />
      <PopupEmbedSettings
        onUpdateSettings={(settings) => setInputValue(settings.delay)}
      />
      <Text>Initialize the typebot</Text>
      <PopupReactCode withStarterVariables={true} delay={inputValue} />
    </Stack>
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
    <Stack spacing={4}>
      <InstallPackageInstruction />
      <ChatEmbedSettings
        onUpdateSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>Initialize the typebot</Text>
      <ChatReactCode withStarterVariables={true} {...inputValues} mt={4} />
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
