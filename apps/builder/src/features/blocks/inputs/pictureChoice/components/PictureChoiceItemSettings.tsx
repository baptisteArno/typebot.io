import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { TextInput } from "@/components/inputs/TextInput";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";

type Props = {
  workspaceId: string;
  typebotId: string;
  blockId: string;
  item: PictureChoiceItem;
  onItemChange: (updates: Partial<PictureChoiceItem>) => void;
};

export const PictureChoiceItemSettings = ({
  workspaceId,
  typebotId,
  blockId,
  item,
  onItemChange,
}: Props) => {
  const { t } = useTranslate();
  const imageUploadPopoverControls = useOpenControls();

  const updateTitle = (title: string) => onItemChange({ ...item, title });

  const updateImage = (pictureSrc: string) => {
    onItemChange({ ...item, pictureSrc });
  };

  const updateDescription = (description: string) =>
    onItemChange({ ...item, description });

  const updateValue = (value: string) => onItemChange({ ...item, value });

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onItemChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    });

  const updateDisplayCondition = (condition: Condition) =>
    onItemChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    });

  return (
    <Stack spacing={4}>
      <HStack>
        <Text fontWeight="medium">
          {t("blocks.inputs.picture.itemSettings.image.label")}
        </Text>
        <Popover.Root {...imageUploadPopoverControls}>
          <Popover.Trigger>
            <Button size="sm" variant="secondary">
              {item.pictureSrc
                ? t("blocks.inputs.picture.itemSettings.image.change.label")
                : t("blocks.inputs.picture.itemSettings.image.pick.label")}
            </Button>
          </Popover.Trigger>
          <Popover.Popup>
            <ImageUploadContent
              uploadFileProps={{
                workspaceId,
                typebotId,
                blockId,
                itemId: item.id,
              }}
              defaultUrl={item.pictureSrc}
              onSubmit={(url) => {
                updateImage(url);
                imageUploadPopoverControls.onClose();
              }}
              additionalTabs={{
                giphy: true,
                unsplash: true,
                icon: true,
              }}
            />
          </Popover.Popup>
        </Popover.Root>
      </HStack>
      <TextInput
        label={t("blocks.inputs.picture.itemSettings.title.label")}
        defaultValue={item.title}
        onChange={updateTitle}
      />
      <Field.Root>
        <Field.Label>
          {t("blocks.inputs.settings.description.label")}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextareaWithVariablesButton
              {...props}
              defaultValue={item.description}
              onValueChange={updateDescription}
            />
          )}
        />
      </Field.Root>
      <TextInput
        label={t("blocks.inputs.internalValue.label")}
        moreInfoTooltip={t(
          "blocks.inputs.picture.itemSettings.pictureValue.helperText",
        )}
        defaultValue={item.value}
        onChange={updateValue}
      />
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={item.displayCondition?.isEnabled ?? false}
            onCheckedChange={updateIsDisplayConditionEnabled}
          />
          <Field.Label className="font-medium">
            {t("blocks.inputs.settings.displayCondition.label")}
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
    </Stack>
  );
};
