import {
  StackProps,
  Stack,
  Heading,
  HStack,
  Input,
  Flex,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Text,
  Tag,
} from '@chakra-ui/react'
import { ColorPicker } from 'components/theme/GeneralSettings/ColorPicker'
import { useTypebot } from 'contexts/TypebotContext'
import { useState, useEffect } from 'react'
import { BubbleParams } from 'typebot-js'

type ChatEmbedSettingsProps = {
  onUpdateSettings: (
    windowSettings: Pick<BubbleParams, 'button' | 'proactiveMessage'>
  ) => void
}
export const ChatEmbedSettings = ({
  onUpdateSettings,
  ...props
}: ChatEmbedSettingsProps & StackProps) => {
  const { typebot } = useTypebot()
  const [proactiveMessageChecked, setProactiveMessageChecked] = useState(false)
  const [rememberProMessageChecked] = useState(true)
  const [customIconInputValue, setCustomIconInputValue] = useState('')

  const [inputValues, setInputValues] = useState({
    messageDelay: '0',
    messageContent: 'I have a question for you!',
  })

  const [bubbleColor, setBubbleColor] = useState(
    typebot?.theme.chat.buttons.backgroundColor ?? '#0042DA'
  )

  useEffect(() => {
    if (proactiveMessageChecked) {
      onUpdateSettings({
        button: {
          color: bubbleColor,
          iconUrl: customIconInputValue,
        },
        proactiveMessage: {
          delay: parseInt(inputValues.messageDelay) * 1000,
          textContent: inputValues.messageContent,
          rememberClose: rememberProMessageChecked,
        },
      })
    } else {
      onUpdateSettings({
        button: {
          color: bubbleColor,
          iconUrl: customIconInputValue,
        },
        proactiveMessage: undefined,
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputValues,
    bubbleColor,
    rememberProMessageChecked,
    customIconInputValue,
    proactiveMessageChecked,
  ])

  return (
    <Stack {...props}>
      <Heading fontSize="md" fontWeight="semibold">
        Chat bubble settings
      </Heading>
      <Flex justify="space-between" align="center" mb="4">
        <Text>Button color</Text>
        <ColorPicker
          initialColor={bubbleColor}
          onColorChange={setBubbleColor}
        />
      </Flex>
      <HStack>
        <Text flexShrink={0}>
          Custom button icon <Tag>Optional</Tag>
        </Text>
        <Input
          placeholder={'Paste image link (.png, .svg)'}
          value={customIconInputValue}
          onChange={(e) => setCustomIconInputValue(e.target.value)}
        />
      </HStack>
      <Flex alignItems="center">
        <FormControl
          display="flex"
          alignItems="center"
          w="full"
          justifyContent="space-between"
          pr={1}
        >
          <FormLabel htmlFor="fullscreen-option" mb="1">
            Enable popup message?
          </FormLabel>
          <Switch
            id="fullscreen-option"
            onChange={() =>
              setProactiveMessageChecked(!proactiveMessageChecked)
            }
            isChecked={proactiveMessageChecked}
          />
        </FormControl>
      </Flex>
      {proactiveMessageChecked && (
        <>
          <Flex justify="space-between" align="center" pl="4" mb="2">
            <Text>Appearance delay</Text>
            <NumberInput
              onChange={(messageDelay) =>
                setInputValues({
                  ...inputValues,
                  messageDelay,
                })
              }
              value={inputValues.messageDelay}
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
          <Flex justify="space-between" align="center" pl="4" mb="2">
            <Text>Message content</Text>
            <Input
              type="text"
              onChange={(e) =>
                setInputValues({
                  ...inputValues,
                  messageContent: e.target.value,
                })
              }
              value={inputValues.messageContent}
            />
          </Flex>
        </>
      )}
    </Stack>
  )
}
