import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { JavascriptBubbleSnippet } from "../../Javascript/JavascriptBubbleSnippet";
import { parseDefaultBubbleTheme } from "../../Javascript/instructions/JavascriptBubbleInstructions";

export const ShopifyBubbleInstructions = () => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    parseDefaultBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        On your shop dashboard in the <Code>Themes</Code> page, click on{" "}
        <Code>Actions {">"} Edit code</Code>
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
            In <Code>Layout {">"} theme.liquid</Code> file, paste this code just
            before the closing <Code>{"<head>"}</Code> tag:
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
