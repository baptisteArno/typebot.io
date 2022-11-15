import { OrderedList, ListItem, Tag } from '@chakra-ui/react'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { ChatEmbedCode } from '../../codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from '../../codeSnippets/Chat/EmbedSettings'
import { ContainerEmbedCode } from '../../codeSnippets/Container/EmbedCode'
import { PopupEmbedCode } from '../../codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from '../../codeSnippets/Popup/EmbedSettings'

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
  const [inputValue, setInputValue] = useState<number>()

  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        Press <Tag>A</Tag> to open the <Tag>Add elements</Tag> panel
      </ListItem>
      <ListItem>
        Add an <Tag>embed</Tag> element from the <Tag>components</Tag>
        section and paste this code:
        <PopupEmbedSettings
          onUpdateSettings={(settings) => setInputValue(settings.delay)}
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
