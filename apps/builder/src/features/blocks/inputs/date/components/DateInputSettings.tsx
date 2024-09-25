import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultDateInputOptions } from "@typebot.io/blocks-inputs/date/constants";
import type { DateInputBlock } from "@typebot.io/blocks-inputs/date/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

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
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.date.settings.isRange.label")}
        initialValue={options?.isRange ?? defaultDateInputOptions.isRange}
        onCheckChange={updateIsRange}
      >
        <TextInput
          label={t("blocks.inputs.date.settings.from.label")}
          defaultValue={
            options?.labels?.from ?? defaultDateInputOptions.labels.from
          }
          onChange={updateFromLabel}
        />
        <TextInput
          label={t("blocks.inputs.date.settings.to.label")}
          defaultValue={
            options?.labels?.to ??
            t("blocks.inputs.date.settings.toInputValue.label")
          }
          onChange={updateToLabel}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithLabel
        label={t("blocks.inputs.date.settings.withTime.label")}
        initialValue={options?.hasTime ?? defaultDateInputOptions.hasTime}
        onCheckChange={updateHasTime}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultDateInputOptions.labels.button
        }
        onChange={updateButtonLabel}
      />
      <TextInput
        label={t("blocks.inputs.settings.min.label")}
        defaultValue={options?.min}
        placeholder={options?.hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD"}
        onChange={updateMin}
      />
      <TextInput
        label={t("blocks.inputs.settings.max.label")}
        defaultValue={options?.max}
        placeholder={options?.hasTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD"}
        onChange={updateMax}
      />
      <TextInput
        label={t("blocks.inputs.date.settings.format.label")}
        defaultValue={
          options?.format ??
          (options?.hasTime
            ? defaultDateInputOptions.formatWithTime
            : defaultDateInputOptions.format)
        }
        moreInfoTooltip={`
					${t("blocks.inputs.date.settings.format.example.label")} dd/MM/yyyy, MM/dd/yy, yyyy-MM-dd
				`}
        placeholder={options?.hasTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        onChange={updateFormat}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateVariable}
        />
      </Stack>
    </Stack>
  );
};
