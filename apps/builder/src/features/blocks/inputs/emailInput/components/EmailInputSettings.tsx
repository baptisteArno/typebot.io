import { useTranslate } from "@tolgee/react";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options: EmailInputBlock["options"];
  onOptionsChange: (options: EmailInputBlock["options"]) => void;
};

export const EmailInputSettings = ({ options, onOptionsChange }: Props) => {
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

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.placeholder.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.placeholder ??
            defaultEmailInputOptions.labels.placeholder
          }
          onValueChange={handlePlaceholderChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.labels?.button ?? defaultEmailInputOptions.labels.button
          }
          onValueChange={handleButtonLabelChange}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.retryMessage.label")}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={
            options?.retryMessageContent ??
            defaultEmailInputOptions.retryMessageContent
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
