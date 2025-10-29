import { useTranslate } from "@tolgee/react";
import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  options: RatingInputBlock["options"];
  onOptionsChange: (options: RatingInputBlock["options"]) => void;
};

export const RatingInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const handleLengthChange = (length: string | undefined) =>
    onOptionsChange({
      ...options,
      length: length ? Number(length) : undefined,
    });

  const handleTypeChange = (buttonType: "Icons" | "Numbers") =>
    onOptionsChange({ ...options, buttonType });

  const handleCustomIconCheck = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, isEnabled },
    });

  const handleIconSvgChange = (svg: string) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, svg },
    });

  const handleLeftLabelChange = (left: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, left } });

  const handleRightLabelChange = (right: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, right } });

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });

  const handleOneClickSubmitChange = (isOneClickSubmitEnabled: boolean) =>
    onOptionsChange({ ...options, isOneClickSubmitEnabled });

  const updateStartsAt = (startsAt: number | `{{${string}}}` | undefined) =>
    onOptionsChange({ ...options, startsAt });

  const isOneClickSubmitEnabled =
    options?.isOneClickSubmitEnabled ??
    defaultRatingInputOptions.isOneClickSubmitEnabled;

  const buttonType =
    options?.buttonType ?? defaultRatingInputOptions.buttonType;
  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.rating.settings.maximum.label")}
        </Field.Label>
        <BasicSelect
          value={options?.length?.toString()}
          defaultValue={defaultRatingInputOptions.length.toString()}
          onChange={handleLengthChange}
          items={["3", "4", "5", "6", "7", "8", "9", "10"]}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.rating.settings.type.label")}
        </Field.Label>
        <BasicSelect
          items={["Icons", "Numbers"]}
          value={buttonType}
          onChange={handleTypeChange}
        />
      </Field.Root>
      {buttonType === "Numbers" && (
        <Field.Root className="flex-row">
          <Field.Label>Starts at</Field.Label>
          <BasicNumberInput
            defaultValue={
              options?.startsAt ?? defaultRatingInputOptions.startsAt
            }
            onValueChange={updateStartsAt}
          />
        </Field.Root>
      )}
      {buttonType === "Icons" && (
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.customIcon?.isEnabled ??
              defaultRatingInputOptions.customIcon.isEnabled
            }
            onCheckedChange={handleCustomIconCheck}
          />
          <Field.Label>
            {t("blocks.inputs.rating.settings.customIcon.label")}
          </Field.Label>
        </Field.Root>
      )}
      {buttonType === "Icons" && options?.customIcon?.isEnabled && (
        <Field.Root>
          <Field.Label>
            {t("blocks.inputs.rating.settings.iconSVG.label")}
          </Field.Label>
          <DebouncedTextInputWithVariablesButton
            defaultValue={options.customIcon.svg}
            onValueChange={handleIconSvgChange}
            placeholder="<svg>...</svg>"
          />
        </Field.Root>
      )}
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.rating.settings.rateLabel.label", {
            rate:
              buttonType === "Icons"
                ? "1"
                : (options?.startsAt ?? defaultRatingInputOptions.startsAt),
          })}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.labels?.left}
          onValueChange={handleLeftLabelChange}
          placeholder={t(
            "blocks.inputs.rating.settings.notLikely.placeholder.label",
          )}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.rating.settings.rateLabel.label", {
            rate: options?.length ?? defaultRatingInputOptions.length,
          })}
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.labels?.right}
          onValueChange={handleRightLabelChange}
          placeholder={t(
            "blocks.inputs.rating.settings.extremelyLikely.placeholder.label",
          )}
        />
      </Field.Root>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={isOneClickSubmitEnabled}
          onCheckedChange={handleOneClickSubmitChange}
        />
        <Field.Label>
          {t("blocks.inputs.rating.settings.oneClickSubmit.label")}
        </Field.Label>
      </Field.Root>
      {!isOneClickSubmitEnabled && (
        <Field.Root>
          <Field.Label>{t("blocks.inputs.settings.button.label")}</Field.Label>
          <DebouncedTextInputWithVariablesButton
            defaultValue={
              options?.labels?.button ?? defaultRatingInputOptions.labels.button
            }
            onValueChange={handleButtonLabelChange}
          />
        </Field.Root>
      )}
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
