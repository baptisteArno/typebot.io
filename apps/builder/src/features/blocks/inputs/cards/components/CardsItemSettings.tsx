import { useTranslate } from "@tolgee/react";
import type { CardsItem } from "@typebot.io/blocks-inputs/cards/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";

type Props = {
  options: CardsItem["options"];
  onSettingsChange: (updates: CardsItem["options"]) => void;
};

export const CardsItemSettings = ({ options, onSettingsChange }: Props) => {
  const { t } = useTranslate();

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...options,
      displayCondition: {
        ...options?.displayCondition,
        isEnabled,
      },
    });

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...options,
      displayCondition: {
        ...options?.displayCondition,
        condition,
      },
    });

  const updateButtonValue = (value: string) =>
    onSettingsChange({
      ...options,
      internalValue: value,
    });

  return (
    <div className="flex flex-col gap-4">
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={options?.displayCondition?.isEnabled ?? false}
            onCheckedChange={updateIsDisplayConditionEnabled}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.displayCondition.label")}
          </Field.Label>
        </Field.Root>
        {(options?.displayCondition?.isEnabled ?? false) && (
          <ConditionForm
            condition={
              options?.displayCondition?.condition ?? {
                comparisons: [],
                logicalOperator: LogicalOperator.AND,
              }
            }
            onConditionChange={updateDisplayCondition}
          />
        )}
      </Field.Container>
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.internalValue.label")}
          <MoreInfoTooltip>
            {t("blocks.inputs.button.buttonSettings.internalValue.helperText")}
          </MoreInfoTooltip>
        </Field.Label>
        <DebouncedTextInputWithVariablesButton
          defaultValue={options?.internalValue ?? undefined}
          onValueChange={updateButtonValue}
        />
      </Field.Root>
    </div>
  );
};
