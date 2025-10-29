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
import { Field } from "@typebot.io/ui/components/Field";
import { BasicSelect } from "@/components/inputs/BasicSelect";
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>Container</h3>
        <ChatContainerForm
          generalBackground={generalBackground}
          container={chatTheme?.container}
          onContainerChange={updateChatContainer}
        />
      </div>
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
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>{t("theme.sideMenu.chat.botBubbles")}</h3>
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
      </div>
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>{t("theme.sideMenu.chat.userBubbles")}</h3>
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
      </div>
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>{t("theme.sideMenu.chat.buttons")}</h3>
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
      </div>
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>{t("theme.sideMenu.chat.inputs")}</h3>
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
      </div>
      <div className="flex flex-col border rounded-md p-4 gap-4">
        <h3>Buttons input</h3>
        <Field.Root className="flex-row">
          <Field.Label>Layout:</Field.Label>
          <div className="flex items-center gap-2">
            <BasicSelect
              size="sm"
              value={chatTheme?.buttonsInput?.layout}
              defaultValue={defaultButtonsInputLayout}
              onChange={updateButtonsInputLayout}
              items={["wrap", "vertical"]}
            />
          </div>
        </Field.Root>
      </div>
    </div>
  );
};
