import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import type { SystemMessages } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import {
  DebouncedTextarea,
  DebouncedTextareaWithVariablesButton,
} from "@/components/inputs/DebouncedTextarea";
import { TextInput } from "@/components/inputs/TextInput";

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

  const updateOfflineErrorTitle = (
    networkErrorTitle: SystemMessages["networkErrorTitle"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      networkErrorTitle,
    });
  };

  const updateOfflineErrorMessage = (
    networkErrorMessage: SystemMessages["networkErrorMessage"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      networkErrorMessage,
    });
  };

  const updatePopupBlockedTitle = (
    popupBlockedTitle: SystemMessages["popupBlockedTitle"],
  ) => {
    onSystemMessagesChange({
      ...systemMessages,
      popupBlockedTitle,
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
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.general.systemMessages.invalidMessage.label")}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextareaWithVariablesButton
              {...props}
              placeholder={defaultSystemMessages.invalidMessage}
              defaultValue={systemMessages?.invalidMessage}
              onValueChange={updateInvalidMessage}
            />
          )}
        />
      </Field.Root>
      <TextInput
        label={t(
          "settings.sideMenu.general.systemMessages.networkErrorTitle.label",
        )}
        defaultValue={systemMessages?.networkErrorTitle}
        placeholder={defaultSystemMessages.networkErrorTitle}
        onChange={updateOfflineErrorTitle}
      />
      <Field.Root>
        <Field.Label>
          {t(
            "settings.sideMenu.general.systemMessages.networkErrorMessage.label",
          )}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextareaWithVariablesButton
              {...props}
              placeholder={defaultSystemMessages.networkErrorMessage}
              defaultValue={systemMessages?.networkErrorMessage}
              onValueChange={updateOfflineErrorMessage}
            />
          )}
        />
      </Field.Root>
      <TextInput
        label={t(
          "settings.sideMenu.general.systemMessages.popupBlockedTitle.label",
        )}
        defaultValue={systemMessages?.popupBlockedTitle}
        placeholder={defaultSystemMessages.popupBlockedTitle}
        onChange={updatePopupBlockedTitle}
      />
      <Field.Root>
        <Field.Label>
          {t(
            "settings.sideMenu.general.systemMessages.popupBlockedDescription.label",
          )}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextarea
              {...props}
              placeholder={defaultSystemMessages.popupBlockedDescription}
              defaultValue={systemMessages?.popupBlockedDescription}
              onValueChange={updatePopupBlockedDescription}
            />
          )}
        />
      </Field.Root>
      <TextInput
        label={t(
          "settings.sideMenu.general.systemMessages.popupBlockedButton.label",
        )}
        defaultValue={systemMessages?.popupBlockedButtonLabel}
        placeholder={defaultSystemMessages.popupBlockedButtonLabel}
        onChange={updatePopupBlockedButtonLabel}
        withVariableButton={false}
      />
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.general.systemMessages.botClosed.label")}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextarea
              {...props}
              placeholder={defaultSystemMessages.botClosed}
              defaultValue={systemMessages?.botClosed}
              onValueChange={updateBotClosed}
            />
          )}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.general.systemMessages.fileUploadError.label")}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextarea
              {...props}
              placeholder={defaultSystemMessages.fileUploadError}
              defaultValue={systemMessages?.fileUploadError}
              onValueChange={updateFileUploadError}
            />
          )}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t(
            "settings.sideMenu.general.systemMessages.fileUploadSizeError.label",
          )}{" "}
          <MoreInfoTooltip>
            {t(
              "settings.sideMenu.general.systemMessages.fileUploadSizeError.tooltip",
            )}
          </MoreInfoTooltip>
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextarea
              {...props}
              placeholder={defaultSystemMessages.fileUploadSizeError}
              defaultValue={systemMessages?.fileUploadSizeError}
              onValueChange={updateFileUploadSizeError}
            />
          )}
        />
      </Field.Root>
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
