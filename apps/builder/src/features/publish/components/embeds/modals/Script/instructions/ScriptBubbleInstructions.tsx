import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import {
  parseApiHostValue,
  parseInitBubbleCode,
  parseInlineScript,
  typebotImportCode,
} from "../../../snippetParsers";
import { parseDefaultBubbleTheme } from "../../Javascript/instructions/JavascriptBubbleInstructions";

export const ScriptBubbleInstructions = () => {
  const { typebot } = useTypebot();
  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    parseDefaultBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  const scriptSnippet = parseInlineScript(
    `${typebotImportCode}

${parseInitBubbleCode({
  typebot: typebot?.publicId ?? "",
  apiHost: parseApiHostValue(typebot?.customDomain),
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
