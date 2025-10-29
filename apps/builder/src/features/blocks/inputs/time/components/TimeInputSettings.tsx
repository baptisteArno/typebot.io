import { useTranslate } from "@tolgee/react";
import { defaultTimeInputOptions } from "@typebot.io/blocks-inputs/time/constants";
import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options: TimeInputBlock["options"];
  onOptionsChange: (options: TimeInputBlock["options"]) => void;
};

export const TimeInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id });
  };

  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { button } });

  const updateFormat = (format: string) => {
    onOptionsChange({ ...options, format });
  };

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.date.settings.format.label")}
          <MoreInfoTooltip>
            Unicode Technical Standard #35 (i.e. for 24h format: HH:mm, for
            AM/PM format: hh:mm a)
          </MoreInfoTooltip>
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.format ?? defaultTimeInputOptions.format}
          placeholder={defaultTimeInputOptions.format}
          onValueChange={updateFormat}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.button ?? defaultTimeInputOptions.labels.button
          }
          onValueChange={updateButtonLabel}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Field.Root>
    </div>
  );
};
