import { TextLink } from "@/components/TextLink";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import type { BubbleProps } from "@typebot.io/js";
import { useState } from "react";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { BubbleSettings } from "../../../settings/BubbleSettings/BubbleSettings";
import { parseInitBubbleCode } from "../../../snippetParsers/bubble";
import { getInitialBubbleTheme } from "../../javascript/instructions/JavascriptBubbleInstructions";
import { typebotCloudLibraryVersion } from "./constants";

type Props = {
  publicId: string;
};
export const WordpressBubbleInstructions = ({ publicId }: Props) => {
  const { typebot } = useTypebot();

  const [theme, setTheme] = useState<BubbleProps["theme"]>(
    getInitialBubbleTheme(typebot),
  );
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps["previewMessage"]>();

  const initCode = parseInitBubbleCode({
    typebot: publicId,
    customDomain: typebot?.customDomain,
    theme,
    previewMessage,
  });

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        Install{" "}
        <TextLink href="https://wordpress.org/plugins/typebot/" isExternal>
          the official Typebot WordPress plugin
        </TextLink>
      </ListItem>
      <ListItem>
        Set <Code>Library version</Code> to{" "}
        <Code>
          {isCloudProdInstance()
            ? typebotCloudLibraryVersion
            : packageJson.version}
        </Code>
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
            You can now place the following code snippet in the Typebot panel in
            your WordPress admin:
          </Text>
          <CodeEditor value={initCode} lang="javascript" isReadOnly />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
