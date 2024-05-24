import { Heading, Stack } from '@chakra-ui/react'
import {
  AvatarProps,
  ChatTheme,
  GeneralTheme,
  Theme,
} from '@typebot.io/schemas'
import React from 'react'
import { AvatarForm } from './AvatarForm'
import { useTranslate } from '@tolgee/react'
import { ChatContainerForm } from './ChatContainerForm'
import { ContainerThemeForm } from './ContainerThemeForm'
import {
  defaultButtonsBackgroundColor,
  defaultButtonsColor,
  defaultButtonsBorderThickness,
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
  defaultInputsBackgroundColor,
  defaultInputsColor,
  defaultInputsPlaceholderColor,
  defaultInputsShadow,
  defaultOpacity,
  defaultBlur,
  defaultRoundness,
} from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  workspaceId: string
  typebotId: string
  generalBackground: GeneralTheme['background']
  chatTheme: Theme['chat']
  onChatThemeChange: (chatTheme: ChatTheme) => void
}

export const ChatThemeSettings = ({
  workspaceId,
  typebotId,
  chatTheme,
  generalBackground,
  onChatThemeChange,
}: Props) => {
  const { t } = useTranslate()

  const updateHostBubbles = (
    hostBubbles: NonNullable<Theme['chat']>['hostBubbles']
  ) => onChatThemeChange({ ...chatTheme, hostBubbles })

  const updateGuestBubbles = (
    guestBubbles: NonNullable<Theme['chat']>['guestBubbles']
  ) => onChatThemeChange({ ...chatTheme, guestBubbles })

  const updateButtons = (buttons: NonNullable<Theme['chat']>['buttons']) =>
    onChatThemeChange({ ...chatTheme, buttons })

  const updateInputs = (inputs: NonNullable<Theme['chat']>['inputs']) =>
    onChatThemeChange({ ...chatTheme, inputs })

  const updateChatContainer = (
    container: NonNullable<Theme['chat']>['container']
  ) => onChatThemeChange({ ...chatTheme, container })

  const updateInputsPlaceholderColor = (placeholderColor: string) =>
    onChatThemeChange({
      ...chatTheme,
      inputs: { ...chatTheme?.inputs, placeholderColor },
    })

  const updateHostAvatar = (hostAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, hostAvatar })

  const updateGuestAvatar = (guestAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, guestAvatar })

  return (
    <Stack spacing={6}>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Container</Heading>
        <ChatContainerForm
          generalBackground={generalBackground}
          container={chatTheme?.container}
          onContainerChange={updateChatContainer}
        />
      </Stack>
      <AvatarForm
        uploadFileProps={{
          workspaceId,
          typebotId,
          fileName: 'hostAvatar',
        }}
        title={t('theme.sideMenu.chat.botAvatar')}
        avatarProps={chatTheme?.hostAvatar}
        isDefaultCheck
        onAvatarChange={updateHostAvatar}
      />
      <AvatarForm
        uploadFileProps={{
          workspaceId,
          typebotId,
          fileName: 'guestAvatar',
        }}
        title={t('theme.sideMenu.chat.userAvatar')}
        avatarProps={chatTheme?.guestAvatar}
        onAvatarChange={updateGuestAvatar}
      />
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t('theme.sideMenu.chat.botBubbles')}</Heading>
        <ContainerThemeForm
          testId="hostBubblesTheme"
          theme={chatTheme?.hostBubbles}
          onThemeChange={updateHostBubbles}
          defaultTheme={{
            backgroundColor: defaultHostBubblesBackgroundColor,
            color: defaultHostBubblesColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>

      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t('theme.sideMenu.chat.userBubbles')}</Heading>
        <ContainerThemeForm
          testId="guestBubblesTheme"
          theme={chatTheme?.guestBubbles}
          onThemeChange={updateGuestBubbles}
          defaultTheme={{
            backgroundColor: defaultGuestBubblesBackgroundColor,
            color: defaultGuestBubblesColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t('theme.sideMenu.chat.buttons')}</Heading>
        <ContainerThemeForm
          testId="buttonsTheme"
          theme={chatTheme?.buttons}
          onThemeChange={updateButtons}
          defaultTheme={{
            backgroundColor: defaultButtonsBackgroundColor,
            color: defaultButtonsColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              roundeness: defaultRoundness,
              thickness: defaultButtonsBorderThickness,
              color:
                chatTheme?.buttons?.backgroundColor ??
                defaultButtonsBackgroundColor,
            },
          }}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t('theme.sideMenu.chat.inputs')}</Heading>
        <ContainerThemeForm
          testId="inputsTheme"
          theme={chatTheme?.inputs}
          onThemeChange={updateInputs}
          onPlaceholderColorChange={updateInputsPlaceholderColor}
          defaultTheme={{
            backgroundColor: defaultInputsBackgroundColor,
            color: defaultInputsColor,
            placeholderColor: defaultInputsPlaceholderColor,
            shadow: defaultInputsShadow,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>
    </Stack>
  )
}
