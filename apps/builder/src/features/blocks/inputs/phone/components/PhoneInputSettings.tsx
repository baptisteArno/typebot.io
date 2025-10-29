import { useTranslate } from "@tolgee/react";
import { defaultPhoneInputOptions } from "@typebot.io/blocks-inputs/phone/constants";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { CountryCodeSelect } from "./CountryCodeSelect";

type Props = {
  options: PhoneNumberInputBlock["options"];
  onOptionsChange: (options: PhoneNumberInputBlock["options"]) => void;
};

export const PhoneInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent });
  const handleDefaultCountryChange = (defaultCountryCode: string | undefined) =>
    onOptionsChange({ ...options, defaultCountryCode });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.placeholder.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.placeholder ??
            defaultPhoneInputOptions.labels.placeholder
          }
          onValueChange={handlePlaceholderChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.button ?? defaultPhoneInputOptions.labels.button
          }
          onValueChange={handleButtonLabelChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.phone.settings.defaultCountry.label")}
        </Field.Label>
        <CountryCodeSelect
          onSelect={handleDefaultCountryChange}
          countryCode={options?.defaultCountryCode}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.retryMessage.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.retryMessageContent ??
            defaultPhoneInputOptions.retryMessageContent
          }
          onValueChange={handleRetryMessageChange}
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
