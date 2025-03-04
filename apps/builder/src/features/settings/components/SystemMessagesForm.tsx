import { TextInput, Textarea } from "@/components/inputs";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import type { SystemMessages } from "@typebot.io/settings/schemas";

type Props = {
  systemMessages?: SystemMessages;
  onSystemMessagesChange: (systemMessages: SystemMessages) => void;
};
export const SystemMessagesForm = ({
  systemMessages,
  onSystemMessagesChange,
}: Props) => {
  const { t } = useTranslate();
  const updateInvalidMessage = (
    invalidMessage: SystemMessages["invalidMessage"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      invalidMessage,
    });
  };

  const updateBotClosed = (botClosed: SystemMessages["botClosed"]) => {
    onSystemMessagesChange({
      ...systemMessages,
      botClosed,
    });
  };

  const updateFileUploadError = (
    fileUploadError: SystemMessages["fileUploadError"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      fileUploadError,
    });
  };

  const updateFileUploadSizeError = (
    fileUploadSizeError: SystemMessages["fileUploadSizeError"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      fileUploadSizeError,
    });
  };

  const updatePopupBlockedDescription = (
    popupBlockedDescription: SystemMessages["popupBlockedDescription"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      popupBlockedDescription,
    });
  };

  const updatePopupBlockedButtonLabel = (
    popupBlockedButtonLabel: SystemMessages["popupBlockedButtonLabel"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      popupBlockedButtonLabel,
    });
  };

  const updateWhatsAppPictureChoiceSelectLabel = (
    whatsAppPictureChoiceSelectLabel: SystemMessages["whatsAppPictureChoiceSelectLabel"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      whatsAppPictureChoiceSelectLabel,
    });
  };

  return (
    <Stack spacing="4">
      <Textarea
        label={t(
          "settings.sideMenu.general.systemMessages.invalidMessage.label",
        )}
        defaultValue={systemMessages?.invalidMessage}
        placeholder={defaultSystemMessages.invalidMessage}
        onChange={updateInvalidMessage}
      />
      <Textarea
        label={t(
          "settings.sideMenu.general.systemMessages.popupBlockedDescription.label",
        )}
        defaultValue={systemMessages?.popupBlockedDescription}
        placeholder={defaultSystemMessages.popupBlockedDescription}
        onChange={updatePopupBlockedDescription}
        withVariableButton={false}
      />
      <TextInput
        label={t(
          "settings.sideMenu.general.systemMessages.popupBlockedButton.label",
        )}
        defaultValue={systemMessages?.popupBlockedButtonLabel}
        placeholder={defaultSystemMessages.popupBlockedButtonLabel}
        onChange={updatePopupBlockedButtonLabel}
        withVariableButton={false}
      />
      <Textarea
        label={t("settings.sideMenu.general.systemMessages.botClosed.label")}
        defaultValue={systemMessages?.botClosed}
        placeholder={defaultSystemMessages.botClosed}
        onChange={updateBotClosed}
        withVariableButton={false}
      />
      <Textarea
        label={t(
          "settings.sideMenu.general.systemMessages.fileUploadError.label",
        )}
        defaultValue={systemMessages?.fileUploadError}
        placeholder={defaultSystemMessages.fileUploadError}
        onChange={updateFileUploadError}
        withVariableButton={false}
      />
      <Textarea
        label={t(
          "settings.sideMenu.general.systemMessages.fileUploadSizeError.label",
        )}
        moreInfoTooltip={t(
          "settings.sideMenu.general.systemMessages.fileUploadSizeError.tooltip",
        )}
        defaultValue={systemMessages?.fileUploadSizeError}
        placeholder={defaultSystemMessages.fileUploadSizeError}
        onChange={updateFileUploadSizeError}
        withVariableButton={false}
      />
      <TextInput
        label={t(
          "settings.sideMenu.general.systemMessages.whatsAppPictureChoiceSelectLabel.label",
        )}
        defaultValue={systemMessages?.whatsAppPictureChoiceSelectLabel}
        placeholder={defaultSystemMessages.whatsAppPictureChoiceSelectLabel}
        onChange={updateWhatsAppPictureChoiceSelectLabel}
        withVariableButton={false}
      />
    </Stack>
  );
};
