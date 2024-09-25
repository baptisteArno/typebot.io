import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { parseDefaultBubbleTheme } from "../../Javascript/instructions/JavascriptBubbleInstructions";
import { InstallNextjsPackageSnippet } from "../InstallNextjsPackageSnippet";
import { NextjsBubbleSnippet } from "../NextjsBubbleSnippet";

export const NextjsBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    parseDefaultBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <Text>Install the packages</Text>
          <InstallNextjsPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            theme={theme}
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ""
            }
            onThemeChange={setTheme}
            onPreviewMessageChange={setPreviewMessage}
          />
          <NextjsBubbleSnippet theme={theme} previewMessage={previewMessage} />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
