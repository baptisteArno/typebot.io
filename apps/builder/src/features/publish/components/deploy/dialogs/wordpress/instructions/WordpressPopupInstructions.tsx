import { TextLink } from "@/components/TextLink";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import packageJson from "../../../../../../../../../../packages/embeds/js/package.json";
import { PopupSettings } from "../../../settings/PopupSettings";
import { parseInitPopupCode } from "../../../snippetParsers/popup";
import { typebotCloudLibraryVersion } from "./constants";

type Props = {
  publicId: string;
  customDomain?: string;
};
export const WordpressPopupInstructions = ({
  publicId,
  customDomain,
}: Props) => {
  const [autoShowDelay, setAutoShowDelay] = useState<number>();

  const initCode = parseInitPopupCode({
    typebot: publicId,
    customDomain,
    autoShowDelay,
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
          <PopupSettings
            onUpdateSettings={(settings) =>
              setAutoShowDelay(settings.autoShowDelay)
            }
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
