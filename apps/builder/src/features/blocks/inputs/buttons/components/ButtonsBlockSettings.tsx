import { useTranslate } from "@tolgee/react";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import type { ChoiceInputBlock } from "@typebot.io/blocks-inputs/choice/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options?: ChoiceInputBlock["options"];
  onOptionsChange: (options: ChoiceInputBlock["options"]) => void;
};

export const ButtonsBlockSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice });
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable });
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel });
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder });
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const updateDynamicDataVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, dynamicVariableId: variable?.id });
  const updateAreInitialSearchButtonsVisible = (
    areInitialSearchButtonsVisible: boolean,
  ) => onOptionsChange({ ...options, areInitialSearchButtonsVisible });

  return (
    <div className="flex flex-col gap-4">
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.isMultipleChoice ??
              defaultChoiceInputOptions.isMultipleChoice
            }
            onCheckedChange={updateIsMultiple}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.multipleChoice.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isMultipleChoice ??
          defaultChoiceInputOptions.isMultipleChoice) && (
          <Field.Root>
            <Field.Label>
              {t("blocks.inputs.settings.submitButton.label")}
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={
                options?.buttonLabel ??
                t("blocks.inputs.settings.buttonText.label")
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
              options?.isSearchable ?? defaultChoiceInputOptions.isSearchable
            }
            onCheckedChange={updateIsSearchable}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.isSearchable.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isSearchable ?? defaultChoiceInputOptions.isSearchable) && (
          <>
            <Field.Root className="flex-row items-center">
              <Switch
                checked={
                  options?.areInitialSearchButtonsVisible ??
                  defaultChoiceInputOptions.areInitialSearchButtonsVisible
                }
                onCheckedChange={updateAreInitialSearchButtonsVisible}
              />
              <Field.Label>Default display buttons</Field.Label>
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.settings.input.placeholder.label")}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={
                  options?.searchInputPlaceholder ??
                  t("blocks.inputs.settings.input.filterOptions.label")
                }
                onValueChange={updateSearchInputPlaceholder}
              />
            </Field.Root>
          </>
        )}
      </Field.Container>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.button.settings.dynamicData.label")}
          <MoreInfoTooltip>
            {t("blocks.inputs.button.settings.dynamicData.infoText.label")}
          </MoreInfoTooltip>
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.dynamicVariableId}
          onSelectVariable={updateDynamicDataVariable}
        />
      </Field.Root>
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
