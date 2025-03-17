import { DropdownList } from "@/components/DropdownList";
import { NumberInput, TextInput } from "@/components/inputs";
import { Select } from "@/components/inputs/Select";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormControl, FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  NumberInputStyle,
  NumberInputUnit,
  defaultNumberInputOptions,
  numberStyleTranslationKeys,
  unitTranslationKeys,
} from "@typebot.io/blocks-inputs/number/constants";
import {
  Currency,
  currencyDisplayNames,
} from "@typebot.io/blocks-inputs/number/currencies";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: NumberInputBlock["options"];
  onOptionsChange: (options: NumberInputBlock["options"]) => void;
};

export const NumberInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });
  const handleCurrencyChange = (currency: string) =>
    onOptionsChange({ ...options, currency });
  const handleMinChange = (
    min?: NonNullable<NumberInputBlock["options"]>["min"],
  ) => onOptionsChange({ ...options, min });
  const handleMaxChange = (
    max?: NonNullable<NumberInputBlock["options"]>["max"],
  ) => onOptionsChange({ ...options, max });
  const handleStepChange = (
    step?: NonNullable<NumberInputBlock["options"]>["step"],
  ) => onOptionsChange({ ...options, step });
  const handleStyleChange = (style: NumberInputStyle) =>
    onOptionsChange({ ...options, style });
  const handleUnitChange = (unit: NumberInputUnit) =>
    onOptionsChange({ ...options, unit });
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
          defaultNumberInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultNumberInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <DropdownList
        label={t("blocks.inputs.number.settings.style.label")}
        items={Object.values(NumberInputStyle).map((style) => ({
          label: t(numberStyleTranslationKeys[style]),
          value: style,
        }))}
        currentItem={options?.style}
        onItemSelect={(value) => handleStyleChange(value as NumberInputStyle)}
      />
      {options?.style === NumberInputStyle.CURRENCY && (
        <FormControl>
          <FormLabel>
            {t("blocks.inputs.number.settings.currency.label")}
          </FormLabel>
          <Select
            items={Object.values(Currency).map((currency) => ({
              label: currencyDisplayNames[currency],
              value: currency,
            }))}
            onSelect={(value) => handleCurrencyChange(value as Currency)}
            placeholder={t("blocks.inputs.number.settings.currency.label")}
            selectedItem={options?.currency}
          />
        </FormControl>
      )}
      {options?.style === NumberInputStyle.UNIT && (
        <FormControl>
          <FormLabel>{t("blocks.inputs.number.settings.unit.label")}</FormLabel>
          <Select
            items={Object.values(NumberInputUnit).map((unit) => ({
              label: t(unitTranslationKeys[unit]),
              value: unit,
            }))}
            onSelect={(value) => handleUnitChange(value as NumberInputUnit)}
            placeholder={t("blocks.inputs.number.settings.unit.label")}
            selectedItem={options?.unit}
          />
        </FormControl>
      )}
      <NumberInput
        label={t("blocks.inputs.settings.min.label")}
        defaultValue={options?.min}
        onValueChange={handleMinChange}
      />
      <NumberInput
        label={t("blocks.inputs.settings.max.label")}
        defaultValue={options?.max}
        onValueChange={handleMaxChange}
      />
      <NumberInput
        label={t("blocks.inputs.number.settings.step.label")}
        defaultValue={options?.step}
        onValueChange={handleStepChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  );
};
