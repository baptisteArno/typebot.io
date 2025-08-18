import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { parseInitBubbleCode } from "../../../snippetParsers/bubble";
import {
  parseInlineScript,
  typebotImportCode,
} from "../../../snippetParsers/shared";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";

export const ScriptBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  const scriptSnippet = parseInlineScript(
    `${typebotImportCode}

${parseInitBubbleCode({
  typebot: typebot?.publicId ?? "",
  customDomain: typebot?.customDomain,
  theme,
  previewMessage,
})}`,
  );

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={typebot?.theme.chat?.hostAvatar?.url ?? ""}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>Run this script to initialize the typebot:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  );
};
