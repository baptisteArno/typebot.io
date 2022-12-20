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
  Switch,
  Text,
  Image,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { useUser } from '@/features/account'
import { useState, useEffect } from 'react'
import { BubbleParams } from 'typebot-js'
import { ColorPicker } from '@/components/ColorPicker'

type ChatEmbedSettingsProps = {
  onUpdateSettings: (
    windowSettings: Pick<BubbleParams, 'button' | 'proactiveMessage'>
  ) => void
}
export const ChatEmbedSettings = ({
  onUpdateSettings,
  ...props
}: ChatEmbedSettingsProps & StackProps) => {
  const { user } = useUser()
  const { typebot } = useTypebot()
  const [proactiveMessageChecked, setProactiveMessageChecked] = useState(false)
  const [isCustomIconChecked, setIsCustomIconChecked] = useState(false)

  const [rememberProMessageChecked] = useState(true)
  const [customIconInputValue, setCustomIconInputValue] = useState('')

  const [inputValues, setInputValues] = useState({
    messageDelay: '0',
    messageContent: 'I have a question for you!',
    avatarUrl: typebot?.theme.chat.hostAvatar?.url ?? user?.image ?? '',
  })

  const [bubbleColor, setBubbleColor] = useState(
    typebot?.theme.chat.buttons.backgroundColor ?? '#0042DA'
  )

  const [bubbleIconColor, setIconBubbleColor] = useState(
    typebot?.theme.chat.buttons.color ?? '#FFFFFF'
  )

  useEffect(() => {
    if (proactiveMessageChecked) {
      onUpdateSettings({
        button: {
          color: bubbleColor,
          iconUrl: isCustomIconChecked ? customIconInputValue : undefined,
          iconColor:
            bubbleIconColor === '#FFFFFF' ? undefined : bubbleIconColor,
        },
        proactiveMessage: {
          delay: parseInt(inputValues.messageDelay) * 1000,
          textContent: inputValues.messageContent,
          avatarUrl: inputValues.avatarUrl,
          rememberClose: rememberProMessageChecked,
        },
      })
    } else {
      onUpdateSettings({
        button: {
          color: bubbleColor,
          iconUrl: isCustomIconChecked ? customIconInputValue : undefined,
          iconColor:
            bubbleIconColor === '#FFFFFF' ? undefined : bubbleIconColor,
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
    bubbleIconColor,
    proactiveMessageChecked,
    isCustomIconChecked,
  ])

  return (
    <Stack {...props} spacing="4">
      <Heading fontSize="md" fontWeight="semibold">
        Chat bubble settings
      </Heading>
      <Flex justify="space-between" align="center">
        <Text>Button color</Text>
        <ColorPicker
          initialColor={bubbleColor}
          onColorChange={setBubbleColor}
        />
      </Flex>
      <HStack justify="space-between">
        <Text>Icon color</Text>
        <ColorPicker
          initialColor={bubbleIconColor}
          onColorChange={setIconBubbleColor}
        />
      </HStack>
      <HStack justifyContent="space-between">
        <FormLabel htmlFor="custom-icon" mb="0" flexShrink={0}>
          Custom button icon?
        </FormLabel>
        <Switch
          id="custom-icon"
          onChange={() => setIsCustomIconChecked(!isCustomIconChecked)}
          isChecked={isCustomIconChecked}
        />
      </HStack>
      {isCustomIconChecked && (
        <>
          <HStack pl="4">
            <Text>Url:</Text>
            <Input
              placeholder={'Paste image link (.png, .svg)'}
              value={customIconInputValue}
              onChange={(e) => setCustomIconInputValue(e.target.value)}
              minW="0"
            />
          </HStack>
        </>
      )}
      <Flex alignItems="center">
        <FormControl
          display="flex"
          alignItems="center"
          w="full"
          justifyContent="space-between"
        >
          <FormLabel htmlFor="fullscreen-option" mb="0">
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
          <Flex pl="4">
            <HStack
              bgColor="white"
              shadow="md"
              rounded="md"
              p="3"
              maxW="280px"
              spacing={4}
            >
              {inputValues.avatarUrl && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={inputValues.avatarUrl} w="40px" rounded="full" />
              )}
              <Text>{inputValues.messageContent}</Text>
            </HStack>
          </Flex>
          <Flex justify="space-between" align="center" pl="4">
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
          <Flex justify="space-between" align="center" pl="4">
            <Text>Avatar URL</Text>
            <Input
              type="text"
              onChange={(e) =>
                setInputValues({
                  ...inputValues,
                  avatarUrl: e.target.value,
                })
              }
              value={inputValues.avatarUrl}
              placeholder={'Paste image link (.png, .jpg)'}
            />
          </Flex>
          <Flex justify="space-between" align="center" pl="4">
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
