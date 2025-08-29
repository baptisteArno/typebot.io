import { BasicSelect } from "@/components/inputs/BasicSelect";
import { FormLabel, HStack, Heading, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  defaultBlur,
  defaultButtonsBackgroundColor,
  defaultButtonsBorderThickness,
  defaultButtonsColor,
  defaultButtonsInputLayout,
  defaultGuestBubbleBorderColor,
  defaultGuestBubbleBorderThickness,
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultHostBubbleBorderColor,
  defaultHostBubbleBorderThickness,
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
  defaultInputsBackgroundColor,
  defaultInputsBorderColor,
  defaultInputsBorderThickness,
  defaultInputsColor,
  defaultInputsPlaceholderColor,
  defaultOpacity,
  defaultRoundness,
} from "@typebot.io/theme/constants";
import type {
  AvatarProps,
  ChatTheme,
  GeneralTheme,
  Theme,
} from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import React from "react";
import { AvatarForm } from "./AvatarForm";
import { ChatContainerForm } from "./ChatContainerForm";
import { ContainerThemeForm } from "./ContainerThemeForm";

type Props = {
  workspaceId: string;
  typebot: Pick<TypebotV6, "version" | "id">;
  generalBackground: GeneralTheme["background"];
  chatTheme: Theme["chat"];
  onChatThemeChange: (chatTheme: ChatTheme) => void;
};

export const ChatThemeSettings = ({
  workspaceId,
  typebot,
  chatTheme,
  generalBackground,
  onChatThemeChange,
}: Props) => {
  const { t } = useTranslate();

  const updateHostBubbles = (
    hostBubbles: NonNullable<Theme["chat"]>["hostBubbles"],
  ) => onChatThemeChange({ ...chatTheme, hostBubbles });

  const updateGuestBubbles = (
    guestBubbles: NonNullable<Theme["chat"]>["guestBubbles"],
  ) => onChatThemeChange({ ...chatTheme, guestBubbles });

  const updateButtons = (buttons: NonNullable<Theme["chat"]>["buttons"]) =>
    onChatThemeChange({ ...chatTheme, buttons });

  const updateInputs = (inputs: NonNullable<Theme["chat"]>["inputs"]) =>
    onChatThemeChange({ ...chatTheme, inputs });

  const updateChatContainer = (
    container: NonNullable<Theme["chat"]>["container"],
  ) => onChatThemeChange({ ...chatTheme, container });

  const updateInputsPlaceholderColor = (placeholderColor: string) =>
    onChatThemeChange({
      ...chatTheme,
      inputs: { ...chatTheme?.inputs, placeholderColor },
    });

  const updateHostAvatar = (hostAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, hostAvatar });

  const updateGuestAvatar = (guestAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, guestAvatar });

  const updateButtonsInputLayout = (layout: "wrap" | "vertical" | undefined) =>
    onChatThemeChange({ ...chatTheme, buttonsInput: { layout } });

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
          typebotId: typebot.id,
          fileName: "hostAvatar",
        }}
        title={t("theme.sideMenu.chat.botAvatar")}
        avatarProps={chatTheme?.hostAvatar}
        isDefaultCheck
        onAvatarChange={updateHostAvatar}
      />
      <AvatarForm
        uploadFileProps={{
          workspaceId,
          typebotId: typebot.id,
          fileName: "guestAvatar",
        }}
        title={t("theme.sideMenu.chat.userAvatar")}
        avatarProps={chatTheme?.guestAvatar}
        onAvatarChange={updateGuestAvatar}
      />
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t("theme.sideMenu.chat.botBubbles")}</Heading>
        <ContainerThemeForm
          testId="hostBubblesTheme"
          theme={chatTheme?.hostBubbles}
          onThemeChange={updateHostBubbles}
          defaultTheme={{
            backgroundColor: defaultHostBubblesBackgroundColor[typebot.version],
            color: defaultHostBubblesColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              thickness: defaultHostBubbleBorderThickness[typebot.version],
              color: defaultHostBubbleBorderColor,
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>

      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t("theme.sideMenu.chat.userBubbles")}</Heading>
        <ContainerThemeForm
          testId="guestBubblesTheme"
          theme={chatTheme?.guestBubbles}
          onThemeChange={updateGuestBubbles}
          defaultTheme={{
            backgroundColor:
              defaultGuestBubblesBackgroundColor[typebot.version],
            color: defaultGuestBubblesColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              thickness: defaultGuestBubbleBorderThickness[typebot.version],
              color: defaultGuestBubbleBorderColor,
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t("theme.sideMenu.chat.buttons")}</Heading>
        <ContainerThemeForm
          testId="buttonsTheme"
          theme={chatTheme?.buttons}
          onThemeChange={updateButtons}
          defaultTheme={{
            backgroundColor: defaultButtonsBackgroundColor[typebot.version],
            color: defaultButtonsColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              roundeness: defaultRoundness,
              thickness: defaultButtonsBorderThickness[typebot.version],
              color:
                chatTheme?.buttons?.backgroundColor ??
                defaultButtonsBackgroundColor[typebot.version],
            },
          }}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">{t("theme.sideMenu.chat.inputs")}</Heading>
        <ContainerThemeForm
          testId="inputsTheme"
          theme={chatTheme?.inputs}
          onThemeChange={updateInputs}
          onPlaceholderColorChange={updateInputsPlaceholderColor}
          defaultTheme={{
            backgroundColor: defaultInputsBackgroundColor,
            color: defaultInputsColor,
            placeholderColor: defaultInputsPlaceholderColor,
            opacity: defaultOpacity,
            blur: defaultBlur,
            border: {
              thickness: defaultInputsBorderThickness[typebot.version],
              color: defaultInputsBorderColor[typebot.version],
              roundeness: defaultRoundness,
            },
          }}
        />
      </Stack>
      <Stack borderWidth={1} rounded="md" p="4" spacing={4}>
        <Heading fontSize="lg">Buttons input</Heading>
        <HStack justify="space-between">
          <FormLabel mb="0" mr="0">
            Layout:
          </FormLabel>
          <HStack>
            <BasicSelect
              size="sm"
              value={chatTheme?.buttonsInput?.layout}
              defaultValue={defaultButtonsInputLayout}
              onChange={updateButtonsInputLayout}
              items={["wrap", "vertical"]}
            />
          </HStack>
        </HStack>
      </Stack>
    </Stack>
  );
};
