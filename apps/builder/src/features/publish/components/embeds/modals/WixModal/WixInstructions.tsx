import { ListItem, OrderedList, Tag } from '@chakra-ui/react'
import { useState } from 'react'
import { BubbleParams } from 'typebot-js'
import { ChatEmbedCode } from '../../codeSnippets/Chat/EmbedCode'
import { ChatEmbedSettings } from '../../codeSnippets/Chat/EmbedSettings'
import { ContainerEmbedCode } from '../../codeSnippets/Container/EmbedCode'
import { PopupEmbedCode } from '../../codeSnippets/Popup/EmbedCode'
import { PopupEmbedSettings } from '../../codeSnippets/Popup/EmbedSettings'

type WixInstructionsProps = {
  type: 'standard' | 'popup' | 'bubble'
}

export const WixInstructions = ({ type }: WixInstructionsProps) => {
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
  return (
    <OrderedList spacing={2} mb={4}>
      <ListItem>
        In the Wix Website Editor:
        <Tag>
          Add {'>'} Embed {'>'} Embed a Widget
        </Tag>
      </ListItem>
      <ListItem>
        Click on <Tag>Enter code</Tag> and paste this code:
      </ListItem>
      <ContainerEmbedCode widthLabel="100%" heightLabel="100%" />
    </OrderedList>
  )
}

const PopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>()

  return (
    <>
      <OrderedList spacing={2} mb={4}>
        <ListItem>
          Go to <Tag>Settings</Tag> in your dashboard on Wix
        </ListItem>
        <ListItem>
          Click on <Tag>Custom Code</Tag> under <Tag>Advanced</Tag>
        </ListItem>
        <ListItem>
          Click <Tag>+ Add Custom Code</Tag> at the top right.
        </ListItem>
        <ListItem>
          Paste this snippet in the code box:
          <PopupEmbedSettings
            onUpdateSettings={(settings) => setInputValue(settings.delay)}
            my={4}
          />
          <PopupEmbedCode delay={inputValue} />
        </ListItem>
      </OrderedList>
    </>
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
        Go to <Tag>Settings</Tag> in your dashboard on Wix
      </ListItem>
      <ListItem>
        Click on <Tag>Custom Code</Tag> under <Tag>Advanced</Tag>
      </ListItem>
      <ListItem>
        Click <Tag>+ Add Custom Code</Tag> at the top right.
      </ListItem>
      <ListItem>
        Paste this snippet in the code box:{' '}
        <ChatEmbedSettings
          my="4"
          onUpdateSettings={(settings) => setInputValues({ ...settings })}
        />
        <ChatEmbedCode {...inputValues} />
      </ListItem>
    </OrderedList>
  )
}
