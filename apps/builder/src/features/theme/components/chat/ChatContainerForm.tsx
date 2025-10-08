import { FormLabel, HStack, Stack } from "@chakra-ui/react";
import {
  defaultBlur,
  defaultContainerBackgroundColor,
  defaultContainerMaxHeight,
  defaultContainerMaxWidth,
  defaultOpacity,
  defaultRoundness,
} from "@typebot.io/theme/constants";
import { isChatContainerLight } from "@typebot.io/theme/helpers/isChatContainerLight";
import type { ChatTheme, GeneralTheme } from "@typebot.io/theme/schemas";
import { colors } from "@typebot.io/ui/colors";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { ContainerThemeForm } from "./ContainerThemeForm";

type Props = {
  generalBackground: GeneralTheme["background"];
  container: ChatTheme["container"];
  onContainerChange: (container: ChatTheme["container"] | undefined) => void;
};

export const ChatContainerForm = ({
  generalBackground,
  container,
  onContainerChange,
}: Props) => {
  const updateMaxWidth = (maxWidth?: number) =>
    updateDimension("maxWidth", maxWidth, maxWidthUnit);

  const updateMaxWidthUnit = (unit: string) =>
    updateDimension("maxWidth", maxWidth, unit);

  const updateMaxHeight = (maxHeight?: number) =>
    updateDimension("maxHeight", maxHeight, maxHeightUnit);

  const updateMaxHeightUnit = (unit: string) =>
    updateDimension("maxHeight", maxHeight, unit);

  const updateDimension = (
    dimension: "maxWidth" | "maxHeight",
    value: number | undefined,
    unit: string,
  ) =>
    onContainerChange({
      ...container,
      [dimension]: `${value}${unit}`,
    });

  const { value: maxWidth, unit: maxWidthUnit } = parseValueAndUnit(
    container?.maxWidth ?? defaultContainerMaxWidth,
  );

  const { value: maxHeight, unit: maxHeightUnit } = parseValueAndUnit(
    container?.maxHeight ?? defaultContainerMaxHeight,
  );

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Max width:
        </FormLabel>
        <HStack>
          <BasicNumberInput
            className="max-w-40"
            defaultValue={maxWidth}
            min={0}
            step={10}
            withVariableButton={false}
            onValueChange={updateMaxWidth}
          />
          <BasicSelect
            size="sm"
            items={["px", "%", "vh", "vw"]}
            value={maxWidthUnit}
            onChange={updateMaxWidthUnit}
          />
        </HStack>
      </HStack>

      <HStack justifyContent="space-between">
        <FormLabel mb="0" mr="0">
          Max height:
        </FormLabel>
        <HStack>
          <BasicNumberInput
            className="max-w-40"
            defaultValue={maxHeight}
            min={0}
            step={10}
            onValueChange={updateMaxHeight}
            withVariableButton={false}
          />
          <BasicSelect
            size="sm"
            items={["px", "%", "vh", "vw"]}
            value={maxHeightUnit}
            onChange={updateMaxHeightUnit}
          />
        </HStack>
      </HStack>

      <ContainerThemeForm
        theme={container}
        defaultTheme={{
          backgroundColor: defaultContainerBackgroundColor,
          border: {
            roundeness: defaultRoundness,
          },
          blur: defaultBlur,
          opacity: defaultOpacity,
          color: isChatContainerLight({
            chatContainer: container,
            generalBackground,
          })
            ? colors.gray.light["12"]
            : colors.gray.dark["12"],
        }}
        onThemeChange={onContainerChange}
      />
    </Stack>
  );
};

const parseValueAndUnit = (valueWithUnit: string) => {
  const value = Number.parseFloat(valueWithUnit);
  const unit = valueWithUnit.replace(value.toString(), "");
  return { value, unit };
};
