import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { FrontendTypebotV6 } from "@/features/editor/providers/TypebotProvider";
import { Code, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import {
  BackgroundType,
  defaultBackgroundColor,
  defaultBackgroundType,
} from "@typebot.io/theme/constants";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { colors } from "@typebot.io/ui/colors";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { JavascriptBubbleSnippet } from "../JavascriptBubbleSnippet";

export const getInitialBubbleTheme = (
  typebot?: Typebot,
): BubbleProps["theme"] => {
  return {
    chatWindow: {
      backgroundColor:
        (typebot?.theme.general?.background?.type ?? defaultBackgroundType) ===
        BackgroundType.COLOR
          ? (typebot?.theme.general?.background?.content ??
            defaultBackgroundColor[
              (typebot?.version ?? "6.1") as keyof typeof defaultBackgroundColor
            ])
          : undefined,
    },
    button: {
      backgroundColor:
        typebot?.theme.chat?.buttons?.backgroundColor ?? colors.gray.dark["2"],
    },
  };
};

export const JavascriptBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
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
