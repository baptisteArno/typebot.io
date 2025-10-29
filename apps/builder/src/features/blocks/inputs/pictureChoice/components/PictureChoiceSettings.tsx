import { useTranslate } from "@tolgee/react";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { PictureChoiceBlock } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

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
    <div className="flex flex-col gap-4">
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.isSearchable ?? defaultPictureChoiceOptions.isSearchable
            }
            onCheckedChange={updateIsSearchable}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.isSearchable.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isSearchable ??
          defaultPictureChoiceOptions.isSearchable) && (
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.settings.input.placeholder.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                options?.searchInputPlaceholder ??
                defaultPictureChoiceOptions.searchInputPlaceholder
              }
              onValueChange={updateSearchInputPlaceholder}
            />
          </Field.Root>
        )}
      </Field.Container>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.isMultipleChoice ??
              defaultPictureChoiceOptions.isMultipleChoice
            }
            onCheckedChange={updateIsMultiple}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.multipleChoice.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isMultipleChoice ??
          defaultPictureChoiceOptions.isMultipleChoice) && (
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.settings.submitButton.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                options?.buttonLabel ?? defaultPictureChoiceOptions.buttonLabel
              }
              onValueChange={updateButtonLabel}
            />
          </Field.Root>
        )}
      </Field.Container>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.dynamicItems?.isEnabled ??
              defaultPictureChoiceOptions.dynamicItems.isEnabled
            }
            onCheckedChange={updateIsDynamicItemsEnabled}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.picture.settings.dynamicItems.label")}
          </Field.Label>
        </Field.Root>
        {(options?.dynamicItems?.isEnabled ??
          defaultPictureChoiceOptions.dynamicItems.isEnabled) && (
          <>
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
                initialVariableId={
                  options?.dynamicItems?.descriptionsVariableId
                }
                onSelectVariable={updateDynamicItemsDescriptionsVariable}
              />
            </Field.Root>
          </>
        )}
      </Field.Container>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Field.Root>
    </div>
  );
};
