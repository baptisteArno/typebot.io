import { OrderedList, ListItem, Tag, Text, Stack } from '@chakra-ui/react'
import { ChatEmbedCode } from 'components/share/codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from 'components/share/codeSnippets/Chat/EmbedSettings'
import { ContainerEmbedCode } from 'components/share/codeSnippets/Container/EmbedCode'
import { PopupEmbedCode } from 'components/share/codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from 'components/share/codeSnippets/Popup/EmbedSettings'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'

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
  <OrderedList spacing={2} mb={4}>
    <ListItem>
      Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
    </ListItem>
    <ListItem>
      Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
      section and paste this code:
      <ContainerEmbedCode widthLabel="100%" heightLabel="100%" my={4} />
    </ListItem>
  </OrderedList>
)

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState(0)

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
      </ListItem>
      <ListItem>
        Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
        section and paste this code:
        <PopupEmbedSettings
          onUpdateSettings={(settings) => setInputValue(settings.delay ?? 0)}
          my={4}
        />
        <PopupEmbedCode delay={inputValue} mt={4} />
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
        Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
      </ListItem>
      <ListItem>
        Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
        section and paste this code:
        <ChatEmbedSettings
          onUpdateSettings={(settings) => setInputValues({ ...settings })}
          my={4}
        />
        <ChatEmbedCode withStarterVariables={true} {...inputValues} my={4} />
      </ListItem>
    </OrderedList>
  )
}
