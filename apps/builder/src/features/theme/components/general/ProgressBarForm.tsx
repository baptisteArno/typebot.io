import { FormLabel, HStack } from "@chakra-ui/react";
import {
  defaultProgressBarBackgroundColor,
  defaultProgressBarColor,
  defaultProgressBarIsEnabled,
  defaultProgressBarPlacement,
  defaultProgressBarPosition,
  defaultProgressBarThickness,
  progressBarPlacements,
  progressBarPositions,
} from "@typebot.io/theme/constants";
import type { ProgressBar } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { ColorPicker } from "@/components/ColorPicker";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";

type Props = {
  typebotVersion: TypebotV6["version"];
  progressBar: ProgressBar | undefined;
  onProgressBarChange: (progressBar: ProgressBar) => void;
};

export const ProgressBarForm = ({
  typebotVersion,
  progressBar,
  onProgressBarChange,
}: Props) => {
  const updateEnabled = (isEnabled: boolean) =>
    onProgressBarChange({ ...progressBar, isEnabled });

  const updateColor = (color: string) =>
    onProgressBarChange({ ...progressBar, color });

  const updatePlacement = (
    placement: (typeof progressBarPlacements)[number] | undefined,
  ) => onProgressBarChange({ ...progressBar, placement });

  const updatePosition = (
    position: (typeof progressBarPositions)[number] | undefined,
  ) => onProgressBarChange({ ...progressBar, position });

  const updateThickness = (thickness?: number) =>
    onProgressBarChange({ ...progressBar, thickness });

  const updateBackgroundColor = (backgroundColor: string) =>
    onProgressBarChange({ ...progressBar, backgroundColor });

  return (
    <Field.Container>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={progressBar?.isEnabled ?? defaultProgressBarIsEnabled}
          onCheckedChange={updateEnabled}
        />
        <Field.Label>Enable progress bar</Field.Label>
      </Field.Root>
      {(progressBar?.isEnabled ?? defaultProgressBarIsEnabled) && (
        <>
          <Field.Root className="flex-row">
            <Field.Label>Placement:</Field.Label>
            <BasicSelect
              value={progressBar?.placement}
              defaultValue={defaultProgressBarPlacement}
              onChange={updatePlacement}
              items={progressBarPlacements}
            />
          </Field.Root>

          <HStack justifyContent="space-between">
            <FormLabel mb="0" mr="0">
              Background color:
            </FormLabel>
            <ColorPicker
              defaultValue={
                progressBar?.backgroundColor ??
                defaultProgressBarBackgroundColor[typebotVersion]
              }
              onColorChange={updateBackgroundColor}
            />
          </HStack>
          <HStack justifyContent="space-between">
            <FormLabel mb="0" mr="0">
              Color:
            </FormLabel>
            <ColorPicker
              defaultValue={
                progressBar?.color ?? defaultProgressBarColor[typebotVersion]
              }
              onColorChange={updateColor}
            />
          </HStack>
          <Field.Root className="flex-row">
            <Field.Label>Thickness:</Field.Label>
            <BasicNumberInput
              withVariableButton={false}
              defaultValue={
                progressBar?.thickness ?? defaultProgressBarThickness
              }
              onValueChange={updateThickness}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              Position when embedded
              <MoreInfoTooltip>
                Select "fixed" to always position the progress bar at the top of
                the window even though your bot is embedded. Select "absolute"
                to position the progress bar at the top of the chat container.
              </MoreInfoTooltip>
            </Field.Label>
            <BasicSelect
              value={progressBar?.position}
              defaultValue={defaultProgressBarPosition}
              onChange={updatePosition}
              items={progressBarPositions}
            />
          </Field.Root>
        </>
      )}
    </Field.Container>
  );
};
