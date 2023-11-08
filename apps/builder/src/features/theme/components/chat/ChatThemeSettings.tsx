import {
  LargeRadiusIcon,
  MediumRadiusIcon,
  NoRadiusIcon,
} from '@/components/icons'
import { RadioButtons } from '@/components/inputs/RadioButtons'
import { Heading, Stack } from '@chakra-ui/react'
import { AvatarProps, ChatTheme, Theme } from '@typebot.io/schemas'
import React from 'react'
import { AvatarForm } from './AvatarForm'
import { ButtonsTheme } from './ButtonsTheme'
import { GuestBubbles } from './GuestBubbles'
import { HostBubbles } from './HostBubbles'
import { InputsTheme } from './InputsTheme'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'

type Props = {
  workspaceId: string
  typebotId: string
  chatTheme: Theme['chat']
  onChatThemeChange: (chatTheme: ChatTheme) => void
}

export const ChatThemeSettings = ({
  workspaceId,
  typebotId,
  chatTheme,
  onChatThemeChange,
}: Props) => {
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

  const updateHostAvatar = (hostAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, hostAvatar })

  const updateGuestAvatar = (guestAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, guestAvatar })

  return (
    <Stack spacing={6}>
      <AvatarForm
        uploadFileProps={{
          workspaceId,
          typebotId,
          fileName: 'hostAvatar',
        }}
        title="Bot avatar"
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
        title="User avatar"
        avatarProps={chatTheme?.guestAvatar}
        onAvatarChange={updateGuestAvatar}
      />
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Bot bubbles</Heading>
        <HostBubbles
          hostBubbles={chatTheme?.hostBubbles}
          onHostBubblesChange={updateHostBubbles}
        />
      </Stack>

      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">User bubbles</Heading>
        <GuestBubbles
          guestBubbles={chatTheme?.guestBubbles}
          onGuestBubblesChange={updateGuestBubbles}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Buttons</Heading>
        <ButtonsTheme
          buttons={chatTheme?.buttons}
          onButtonsChange={updateButtons}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Inputs</Heading>
        <InputsTheme inputs={chatTheme?.inputs} onInputsChange={updateInputs} />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Corners roundness</Heading>
        <RadioButtons
          options={[
            {
              label: <NoRadiusIcon />,
              value: 'none',
            },
            {
              label: <MediumRadiusIcon />,
              value: 'medium',
            },
            {
              label: <LargeRadiusIcon />,
              value: 'large',
            },
          ]}
          value={chatTheme?.roundness ?? defaultTheme.chat.roundness}
          onSelect={(roundness) =>
            onChatThemeChange({ ...chatTheme, roundness })
          }
        />
      </Stack>
    </Stack>
  )
}
