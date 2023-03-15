import { Stack, Heading, HStack, Flex, Text, Image } from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/js'
import { isDefined } from '@typebot.io/lib'
import { PreviewMessageSettings } from './PreviewMessageSettings'
import { ThemeSettings } from './ThemeSettings'

type Props = {
  defaultPreviewMessageAvatar: string
  theme: BubbleProps['theme']
  previewMessage: BubbleProps['previewMessage']
  onThemeChange: (theme: BubbleProps['theme']) => void
  onPreviewMessageChange: (
    previewMessage: BubbleProps['previewMessage']
  ) => void
}

export const BubbleSettings = ({
  defaultPreviewMessageAvatar,
  theme,
  previewMessage,
  onThemeChange,
  onPreviewMessageChange,
}: Props) => {
  const updatePreviewMessage = (
    previewMessage: BubbleProps['previewMessage']
  ) => {
    if (!previewMessage) return onPreviewMessageChange(undefined)
    onPreviewMessageChange({
      ...previewMessage,
      autoShowDelay: previewMessage?.autoShowDelay
        ? previewMessage.autoShowDelay * 1000
        : undefined,
    })
  }

  const updateTheme = (theme: BubbleProps['theme']) => {
    onThemeChange(theme)
  }

  return (
    <Stack spacing="4">
      <Heading size="sm">Chat bubble settings</Heading>
      <Stack pl="4" spacing={4}>
        <PreviewMessageSettings
          defaultAvatar={defaultPreviewMessageAvatar}
          onChange={updatePreviewMessage}
        />
        <ThemeSettings
          theme={theme}
          onChange={updateTheme}
          isPreviewMessageEnabled={isDefined(previewMessage)}
        />
        <Heading size="sm">Preview:</Heading>
        <Stack alignItems="flex-end">
          {isDefined(previewMessage) && (
            <HStack
              bgColor={theme?.previewMessage?.backgroundColor}
              shadow="md"
              rounded="md"
              p="3"
              maxW="280px"
              spacing={4}
            >
              {previewMessage.avatarUrl && (
                <Image
                  src={previewMessage.avatarUrl}
                  w="40px"
                  h="40px"
                  rounded="full"
                  alt="Preview message avatar"
                  objectFit="cover"
                />
              )}
              <Text color={theme?.previewMessage?.textColor}>
                {previewMessage.message}
              </Text>
            </HStack>
          )}
          <Flex
            align="center"
            justifyContent="center"
            boxSize="3rem"
            bgColor={theme?.button?.backgroundColor}
            rounded="full"
          >
            <svg
              viewBox="0 0 24 24"
              style={{
                stroke: theme?.button?.iconColor,
              }}
              width="30px"
              strokeWidth="2px"
              fill="transparent"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </Flex>
        </Stack>
      </Stack>
    </Stack>
  )
}
