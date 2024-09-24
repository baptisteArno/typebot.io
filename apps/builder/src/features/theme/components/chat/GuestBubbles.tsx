import { Flex, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
} from "@typebot.io/theme/constants";
import type { ContainerTheme } from "@typebot.io/theme/schemas";
import React from "react";
import { ColorPicker } from "../../../../components/ColorPicker";

type Props = {
  guestBubbles: ContainerTheme | undefined;
  onGuestBubblesChange: (hostBubbles: ContainerTheme | undefined) => void;
};

export const GuestBubbles = ({ guestBubbles, onGuestBubblesChange }: Props) => {
  const { t } = useTranslate();

  const updateBackground = (backgroundColor: string) =>
    onGuestBubblesChange({ ...guestBubbles, backgroundColor });

  const updateText = (color: string) =>
    onGuestBubblesChange({ ...guestBubbles, color });

  return (
    <Stack data-testid="guest-bubbles-theme">
      <Flex justify="space-between" align="center">
        <Text>{t("theme.sideMenu.chat.theme.background")}</Text>
        <ColorPicker
          value={
            guestBubbles?.backgroundColor ?? defaultGuestBubblesBackgroundColor
          }
          onColorChange={updateBackground}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t("theme.sideMenu.chat.theme.text")}</Text>
        <ColorPicker
          value={guestBubbles?.color ?? defaultGuestBubblesColor}
          onColorChange={updateText}
        />
      </Flex>
    </Stack>
  );
};
