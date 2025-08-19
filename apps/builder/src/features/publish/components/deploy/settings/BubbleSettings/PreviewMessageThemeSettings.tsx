import { ColorPicker } from "@/components/ColorPicker";
import { HStack, Heading, Stack, Text } from "@chakra-ui/react";
import type { PreviewMessageTheme } from "@typebot.io/js";
import {
  defaultPreviewMessageBackgroundColor,
  defaultPreviewMessageCloseButtonBackgroundColor,
  defaultPreviewMessageCloseButtonIconColor,
  defaultPreviewMessageTextColor,
} from "@typebot.io/theme/constants";
import React from "react";

type Props = {
  previewMessageTheme?: PreviewMessageTheme;
  onChange: (newPreviewMessageTheme?: PreviewMessageTheme) => void;
};

export const PreviewMessageThemeSettings = ({
  previewMessageTheme,
  onChange,
}: Props) => {
  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...previewMessageTheme,
      backgroundColor,
    });
  };

  const updateTextColor = (textColor: string) => {
    onChange({
      ...previewMessageTheme,
      textColor,
    });
  };

  const updateCloseButtonBackgroundColor = (
    closeButtonBackgroundColor: string,
  ) => {
    onChange({
      ...previewMessageTheme,
      closeButtonBackgroundColor,
    });
  };

  const updateCloseButtonIconColor = (closeButtonIconColor: string) => {
    onChange({
      ...previewMessageTheme,
      closeButtonIconColor,
    });
  };

  return (
    <Stack spacing={4} borderWidth="1px" rounded="md" p="4">
      <Heading size="sm">Preview message</Heading>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Text>Background color</Text>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.backgroundColor ??
              defaultPreviewMessageBackgroundColor
            }
            onColorChange={updateBackgroundColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Text color</Text>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.textColor ?? defaultPreviewMessageTextColor
            }
            onColorChange={updateTextColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Close button background</Text>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.closeButtonBackgroundColor ??
              defaultPreviewMessageCloseButtonBackgroundColor
            }
            onColorChange={updateCloseButtonBackgroundColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Close icon color</Text>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.closeButtonIconColor ??
              defaultPreviewMessageCloseButtonIconColor
            }
            onColorChange={updateCloseButtonIconColor}
          />
        </HStack>
      </Stack>
    </Stack>
  );
};
