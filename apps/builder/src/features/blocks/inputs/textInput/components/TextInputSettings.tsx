import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { fileVisibilityOptions } from "@typebot.io/blocks-inputs/file/constants";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import { inputModeOptions } from "@typebot.io/blocks-inputs/text/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";

type Props = {
  options: TextInputBlock["options"];
  onOptionsChange: (options: TextInputBlock["options"]) => void;
};

export const TextInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const updatePlaceholder = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });

  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });

  const updateIsLong = (isLong: boolean) =>
    onOptionsChange({ ...options, isLong });

  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });

  const updateAttachmentsEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, isEnabled },
    });

  const updateAttachmentsSaveVariableId = (variable?: Pick<Variable, "id">) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, saveVariableId: variable?.id },
    });

  const updateVisibility = (
    visibility: (typeof fileVisibilityOptions)[number] | undefined,
  ) =>
    onOptionsChange({
      ...options,
      attachments: { ...options?.attachments, visibility },
    });

  const updateAudioClipEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, isEnabled },
    });

  const updateAudioClipSaveVariableId = (variable?: Pick<Variable, "id">) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, saveVariableId: variable?.id },
    });

  const updateAudioClipVisibility = (
    visibility: (typeof fileVisibilityOptions)[number] | undefined,
  ) =>
    onOptionsChange({
      ...options,
      audioClip: { ...options?.audioClip, visibility },
    });

  const updateInputMode = (inputMode?: string) =>
    onOptionsChange({
      ...options,
      inputMode: inputMode as (typeof inputModeOptions)[number] | undefined,
    });

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label={t("blocks.inputs.text.settings.longText.label")}
        initialValue={options?.isLong ?? defaultTextInputOptions.isLong}
        onCheckChange={updateIsLong}
      />
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
          defaultTextInputOptions.labels.placeholder
        }
        onChange={updatePlaceholder}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultTextInputOptions.labels.button
        }
        onChange={updateButtonLabel}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="input-mode">
          Input mode
        </FormLabel>
        <BasicSelect
          value={options?.inputMode}
          defaultValue="text"
          items={inputModeOptions}
          onChange={updateInputMode}
          placeholder="Select input mode..."
        />
      </Stack>
      <SwitchWithRelatedSettings
        label={"Allow audio clip"}
        initialValue={
          options?.audioClip?.isEnabled ??
          defaultTextInputOptions.audioClip.isEnabled
        }
        onCheckChange={updateAudioClipEnabled}
      >
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            Save the URL in a variable:
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.audioClip?.saveVariableId}
            onSelectVariable={updateAudioClipSaveVariableId}
          />
        </Stack>
        <Field.Root>
          <Field.Label>
            Visibility:{" "}
            <MoreInfoTooltip>
              This setting determines who can see the uploaded files. "Public"
              means that anyone who has the link can see the files. "Private"
              means that only a members of this workspace can see the files.
            </MoreInfoTooltip>
          </Field.Label>
          <BasicSelect
            value={options?.audioClip?.visibility}
            defaultValue={defaultTextInputOptions.audioClip.visibility}
            onChange={updateAudioClipVisibility}
            items={fileVisibilityOptions}
          />
        </Field.Root>
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={"Allow attachments"}
        initialValue={
          options?.attachments?.isEnabled ??
          defaultTextInputOptions.attachments.isEnabled
        }
        onCheckChange={updateAttachmentsEnabled}
      >
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            Save the URLs in a variable:
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.attachments?.saveVariableId}
            onSelectVariable={updateAttachmentsSaveVariableId}
          />
        </Stack>
        <Field.Root>
          <Field.Label>
            Visibility:{" "}
            <MoreInfoTooltip>
              This setting determines who can see the uploaded files. "Public"
              means that anyone who has the link can see the files. "Private"
              means that only a members of this workspace can see the files.
            </MoreInfoTooltip>
          </Field.Label>
          <BasicSelect
            value={options?.attachments?.visibility}
            defaultValue={defaultTextInputOptions.attachments.visibility}
            onChange={updateVisibility}
            items={fileVisibilityOptions}
          />
        </Field.Root>
      </SwitchWithRelatedSettings>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateVariableId}
        />
      </Stack>
    </Stack>
  );
};
