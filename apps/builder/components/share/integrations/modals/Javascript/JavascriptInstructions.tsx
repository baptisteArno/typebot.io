import { Stack, Tag, Text } from '@chakra-ui/react'
import { ChatEmbedCode } from 'components/share/codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from 'components/share/codeSnippets/Chat/EmbedSettings'
import { ContainerEmbedCode } from 'components/share/codeSnippets/Container/EmbedCode'
import { StandardEmbedWindowSettings } from 'components/share/codeSnippets/Container/EmbedSettings'
import { PopupEmbedCode } from 'components/share/codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from 'components/share/codeSnippets/Popup/EmbedSettings'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'

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
  const [inputValues, setInputValues] = useState({
    heightLabel: '100%',
    widthLabel: '100%',
  })

  return (
    <Stack spacing={4}>
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      <StandardEmbedWindowSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <ContainerEmbedCode withStarterVariables={true} {...inputValues} mt={4} />
    </Stack>
  )
}

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <Stack spacing={4}>
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      <PopupEmbedSettings
        mb={4}
        onUpdateSettings={(settings) => setInputValue(settings.delay)}
      />
      <PopupEmbedCode delay={inputValue} />
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
      <Text>
        Paste this anywhere in the <Tag>body</Tag>
      </Text>
      <ChatEmbedSettings
        onUpdateSettings={(settings) => setInputValues({ ...settings })}
      />
      <ChatEmbedCode {...inputValues} />
    </Stack>
  )
}
