import { ListItem, OrderedList, Tag } from '@chakra-ui/react'
import { useState } from 'react'

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
    <>
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
      </OrderedList>
    </>
  )
}

const PopupInstructions = () => {
  // const [inputValue, setInputValue] = useState(0)

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
        <ListItem>Paste this snippet in the code box:</ListItem>
      </OrderedList>
    </>
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
        <ListItem>Paste this snippet in the code box:</ListItem>
      </OrderedList>
      {/* <ChatEmbedSettings
        onUpdateSettings={(settings) => setInputValues({ ...settings })}
      />
      <ChatEmbedCode
        mt={4}
        {...inputValues}
        onCopied={() => sendWixCopyEvent('bubble')}
      /> */}
    </>
  )
}
