import { NumberInput } from '@/components/inputs'
import { FormLabel, HStack, Input, Stack, Switch, Text } from '@chakra-ui/react'
import { PreviewMessageParams } from '@typebot.io/js/dist/features/bubble/types'
import { useState } from 'react'
import { isDefined } from '@typebot.io/lib'

type Props = {
  defaultAvatar: string
  onChange: (newPreviewMessage?: PreviewMessageParams) => void
}

export const PreviewMessageSettings = ({ defaultAvatar, onChange }: Props) => {
  const [isPreviewMessageEnabled, setIsPreviewMessageEnabled] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<PreviewMessageParams>()
  const [autoShowDelay, setAutoShowDelay] = useState(10)

  const [isAutoShowEnabled, setIsAutoShowEnabled] = useState(false)

  const updatePreviewMessage = (previewMessage: PreviewMessageParams) => {
    setPreviewMessage(previewMessage)
    onChange(previewMessage)
  }

  const updateAutoShowDelay = (autoShowDelay?: number) => {
    setAutoShowDelay(autoShowDelay ?? 0)
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',
      autoShowDelay,
    })
  }

  const updateAvatarUrl = (avatarUrl: string) => {
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',
      avatarUrl,
    })
  }

  const updateMessage = (message: string) => {
    updatePreviewMessage({ ...previewMessage, message })
  }

  const updatePreviewMessageCheck = (isChecked: boolean) => {
    setIsPreviewMessageEnabled(isChecked)
    const newPreviewMessage = {
      autoShowDelay: isAutoShowEnabled ? autoShowDelay : undefined,
      message: previewMessage?.message ?? 'I have a question for you!',
      avatarUrl: previewMessage?.avatarUrl ?? defaultAvatar,
    }
    if (isChecked) setPreviewMessage(newPreviewMessage)
    onChange(isChecked ? newPreviewMessage : undefined)
  }

  const updateAutoShowDelayCheck = (isChecked: boolean) => {
    setIsAutoShowEnabled(isChecked)
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',

      autoShowDelay: isChecked ? autoShowDelay : undefined,
    })
  }

  return (
    <Stack spacing={4}>
      <HStack justifyContent="space-between">
        <FormLabel htmlFor="preview" mb="0">
          Preview message
        </FormLabel>
        <Switch
          id="preview"
          isChecked={isPreviewMessageEnabled}
          onChange={(e) => updatePreviewMessageCheck(e.target.checked)}
        />
      </HStack>
      {isPreviewMessageEnabled && (
        <Stack pl="4" spacing={4}>
          <HStack justify="space-between">
            <Text>Avatar URL</Text>
            <Input
              onChange={(e) => updateAvatarUrl(e.target.value)}
              value={previewMessage?.avatarUrl}
              placeholder={'Paste image link (.png, .jpg)'}
            />
          </HStack>
          <HStack justify="space-between">
            <Text>Message</Text>
            <Input
              onChange={(e) => updateMessage(e.target.value)}
              value={previewMessage?.message}
            />
          </HStack>
          <HStack>
            <Text>Auto show</Text>
            <Switch
              isChecked={isAutoShowEnabled}
              onChange={(e) => updateAutoShowDelayCheck(e.target.checked)}
            />
            {isAutoShowEnabled && (
              <>
                <Text>After</Text>
                <NumberInput
                  size="sm"
                  w="70px"
                  defaultValue={autoShowDelay}
                  onValueChange={(val) =>
                    isDefined(val) && updateAutoShowDelay(val)
                  }
                  withVariableButton={false}
                />
                <Text>seconds</Text>
              </>
            )}
          </HStack>
        </Stack>
      )}
    </Stack>
  )
}
