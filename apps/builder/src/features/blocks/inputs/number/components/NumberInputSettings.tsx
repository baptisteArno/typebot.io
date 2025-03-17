import { DropdownList } from "@/components/DropdownList";
import { NumberInput, TextInput } from "@/components/inputs";
import { Select } from "@/components/inputs/Select";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  FormControl,
  FormLabel,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  NumberInputStyle,
  NumberInputUnit,
  defaultNumberInputOptions,
  localeRegex,
  numberStyleTranslationKeys,
  unitTranslationKeys,
} from "@typebot.io/blocks-inputs/number/constants";
import {
  Currency,
  currencyDisplayNames,
} from "@typebot.io/blocks-inputs/number/currencies";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React, { useEffect, useMemo } from "react";

type Props = {
  options: NumberInputBlock["options"];
  onOptionsChange: (options: NumberInputBlock["options"]) => void;
};

export const NumberInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  useEffect(() => {
    if (!options?.locale) {
      const browserLocale = navigator.language;
      if (browserLocale.match(localeRegex)) {
        onOptionsChange({ ...options, locale: browserLocale });
      }
    }
  }, []);

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
  const handleLocaleChange = (locale: string) => {
    const savableLocale = locale.match(localeRegex)
      ? locale
      : (options?.locale ?? navigator.language);
    onOptionsChange({ ...options, locale: savableLocale });
  };
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id });
  };

  const formatAccordionLabel = useMemo(() => {
    if (options?.style === NumberInputStyle.CURRENCY && options?.currency) {
      return currencyDisplayNames[options?.currency as Currency];
    }
    if (options?.style === NumberInputStyle.UNIT && options?.unit) {
      return t(unitTranslationKeys[options?.unit as NumberInputUnit]);
    }
    return t(
      numberStyleTranslationKeys[options?.style ?? NumberInputStyle.DECIMAL],
    );
  }, [options?.style, options?.currency, options?.unit]);

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
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Text>
              {t("blocks.inputs.number.settings.format.label")}
              {` (${formatAccordionLabel})`}
            </Text>
          </AccordionButton>
          <AccordionPanel>
            <DropdownList
              label={t("blocks.inputs.number.settings.style.label")}
              items={Object.values(NumberInputStyle).map((style) => ({
                label: t(numberStyleTranslationKeys[style]),
                value: style,
              }))}
              currentItem={options?.style}
              onItemSelect={(value) =>
                handleStyleChange(value as NumberInputStyle)
              }
            />
            {options?.style === NumberInputStyle.CURRENCY && (
              <FormControl mt={4}>
                <FormLabel>
                  {t("blocks.inputs.number.settings.currency.label")}
                </FormLabel>
                <Select
                  items={Object.values(Currency).map((currency) => ({
                    label: currencyDisplayNames[currency],
                    value: currency,
                  }))}
                  onSelect={(value) => handleCurrencyChange(value as Currency)}
                  placeholder={t(
                    "blocks.inputs.number.settings.currency.label",
                  )}
                  selectedItem={options?.currency}
                />
              </FormControl>
            )}
            {options?.style === NumberInputStyle.UNIT && (
              <FormControl mt={4}>
                <FormLabel>
                  {t("blocks.inputs.number.settings.unit.label")}
                </FormLabel>
                <Select
                  items={Object.values(NumberInputUnit).map((unit) => ({
                    label: t(unitTranslationKeys[unit]),
                    value: unit,
                  }))}
                  onSelect={(value) =>
                    handleUnitChange(value as NumberInputUnit)
                  }
                  placeholder={t("blocks.inputs.number.settings.unit.label")}
                  selectedItem={options?.unit}
                />
              </FormControl>
            )}
            <FormControl mt={4}>
              <FormLabel>
                {t("blocks.inputs.number.settings.locale.label", {
                  defaultValue: "Locale",
                })}
              </FormLabel>
              <TextInput
                defaultValue={options?.locale ?? navigator.language}
                helperText={t("blocks.inputs.number.settings.locale.helper")}
                placeholder="en-US"
                onChange={handleLocaleChange}
              />
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
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
