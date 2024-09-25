import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { JavascriptBubbleSnippet } from "../../Javascript/JavascriptBubbleSnippet";
import { parseDefaultBubbleTheme } from "../../Javascript/instructions/JavascriptBubbleInstructions";

export const WebflowBubbleInstructions = () => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    parseDefaultBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Press <Code>A</Code> to open the <Code>Add elements</Code> panel
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <BubbleSettings
            previewMessage={previewMessage}
            defaultPreviewMessageAvatar={
              typebot?.theme.chat?.hostAvatar?.url ?? ""
            }
            theme={theme}
            onPreviewMessageChange={setPreviewMessage}
            onThemeChange={setTheme}
          />
          <Text>
            Add an <Code>Embed</Code> element from the <Code>components</Code>{" "}
            section and paste this code:
          </Text>
          <JavascriptBubbleSnippet
            theme={theme}
            previewMessage={previewMessage}
          />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
