import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Code, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { defaultButtonsBackgroundColor } from "@typebot.io/theme/constants";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { JavascriptBubbleSnippet } from "../JavascriptBubbleSnippet";

export const parseDefaultBubbleTheme = (typebot?: Typebot) => ({
  button: {
    backgroundColor:
      typebot?.theme.chat?.buttons?.backgroundColor ??
      defaultButtonsBackgroundColor,
  },
});

export const JavascriptBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    parseDefaultBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={typebot?.theme.chat?.hostAvatar?.url ?? ""}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>
        Paste this anywhere in the <Code>{"<body>"}</Code>:
      </Text>
      <JavascriptBubbleSnippet theme={theme} previewMessage={previewMessage} />
    </Stack>
  );
};
