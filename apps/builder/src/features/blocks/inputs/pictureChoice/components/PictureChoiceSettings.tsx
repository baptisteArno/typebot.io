import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { TextInput } from "@/components/inputs/TextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";

type Props = {
  options?: PictureChoiceBlock["options"];
  onOptionsChange: (options: PictureChoiceBlock["options"]) => void;
};

export const PictureChoiceSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice });
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel });
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder });
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable });

  const updateIsDynamicItemsEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        isEnabled,
      },
    });

  const updateDynamicItemsPictureSrcsVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        pictureSrcsVariableId: variable?.id,
      },
    });

  const updateDynamicItemsTitlesVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        titlesVariableId: variable?.id,
      },
    });

  const updateDynamicItemsDescriptionsVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        descriptionsVariableId: variable?.id,
      },
    });

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.settings.isSearchable.label")}
        initialValue={
          options?.isSearchable ?? defaultPictureChoiceOptions.isSearchable
        }
        onCheckChange={updateIsSearchable}
      >
        <TextInput
          label={t("blocks.inputs.settings.input.placeholder.label")}
          defaultValue={
            options?.searchInputPlaceholder ??
            defaultPictureChoiceOptions.searchInputPlaceholder
          }
          onChange={updateSearchInputPlaceholder}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.settings.multipleChoice.label")}
        initialValue={
          options?.isMultipleChoice ??
          defaultPictureChoiceOptions.isMultipleChoice
        }
        onCheckChange={updateIsMultiple}
      >
        <TextInput
          label={t("blocks.inputs.settings.submitButton.label")}
          defaultValue={
            options?.buttonLabel ?? defaultPictureChoiceOptions.buttonLabel
          }
          onChange={updateButtonLabel}
        />
      </SwitchWithRelatedSettings>

      <SwitchWithRelatedSettings
        label={t("blocks.inputs.picture.settings.dynamicItems.label")}
        initialValue={
          options?.dynamicItems?.isEnabled ??
          defaultPictureChoiceOptions.dynamicItems.isEnabled
        }
        onCheckChange={updateIsDynamicItemsEnabled}
      >
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.picture.settings.dynamicItems.images.label")}
          </Field.Label>
          <VariablesCombobox
            initialVariableId={options?.dynamicItems?.pictureSrcsVariableId}
            onSelectVariable={updateDynamicItemsPictureSrcsVariable}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.picture.settings.dynamicItems.titles.label")}
          </Field.Label>
          <VariablesCombobox
            initialVariableId={options?.dynamicItems?.titlesVariableId}
            onSelectVariable={updateDynamicItemsTitlesVariable}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>
            {t(
              "blocks.inputs.picture.settings.dynamicItems.descriptions.label",
            )}
          </Field.Label>
          <VariablesCombobox
            initialVariableId={options?.dynamicItems?.descriptionsVariableId}
            onSelectVariable={updateDynamicItemsDescriptionsVariable}
          />
        </Field.Root>
      </SwitchWithRelatedSettings>

      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Field.Root>
    </Stack>
  );
};
