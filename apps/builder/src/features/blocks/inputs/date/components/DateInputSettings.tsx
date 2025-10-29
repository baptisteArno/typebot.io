import { useTranslate } from "@tolgee/react";
import { defaultDateInputOptions } from "@typebot.io/blocks-inputs/date/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options: DateInputBlock["options"];
  onOptionsChange: (options: DateInputBlock["options"]) => void;
};

export const DateInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const updateFromLabel = (from: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, from } });
  const updateToLabel = (to: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, to } });
  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });
  const updateIsRange = (isRange: boolean) =>
    onOptionsChange({ ...options, isRange });
  const updateHasTime = (hasTime: boolean) =>
    onOptionsChange({ ...options, hasTime });
  const updateVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const updateFormat = (format: string) => {
    if (format === "")
      return onOptionsChange({ ...options, format: undefined });
    onOptionsChange({ ...options, format });
  };
  const updateMin = (min: string) => {
    if (min === "") return onOptionsChange({ ...options, min: undefined });
    onOptionsChange({ ...options, min });
  };
  const updateMax = (max: string) => {
    if (max === "") return onOptionsChange({ ...options, max: undefined });
    onOptionsChange({ ...options, max });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={options?.isRange ?? defaultDateInputOptions.isRange}
            onCheckedChange={updateIsRange}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.date.settings.isRange.label")}
          </Field.Label>
        </Field.Root>
        {(options?.isRange ?? defaultDateInputOptions.isRange) && (
          <>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.date.settings.from.label")}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={
                  options?.labels?.from ?? defaultDateInputOptions.labels.from
                }
                onValueChange={updateFromLabel}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.date.settings.to.label")}
              </Field.Label>
              <DebouncedTextInputWithVariablesButton
                defaultValue={
                  options?.labels?.to ?? defaultDateInputOptions.labels.to
                }
                onValueChange={updateToLabel}
              />
            </Field.Root>
          </>
        )}
      </Field.Container>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={options?.hasTime ?? defaultDateInputOptions.hasTime}
          onCheckedChange={updateHasTime}
        />
        <Field.Label>
          {t("blocks.inputs.date.settings.withTime.label")}
        </Field.Label>
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.button ?? defaultDateInputOptions.labels.button
          }
          onValueChange={updateButtonLabel}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.min.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.min}
          placeholder={options?.hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD"}
          onValueChange={updateMin}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.max.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.max}
          placeholder={options?.hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD"}
          onValueChange={updateMax}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.date.settings.format.label")}
          <MoreInfoTooltip>
            {t("blocks.inputs.date.settings.format.example.label")} dd/MM/yyyy,
            MM/dd/yy, yyyy-MM-dd
          </MoreInfoTooltip>
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.format ??
            (options?.hasTime
              ? defaultDateInputOptions.formatWithTime
              : defaultDateInputOptions.format)
          }
          placeholder={options?.hasTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
          onValueChange={updateFormat}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={updateVariable}
        />
      </Field.Root>
    </div>
  );
};
