import { useTranslate } from "@tolgee/react";
import {
  defaultNumberInputButtonLabel,
  defaultNumberInputPlaceholder,
  defaultNumberInputStyle,
  localeRegex,
  NumberInputStyle,
  NumberInputUnit,
  numberStyleTranslationKeys,
  unitTranslationKeys,
} from "@typebot.io/blocks-inputs/number/constants";
import {
  type NumberInputBlock,
  numberInputOptionsSchema,
} from "@typebot.io/blocks-inputs/number/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { useEffect } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
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
  const updateCurrency = (currency: string | undefined) =>
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
  const handleStyleChange = (style: NumberInputStyle | undefined) =>
    onOptionsChange({
      ...options,
      style,
    });
  const updateUnit = (unit: NumberInputUnit | undefined) =>
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
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.placeholder.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.placeholder ?? defaultNumberInputPlaceholder
          }
          onValueChange={handlePlaceholderChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.button ?? defaultNumberInputButtonLabel
          }
          onValueChange={handleButtonLabelChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.min.label")}</Field.Label>
        <BasicNumberInput
          defaultValue={options?.min}
          onValueChange={handleMinChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.max.label")}</Field.Label>
        <BasicNumberInput
          defaultValue={options?.max}
          onValueChange={handleMaxChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.number.settings.step.label")}
        </Field.Label>
        <BasicNumberInput
          defaultValue={options?.step}
          onValueChange={handleStepChange}
        />
      </Field.Root>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            <p className="w-full text-left">
              {t("blocks.inputs.number.settings.format.label")}
            </p>
          </Accordion.Trigger>
          <Accordion.Panel>
            <BasicSelect
              items={Object.values(NumberInputStyle).map((style) => ({
                label: t(numberStyleTranslationKeys[style]),
                value: style,
              }))}
              value={options?.style}
              defaultValue={defaultNumberInputStyle}
              onChange={handleStyleChange}
            />
            {options?.style === NumberInputStyle.CURRENCY && (
              <Field.Root>
                <Field.Label>
                  {t("blocks.inputs.number.settings.currency.label")}
                </Field.Label>
                <BasicSelect
                  items={currencies.map(({ code, description }) => ({
                    label: description,
                    value: code,
                  }))}
                  onChange={updateCurrency}
                  value={options?.currency}
                />
              </Field.Root>
            )}
            {options?.style === NumberInputStyle.UNIT && (
              <Field.Root>
                <Field.Label>
                  {t("blocks.inputs.number.settings.unit.label")}
                </Field.Label>
                <BasicSelect
                  items={Object.values(NumberInputUnit).map((unit) => ({
                    label: t(unitTranslationKeys[unit]),
                    value: unit,
                  }))}
                  onChange={updateUnit}
                  value={options?.unit}
                />
              </Field.Root>
            )}
            <Field.Root>
              <Field.Label>
                {t("blocks.inputs.number.settings.locale.label")}
              </Field.Label>
              <Field.Root>
                <DebouncedTextInputWithVariablesButton
                  defaultValue={options?.locale}
                  placeholder="en-US"
                  onValueChange={handleLocaleChange}
                />
                <Field.Description>
                  {t("blocks.inputs.number.settings.locale.helper")}
                </Field.Description>
              </Field.Root>
            </Field.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
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
