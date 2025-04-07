import { DropdownList } from "@/components/DropdownList";
import { NumberInput, TextInput } from "@/components/inputs";
import { Select } from "@/components/inputs/Select";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
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
  defaultNumberInputButtonLabel,
  defaultNumberInputPlaceholder,
  defaultNumberInputStyle,
  localeRegex,
  numberStyleTranslationKeys,
  unitTranslationKeys,
} from "@typebot.io/blocks-inputs/number/constants";
import {
  type NumberInputBlock,
  numberInputOptionsSchema,
} from "@typebot.io/blocks-inputs/number/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React, { useEffect } from "react";
import { currencies } from "../../payment/currencies";

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
  });

  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });
  const handleCurrencyChange = (currency: string) =>
    onOptionsChange({
      ...options,
      currency,
    });
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
    onOptionsChange({
      ...options,
      style,
    });
  const handleUnitChange = (unit: NumberInputUnit) =>
    onOptionsChange({ ...options, unit });
  const handleLocaleChange = (locale: string) => {
    const savableLocale = numberInputOptionsSchema.shape.locale.safeParse(
      locale,
    ).success
      ? locale
      : (options?.locale ?? navigator.language);
    onOptionsChange({ ...options, locale: savableLocale });
  };
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ?? defaultNumberInputPlaceholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={options?.labels?.button ?? defaultNumberInputButtonLabel}
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
            <Text w="full" textAlign="left">
              {t("blocks.inputs.number.settings.format.label")}
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <DropdownList
              items={Object.values(NumberInputStyle).map((style) => ({
                label: t(numberStyleTranslationKeys[style]),
                value: style,
              }))}
              currentItem={options?.style ?? defaultNumberInputStyle}
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
                  items={currencies.map(({ code, description }) => ({
                    label: description,
                    value: code,
                  }))}
                  onSelect={(value) => handleCurrencyChange(value as string)}
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
                {t("blocks.inputs.number.settings.locale.label")}
              </FormLabel>
              <TextInput
                defaultValue={options?.locale}
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
