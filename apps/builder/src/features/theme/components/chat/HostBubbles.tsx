import { Flex, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
} from "@typebot.io/theme/constants";
import type { ContainerTheme } from "@typebot.io/theme/schemas";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import React from "react";
import { ColorPicker } from "../../../../components/ColorPicker";

type Props = {
  typebotVersion: TypebotV6["version"];
  hostBubbles: ContainerTheme | undefined;
  onHostBubblesChange: (hostBubbles: ContainerTheme | undefined) => void;
};

export const HostBubbles = ({
  typebotVersion,
  hostBubbles,
  onHostBubblesChange,
}: Props) => {
  const { t } = useTranslate();

  const handleBackgroundChange = (backgroundColor: string) =>
    onHostBubblesChange({ ...hostBubbles, backgroundColor });
  const handleTextChange = (color: string) =>
    onHostBubblesChange({ ...hostBubbles, color });

  return (
    <Stack data-testid="host-bubbles-theme">
      <Flex justify="space-between" align="center">
        <Text>{t("theme.sideMenu.chat.theme.background")}</Text>
        <ColorPicker
          value={
            hostBubbles?.backgroundColor ??
            defaultHostBubblesBackgroundColor[typebotVersion]
          }
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t("theme.sideMenu.chat.theme.text")}</Text>
        <ColorPicker
          value={hostBubbles?.color ?? defaultHostBubblesColor}
          onColorChange={handleTextChange}
        />
      </Flex>
    </Stack>
  );
};
