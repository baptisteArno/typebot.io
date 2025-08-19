import { useOpenControls } from "@/hooks/useOpenControls";
import {
  Box,
  Button,
  type ButtonProps,
  Center,
  Input,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Popover } from "@typebot.io/ui/components/Popover";
import React, { useState } from "react";
import tinyColor from "tinycolor2";
import { useDebouncedCallback } from "use-debounce";

const colorsSelection: `#${string}`[] = [
  "#666460",
  "#FFFFFF",
  "#A87964",
  "#D09C46",
  "#DE8031",
  "#598E71",
  "#4A8BB2",
  "#9B74B7",
  "#C75F96",
  "#0042DA",
];

type Props = {
  value?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  onColorChange: (color: string) => void;
  side?: "top" | "bottom" | "left" | "right";
};

export const ColorPicker = ({
  value,
  defaultValue,
  isDisabled,
  side = "right",
  onColorChange,
}: Props) => {
  const { t } = useTranslate();
  const [color, setColor] = useState(defaultValue ?? "");
  const displayedValue = value ?? color;
  const controls = useOpenControls();

  const handleColorChange = (color: string) => {
    setColor(color);
    onColorChange(color);
  };

  const handleClick = (color: string) => () => {
    setColor(color);
    onColorChange(color);
  };

  return (
    <Popover.Root {...controls}>
      <Popover.Trigger>
        <Button
          aria-label={t("colorPicker.pickColor.ariaLabel")}
          height="22px"
          width="22px"
          padding={0}
          borderRadius={3}
          borderWidth={1}
          isDisabled={isDisabled}
        >
          <Box rounded="full" boxSize="14px" bgColor={displayedValue} />
        </Button>
      </Popover.Trigger>
      <Popover.Popup className="p-0 max-w-48" side={side}>
        <div
          className="h-24"
          style={{
            backgroundColor: displayedValue,
            color: tinyColor(displayedValue).isLight() ? "gray.900" : "white",
          }}
        >
          <Center height="100%">{displayedValue}</Center>
        </div>
        <Stack p="2">
          <SimpleGrid columns={5} spacing={2}>
            {colorsSelection.map((color) => (
              <Button
                key={color}
                aria-label={color}
                background={color}
                height="22px"
                width="22px"
                padding={0}
                minWidth="unset"
                borderRadius={3}
                borderWidth={color === "#FFFFFF" ? 1 : undefined}
                _hover={{ background: color }}
                onClick={handleClick(color)}
              />
            ))}
          </SimpleGrid>
          <Input
            borderRadius={3}
            marginTop={3}
            placeholder="#2a9d8f"
            aria-label={t("colorPicker.colorValue.ariaLabel")}
            size="sm"
            value={displayedValue}
            onChange={(e) => handleColorChange(e.target.value)}
          />
          <NativeColorPicker
            size="sm"
            color={displayedValue}
            onColorChange={handleColorChange}
          >
            {t("colorPicker.advancedColors")}
          </NativeColorPicker>
        </Stack>
      </Popover.Popup>
    </Popover.Root>
  );
};

const NativeColorPicker = ({
  color,
  onColorChange,
  ...props
}: {
  color: string;
  onColorChange: (color: string) => void;
} & ButtonProps) => {
  const debouncedOnColorChange = useDebouncedCallback((color: string) => {
    onColorChange(color);
  }, 200);

  return (
    <>
      <Button as="label" htmlFor="native-picker" {...props}>
        {props.children}
      </Button>
      <Input
        type="color"
        display="none"
        id="native-picker"
        value={color}
        onChange={(e) => debouncedOnColorChange(e.target.value)}
      />
    </>
  );
};
