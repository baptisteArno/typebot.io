import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultTimeInputOptions } from "@typebot.io/blocks-inputs/time/constants";
import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { TextInput } from "@/components/inputs/TextInput";
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
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.date.settings.format.label")}
        defaultValue={options?.format ?? defaultTimeInputOptions.format}
        moreInfoTooltip={`
					Unicode Technical Standard #35 (i.e. for 24h format: HH:mm, for AM/PM format: hh:mm a)
				`}
        placeholder={defaultTimeInputOptions.format}
        onChange={updateFormat}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultTimeInputOptions.labels.button
        }
        onChange={updateButtonLabel}
      />
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.saveAnswer.label")}
        </Field.Label>
        <VariablesCombobox
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Field.Root>
    </Stack>
  );
};
