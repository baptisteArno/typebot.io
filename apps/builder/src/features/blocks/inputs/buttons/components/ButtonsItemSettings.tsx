import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { TextInput } from "@/components/inputs/TextInput";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";

type Props = {
  item: ButtonItem;
  onSettingsChange: (updates: Omit<ButtonItem, "content">) => void;
};

export const ButtonsItemSettings = ({ item, onSettingsChange }: Props) => {
  const { t } = useTranslate();

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    });

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    });

  const updateButtonValue = (value: string) =>
    onSettingsChange({
      ...item,
      value,
    });

  return (
    <Stack spacing={4}>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={item.displayCondition?.isEnabled ?? false}
            onCheckedChange={updateIsDisplayConditionEnabled}
          />
          <Field.Label>
            {t("blocks.inputs.settings.displayCondition.label")}
            <MoreInfoTooltip>
              {t(
                "blocks.inputs.button.buttonSettings.displayCondition.infoText.label",
              )}
            </MoreInfoTooltip>
          </Field.Label>
        </Field.Root>
        {(item.displayCondition?.isEnabled ?? false) && (
          <ConditionForm
            condition={
              item.displayCondition?.condition ?? {
                comparisons: [],
                logicalOperator: LogicalOperator.AND,
              }
            }
            onConditionChange={updateDisplayCondition}
          />
        )}
      </Field.Container>
      <TextInput
        label={t("blocks.inputs.internalValue.label")}
        moreInfoTooltip={t(
          "blocks.inputs.button.buttonSettings.internalValue.helperText",
        )}
        defaultValue={item.value}
        onChange={updateButtonValue}
      />
    </Stack>
  );
};
