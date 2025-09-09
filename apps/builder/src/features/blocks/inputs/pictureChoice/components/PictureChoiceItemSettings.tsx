import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { Textarea, TextInput } from "@/components/inputs";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";
import { useOpenControls } from "@/hooks/useOpenControls";

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
      <Textarea
        label={t("blocks.inputs.settings.description.label")}
        defaultValue={item.description}
        onChange={updateDescription}
      />
      <TextInput
        label={t("blocks.inputs.internalValue.label")}
        moreInfoTooltip={t(
          "blocks.inputs.picture.itemSettings.pictureValue.helperText",
        )}
        defaultValue={item.value}
        onChange={updateValue}
      />
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.settings.displayCondition.label")}
        initialValue={item.displayCondition?.isEnabled ?? false}
        onCheckChange={updateIsDisplayConditionEnabled}
      >
        <ConditionForm
          condition={
            item.displayCondition?.condition ?? {
              comparisons: [],
              logicalOperator: LogicalOperator.AND,
            }
          }
          onConditionChange={updateDisplayCondition}
        />
      </SwitchWithRelatedSettings>
    </Stack>
  );
};
